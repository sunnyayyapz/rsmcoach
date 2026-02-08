import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, Edit3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Problem } from '@/types/coach';

interface OCRReviewProps {
  problem: Problem;
  onConfirm: (editedText: string) => void;
  onBack: () => void;
}

export function OCRReview({ problem, onConfirm, onBack }: OCRReviewProps) {
  const [editedText, setEditedText] = useState(problem.ocrText);
  const [isEditing, setIsEditing] = useState(false);

  const confidenceLevel = problem.confidence > 0.9 ? 'high' : problem.confidence > 0.7 ? 'medium' : 'low';
  
  const confidenceConfig = {
    high: {
      color: 'text-coach-mint',
      bg: 'bg-coach-mint-light',
      icon: Check,
      label: 'High confidence',
    },
    medium: {
      color: 'text-coach-gold',
      bg: 'bg-hint-1',
      icon: Eye,
      label: 'Review recommended',
    },
    low: {
      color: 'text-coach-coral',
      bg: 'bg-destructive/10',
      icon: AlertCircle,
      label: 'Please verify',
    },
  };

  const config = confidenceConfig[confidenceLevel];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold">Review the problem</h2>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Make sure the extracted text matches your homework problem
          </p>
        </div>

        {/* Original image (if available) */}
        {problem.originalImage && (
          <div className="p-4 border-b border-border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Original image</p>
            <img
              src={problem.originalImage}
              alt="Original problem"
              className="max-h-32 rounded-lg border border-border"
            />
          </div>
        )}

        {/* Extracted text */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Extracted problem</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {isEditing ? 'Preview' : 'Edit'}
            </Button>
          </div>

          {isEditing ? (
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
              placeholder="Enter the problem text..."
            />
          ) : (
            <div className="math-display whitespace-pre-wrap">
              {editedText || problem.ocrText}
            </div>
          )}

          {confidenceLevel !== 'high' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-3 rounded-lg bg-hint-1 border border-coach-gold/20"
            >
              <p className="text-sm text-foreground">
                <strong>Tip:</strong> If something looks wrong, click "Edit" to fix it. 
                Common issues include fractions, exponents, and special symbols.
              </p>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border bg-muted/20 flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={() => onConfirm(editedText)} className="flex-1">
            Start coaching session
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
