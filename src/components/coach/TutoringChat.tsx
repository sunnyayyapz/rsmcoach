import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/coach/Logo';
import { ChatBubble, TypingIndicator } from '@/components/coach/ChatBubble';
import { ChatInput } from '@/components/coach/ChatInput';
import { HintButton } from '@/components/coach/HintButton';
import type { Session, Problem } from '@/types/coach';

interface TutoringChatProps {
  session: Session;
  problem: Problem;
  isProcessing: boolean;
  hintsUsed: number;
  onSendMessage: (message: string) => void;
  onRequestHint: () => void;
  onEndSession: () => void;
  onBack: () => void;
}

export function TutoringChat({
  session,
  problem,
  isProcessing,
  hintsUsed,
  onSendMessage,
  onRequestHint,
  onEndSession,
  onBack,
}: TutoringChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showProblem, setShowProblem] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Logo size="sm" showText={false} />
            <div className="hidden sm:block">
              <h1 className="font-medium text-sm">Coaching Session</h1>
              <p className="text-xs text-muted-foreground">
                {problem.topics.join(' • ')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProblem(!showProblem)}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Problem</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEndSession}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">End Session</span>
            </Button>
          </div>
        </div>

        {/* Collapsible problem view */}
        <AnimatePresence>
          {showProblem && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="max-w-3xl mx-auto px-4 py-3 bg-muted/30">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Current Problem</p>
                <p className="text-sm font-mono">{problem.editedText}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {session.messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message}
              isLatest={index === session.messages.length - 1}
            />
          ))}
          
          {isProcessing && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
          {hintsUsed < 3 && (
            <HintButton
              currentLevel={hintsUsed}
              onRequestHint={onRequestHint}
              disabled={isProcessing}
            />
          )}
          
          <ChatInput
            onSend={onSendMessage}
            disabled={isProcessing}
            placeholder="Share your thinking or ask a question..."
          />
        </div>
      </div>
    </div>
  );
}
