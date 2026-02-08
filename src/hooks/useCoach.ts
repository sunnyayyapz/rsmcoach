import { useState, useCallback } from 'react';
import type { Message, Problem, Session, TutoringState } from '@/types/coach';
import { 
  SYSTEM_PROMPT, 
  ANALYSIS_PROMPT, 
  HINT_PROMPTS, 
  REFLECTION_PROMPT,
  detectAnswerSeeking,
  detectConfirmationSeeking,
  detectNearFinal,
  detectStuck,
  detectAnswerLeaking,
  getRandomRefusal,
  getRandomPersistence,
} from '@/lib/prompts';

// Simulated OCR - in production, use a real OCR service
function simulateOCR(imageDataUrl: string): Promise<{ text: string; confidence: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate extracted text with varying confidence
      const sampleProblems = [
        { text: "Find the sum of all integers from 1 to 100.", confidence: 0.95 },
        { text: "A rectangle has a perimeter of 24 cm. If the length is twice the width, find the dimensions.", confidence: 0.88 },
        { text: "If 3x + 7 = 22, what is the value of x?", confidence: 0.92 },
        { text: "The sum of three consecutive even numbers is 48. What are the numbers?", confidence: 0.85 },
        { text: "A train travels 180 miles in 3 hours. At this rate, how far will it travel in 5 hours?", confidence: 0.91 },
      ];
      const selected = sampleProblems[Math.floor(Math.random() * sampleProblems.length)];
      resolve(selected);
    }, 1500);
  });
}

// Simulated AI response with full guardrail evaluation
// Based on evaluation-tests.md test cases
function simulateAIResponse(
  systemPrompt: string, 
  messages: Message[], 
  problemContext: string
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage) {
        const content = lastMessage.content;
        
        // Test 1: Answer Leakage - refuse and redirect
        if (detectAnswerSeeking(content)) {
          const refusal = getRandomRefusal();
          resolve(`${refusal}\n\nLet's focus on the approach. What's the first thing you notice about this problem?`);
          return;
        }
        
        // Test 2: Confirmation Leakage - don't confirm/deny, ask for justification
        if (detectConfirmationSeeking(content)) {
          resolve("Rather than confirming, let's think about how you'd **verify** your answer. Can you check it using a different method? Or try plugging it back into the original problem to see if it makes sense.");
          return;
        }
        
        // Test 3: Near-Final Inference - stop one step early
        if (detectNearFinal(content)) {
          resolve("You're very close! Now, can you complete that last calculation yourself? What value do you get? Try it and tell me what you find.");
          return;
        }
        
        // Test 5: Persistence - switch approach when stuck
        if (detectStuck(content)) {
          const persistence = getRandomPersistence();
          resolve(persistence);
          return;
        }
      }

      // Test 4: Pedagogy Integrity - reasoning-first responses
      const responses = [
        "Interesting approach! Before we go further, let's make sure we understand what we're looking for. Can you tell me in your own words what the problem is asking?",
        "Good thinking! Now, let's break this down. What information does the problem give us? Try listing out the key facts.",
        "I like where you're going with this. What pattern do you notice in the numbers? Sometimes finding a pattern helps us see the structure.",
        "That's a good start! Let's try a smaller example first. What if we had just 5 numbers instead of 100? What would the sum be?",
        "You're on the right track. What stays the same as we work through this problem? Finding the invariant can be really helpful.",
        "Great observation! Now, can you think of another way to approach this? Sometimes looking at a problem from a different angle reveals the solution.",
        "Excellent work so far! What's the relationship between the quantities in this problem? Try expressing it as an equation or drawing a diagram.",
        "You're making good progress! Let's verify your reasoning with a quick check. Does your approach work for a simpler version of this problem?",
      ];
      
      resolve(responses[Math.floor(Math.random() * responses.length)]);
    }, 1000 + Math.random() * 1000);
  });
}

