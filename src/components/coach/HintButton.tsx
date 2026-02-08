import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HintButtonProps {
  currentLevel: number;
  maxLevel?: number;
  onRequestHint: () => void;
  disabled?: boolean;
}

export function HintButton({ currentLevel, maxLevel = 3, onRequestHint, disabled }: HintButtonProps) {
  const hintsRemaining = maxLevel - currentLevel;
  
  const getHintLabel = () => {
    if (currentLevel === 0) return "Need a hint?";
    if (hintsRemaining === 0) return "All hints used";
    return `Get hint ${currentLevel + 1}`;
  };

  const getHintDescription = () => {
    if (currentLevel === 0) return "Start with a gentle pointer";
    if (currentLevel === 1) return "Get a more specific direction";
    if (currentLevel === 2) return "Final hint - specific next step";
    return "Try a different approach";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Button
        variant="outline"
        onClick={onRequestHint}
        disabled={disabled || hintsRemaining === 0}
        className="w-full justify-between h-auto py-3 px-4 bg-hint-1 hover:bg-hint-2 border-coach-gold/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-coach-gold/20 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-coach-gold" />
          </div>
          <div className="text-left">
            <div className="font-medium text-foreground">{getHintLabel()}</div>
            <div className="text-xs text-muted-foreground">{getHintDescription()}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: maxLevel }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentLevel ? 'bg-coach-gold' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Button>
    </motion.div>
  );
}
