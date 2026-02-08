import { motion } from 'framer-motion';
import { BookOpen, Brain, Target, MessageSquare, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Session } from '@/types/coach';

interface SessionSummaryProps {
  session: Session;
  onNewProblem: () => void;
}

export function SessionSummary({ session, onNewProblem }: SessionSummaryProps) {
  const duration = session.endTime 
    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
    : 0;

  const reflection = session.reflection;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-primary/10 to-coach-mint-light/50 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold">Great thinking!</h2>
              <p className="text-sm text-muted-foreground">
                You worked on this for {duration} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{session.messages.length}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-coach-gold">{session.hintsUsed}</div>
            <div className="text-xs text-muted-foreground">Hints used</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-coach-mint">{session.strategiesTried.length}</div>
            <div className="text-xs text-muted-foreground">Strategies</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Concepts Practiced */}
          {reflection?.conceptsPracticed && reflection.conceptsPracticed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-medium">Concepts Practiced</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {reflection.conceptsPracticed.map((concept, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strategies Used */}
          {reflection?.strategiesUsed && reflection.strategiesUsed.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-coach-mint" />
                <h3 className="font-medium">Strategies You Used</h3>
              </div>
              <ul className="space-y-2">
                {reflection.strategiesUsed.map((strategy, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-coach-mint-light text-coach-mint text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reflection Questions */}
          {reflection?.reflectionQuestions && reflection.reflectionQuestions.length > 0 && (
            <div className="bg-hint-1 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-coach-gold" />
                <h3 className="font-medium">Think About...</h3>
              </div>
              <ul className="space-y-3">
                {reflection.reflectionQuestions.map((question, i) => (
                  <li key={i} className="text-sm text-foreground">
                    • {question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-muted/20">
          <Button onClick={onNewProblem} className="w-full" size="lg">
            <RotateCcw className="w-4 h-4 mr-2" />
            Work on another problem
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