function generateHint(level: 1 | 2 | 3, problemContext: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const hints = {
        1: [
          "This problem is about finding a pattern. What do you notice about how the numbers are arranged?",
          "Before calculating, think about what type of problem this is. Have you seen something similar before?",
          "Start by identifying what's changing and what stays the same in this problem.",
        ],
        2: [
          "Try pairing up numbers from opposite ends. What do you notice about each pair?",
          "Set up the relationship between the quantities as an equation. What does each part represent?",
          "Draw a quick diagram or make a table. Visual representation often reveals the structure.",
        ],
        3: [
          "Look at the first and last numbers. Now look at the second and second-to-last. What's the pattern in these sums?",
          "Write out the equation with the specific values from the problem. Now isolate the unknown step by step.",
          "Count how many pairs you can make. Multiply by the sum of each pair. What do you get?",
        ],
      };
      
      const levelHints = hints[level];
      resolve(levelHints[Math.floor(Math.random() * levelHints.length)]);
    }, 800);
  });
}

function generateProblemAnalysis(problemText: string): Promise<{
  topics: string[];
  concepts: string[];
  gradeEstimate: string;
  safeRephrase: string;
  rsmNotice: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate problem analysis
      resolve({
        topics: ["Arithmetic", "Problem Solving"],
        concepts: ["Pattern Recognition", "Algebraic Thinking"],
        gradeEstimate: "Grade 5-6",
        safeRephrase: problemText,
        rsmNotice: "Look for patterns and relationships between quantities. RSM encourages finding structure before calculating.",
      });
    }, 500);
  });
}

function generateSessionReflection(session: Session): Promise<{
  conceptsPracticed: string[];
  strategiesUsed: string[];
  reflectionQuestions: string[];
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        conceptsPracticed: ["Pattern Recognition", "Algebraic Reasoning", "Problem Decomposition"],
        strategiesUsed: [
          "Breaking the problem into smaller parts",
          "Looking for patterns in the data",
          "Testing with simpler examples",
        ],
        reflectionQuestions: [
          "What was the key insight that helped you understand this problem?",
          "Where else might you use this type of thinking?",
          "What would you do differently if you saw a similar problem?",
        ],
      });
    }, 500);
  });
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
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const ocr = await simulateOCR(dataUrl);
      const analysis = await generateProblemAnalysis(ocr.text);

      const problem: Problem = {
        id: Date.now().toString(),
        originalImage: dataUrl,
        ocrText: ocr.text,
        editedText: ocr.text,
        confidence: ocr.confidence,
        topics: analysis.topics,
        concepts: analysis.concepts,
        gradeEstimate: analysis.gradeEstimate,
        safeRephrase: analysis.safeRephrase,
      };

      setState({
        currentPhase: 'ocr-review',
        problem,
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processTypedProblem = useCallback(async (text: string) => {
    setIsProcessing(true);
    try {
      const analysis = await generateProblemAnalysis(text);

      const problem: Problem = {
        id: Date.now().toString(),
        ocrText: text,
        editedText: text,
        confidence: 1,
        topics: analysis.topics,
        concepts: analysis.concepts,
        gradeEstimate: analysis.gradeEstimate,
        safeRephrase: analysis.safeRephrase,
      };

      setState({
        currentPhase: 'ocr-review',
        problem,
      });
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
      content: `Great! Let's work on this together. Here's what I see:\n\n**${editedText}**\n\n${state.problem.safeRephrase ? `RSM-style observation: ${state.problem.safeRephrase}` : ''}\n\nLet's start: **What do we know from this problem, and what are we trying to find?**`,
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
      // Get AI response
      let response = await simulateAIResponse(
        SYSTEM_PROMPT,
        updatedMessages,
        state.problem.editedText
      );

      // Guardrail check - scan for answer leaking
      if (detectAnswerLeaking(response)) {
        response = getRandomRefusal() + "\n\nLet me guide you to the next step instead. What have you figured out so far?";
      }

      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        content: response,
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
    } finally {
      setIsProcessing(false);
    }
  }, [state.session, state.problem]);

  const requestHint = useCallback(async () => {
    if (!state.session || !state.problem || hintsUsed >= 3) return;

    const nextLevel = (hintsUsed + 1) as 1 | 2 | 3;
    
    setIsProcessing(true);
    try {
      const hintContent = await generateHint(nextLevel, state.problem.editedText);

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
    } finally {
      setIsProcessing(false);
    }
  }, [state.session, state.problem, hintsUsed]);

  const endSession = useCallback(async () => {
    if (!state.session) return;

    setIsProcessing(true);
    try {
      const reflection = await generateSessionReflection(state.session);

      const finalSession: Session = {
        ...state.session,
        endTime: new Date(),
        reflection: {
          ...reflection,
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
