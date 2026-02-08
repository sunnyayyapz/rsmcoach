import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import type { Message } from '@/types/coach';
import { Lightbulb } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export function ChatBubble({ message, isLatest }: ChatBubbleProps) {
  const isCoach = message.role === 'coach';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isCoach ? -10 : 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isCoach ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] ${
          isCoach ? 'chat-bubble-coach' : 'chat-bubble-student'
        } px-4 py-3`}
      >
        {message.type === 'hint' && message.hintLevel && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
            <Lightbulb className="w-4 h-4 text-coach-gold" />
            <span className="text-xs font-medium text-muted-foreground">
              Hint {message.hintLevel} of 3
            </span>
          </div>
        )}
        
        <div className={`prose-chat ${isCoach ? '' : 'text-primary-foreground'}`}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        
        <div className={`text-xs mt-2 ${isCoach ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start mb-4"
    >
      <div className="chat-bubble-coach px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
              className="w-2 h-2 rounded-full bg-primary/60"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
