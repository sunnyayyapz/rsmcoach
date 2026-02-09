import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message, Problem, Session, TutoringState } from '@/types/coach';
import { toast } from 'sonner';

interface AnalysisResult {
  extractedText: string;
  confidence: number;
  topics: string[];
  concepts: string[];
  gradeEstimate: string;
  safeRephrase: string;
  problemType: string;
}

export function useCoach() {
  const [state, setState] = useState<TutoringState>({
    currentPhase: 'upload',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    try {
      // Convert file to base64
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call analyze-problem edge function with image
      const { data, error } = await supabase.functions.invoke<AnalysisResult>('analyze-problem', {
        body: { imageBase64: dataUrl }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error('Failed to analyze image. Please try again or type the problem manually.');
        return;
      }

      if (!data) {
        toast.error('No response from analysis. Please try again.');
        return;
      }

      const problem: Problem = {
        id: Date.now().toString(),
        originalImage: dataUrl,
        ocrText: data.extractedText,
        editedText: data.extractedText,
        confidence: data.confidence,
        topics: data.topics,
        concepts: data.concepts,
        gradeEstimate: data.gradeEstimate,
        safeRephrase: data.safeRephrase,
        problemType: data.problemType,
      };

      setState({
        currentPhase: 'ocr-review',
        problem,
      });
    } catch (err) {
      console.error('Process image error:', err);
      toast.error('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processTypedProblem = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      // Call analyze-problem edge function with text
      const { data, error } = await supabase.functions.invoke<AnalysisResult>('analyze-problem', {
        body: { textInput: text }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error('Failed to analyze problem. Please try again.');
        return;
      }

      if (!data) {
        toast.error('No response from analysis. Please try again.');
        return;
      }

      const problem: Problem = {
        id: Date.now().toString(),
        ocrText: text,
        editedText: text,
        confidence: 1,
        topics: data.topics,
        concepts: data.concepts,
        gradeEstimate: data.gradeEstimate,
        safeRephrase: data.safeRephrase,
        problemType: data.problemType,
      };

      setState({
        currentPhase: 'ocr-review',
        problem,
      });
    } catch (err) {
      console.error('Process typed problem error:', err);
      toast.error('Failed to analyze problem. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const confirmProblem = useCallback(async (editedText: string) => {
    if (!state.problem) return;

    const updatedProblem = { ...state.problem, editedText };
    
    const welcomeMessage: Message = {
      id: '1',
      role: 'coach',
      content: `Great! Let's work on this together.\n\n**${editedText}**\n\nLet's start: **What do we know from this problem, and what are we trying to find?**`,
      timestamp: new Date(),
      type: 'text',
    };

    const session: Session = {
      id: Date.now().toString(),
      problem: updatedProblem,
      messages: [welcomeMessage],
      hintsUsed: 0,
      strategiesTried: [],
      startTime: new Date(),
    };

    setHintsUsed(0);
    setState({
      currentPhase: 'tutoring',
      problem: updatedProblem,
      session,
    });
  }, [state.problem]);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.session || !state.problem) return;

    const studentMessage: Message = {
      id: Date.now().toString(),
      role: 'student',
      content,
      timestamp: new Date(),
      type: 'text',
    };

    // Add student message immediately
    const updatedMessages = [...state.session.messages, studentMessage];
    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        messages: updatedMessages,
      } : undefined,
    }));

    setIsProcessing(true);
    try {
      // Call tutoring-chat edge function
      const { data, error } = await supabase.functions.invoke<{ content: string }>('tutoring-chat', {
        body: { 
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          problem: state.problem
        }
      });

      if (error) {
        console.error('Chat error:', error);
        toast.error('Failed to get response. Please try again.');
        return;
      }

      const responseContent = data?.content || "Let's think about this step by step. What do you notice about the problem?";

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        content: responseContent,
        timestamp: new Date(),
        type: 'text',
      };

      setState(prev => ({
        ...prev,
        session: prev.session ? {
          ...prev.session,
          messages: [...prev.session.messages, coachMessage],
        } : undefined,
      }));
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.session, state.problem]);

  const requestHint = useCallback(async () => {
    if (!state.session || !state.problem || hintsUsed >= 3) return;

    const nextLevel = (hintsUsed + 1) as 1 | 2 | 3;
    
    setIsProcessing(true);
    try {
      // Call tutoring-chat with hint action
      const { data, error } = await supabase.functions.invoke<{ content: string }>('tutoring-chat', {
        body: { 
          messages: state.session.messages.map(m => ({ role: m.role, content: m.content })),
          problem: state.problem,
          hintLevel: nextLevel,
          action: 'hint'
        }
      });

      if (error) {
        console.error('Hint error:', error);
        toast.error('Failed to get hint. Please try again.');
        return;
      }

      const hintContent = data?.content || "Let me give you a hint. Think about the key relationships in this problem.";

      const hintMessage: Message = {
        id: Date.now().toString(),
        role: 'coach',
        content: hintContent,
        timestamp: new Date(),
        type: 'hint',
        hintLevel: nextLevel,
      };

      setHintsUsed(nextLevel);
      setState(prev => ({
        ...prev,
        session: prev.session ? {
          ...prev.session,
          messages: [...prev.session.messages, hintMessage],
          hintsUsed: nextLevel,
        } : undefined,
      }));
    } catch (err) {
      console.error('Request hint error:', err);
      toast.error('Failed to get hint. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [state.session, state.problem, hintsUsed]);

  const endSession = useCallback(async () => {
    if (!state.session) return;

    setIsProcessing(true);
    try {
      // Call session-reflection edge function
      const { data, error } = await supabase.functions.invoke<{
        conceptsPracticed: string[];
        strategiesUsed: string[];
        reflectionQuestions: string[];
      }>('session-reflection', {
        body: { 
          problem: state.problem,
          messages: state.session.messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) {
        console.error('Reflection error:', error);
        // Use fallback reflection
      }

      const reflection = data || {
        conceptsPracticed: state.problem?.concepts || ["Problem Solving"],
        strategiesUsed: ["Working through the problem step by step"],
        reflectionQuestions: [
          "What was the key insight that helped you understand this problem?",
          "Where else might you use this type of thinking?",
          "What would you do differently if you saw a similar problem?"
        ]
      };

      const finalSession: Session = {
        ...state.session,
        endTime: new Date(),
        reflection,
      };

      setState({
        currentPhase: 'summary',
        problem: state.problem,
        session: finalSession,
      });
    } catch (err) {
      console.error('End session error:', err);
      // Still end the session with fallback reflection
      const finalSession: Session = {
        ...state.session,
        endTime: new Date(),
        reflection: {
          conceptsPracticed: state.problem?.concepts || ["Problem Solving"],
          strategiesUsed: ["Working through the problem step by step"],
          reflectionQuestions: [
            "What was the key insight that helped you understand this problem?",
            "Where else might you use this type of thinking?",
            "What would you do differently if you saw a similar problem?"
          ]
        },
      };

      setState({
        currentPhase: 'summary',
        problem: state.problem,
        session: finalSession,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [state.session, state.problem]);

  const startNewSession = useCallback(() => {
    setState({ currentPhase: 'upload' });
    setHintsUsed(0);
  }, []);

  const goBack = useCallback(() => {
    if (state.currentPhase === 'ocr-review') {
      setState({ currentPhase: 'upload' });
    } else if (state.currentPhase === 'tutoring') {
      setState(prev => ({
        ...prev,
        currentPhase: 'ocr-review',
      }));
    }
  }, [state.currentPhase]);

  return {
    state,
    isProcessing,
    hintsUsed,
    processImage,
    processTypedProblem,
    confirmProblem,
    sendMessage,
    requestHint,
    endSession,
    startNewSession,
    goBack,
  };
}
