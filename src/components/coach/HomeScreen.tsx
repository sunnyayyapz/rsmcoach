import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileUpload } from '@/components/coach/FileUpload';
import { Logo } from '@/components/coach/Logo';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Keyboard, Camera, Sparkles, Shield, Brain, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/coach/BottomNav';

interface HomeScreenProps {
  onImageUpload: (file: File) => void;
  onTextSubmit: (text: string) => void;
  isProcessing: boolean;
}

export function HomeScreen({ onImageUpload, onTextSubmit, isProcessing }: HomeScreenProps) {
  const [inputMode, setInputMode] = useState<'photo' | 'type'>('photo');
  const [typedProblem, setTypedProblem] = useState('');
  const { user, signOut } = useAuth();

  const handleTextSubmit = () => {
    if (typedProblem.trim()) {
      onTextSubmit(typedProblem.trim());
    }
  };

  return (
    <div className="min-h-screen coach-gradient">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Logo size="lg" />
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">
            Master the thinking,<br />not just the answer
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload your RSM homework and get guided through the problem—never the solution.
          </p>
        </motion.div>
      </section>

      {/* Input Mode Toggle */}
      <section className="px-4 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => setInputMode('photo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                inputMode === 'photo'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Camera className="w-4 h-4" />
              Photo
            </button>
            <button
              onClick={() => setInputMode('type')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                inputMode === 'type'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Keyboard className="w-4 h-4" />
              Type it
            </button>
          </div>

          {/* Input Area */}
          {inputMode === 'photo' ? (
            <FileUpload onFileSelect={onImageUpload} isProcessing={isProcessing} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Textarea
                value={typedProblem}
                onChange={(e) => setTypedProblem(e.target.value)}
                placeholder="Type or paste your math problem here..."
                className="min-h-[160px] text-base"
              />
              <Button
                onClick={handleTextSubmit}
                disabled={!typedProblem.trim() || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Start coaching session'}
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-8 mt-auto">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium text-sm">RSM-Style</h3>
              <p className="text-xs text-muted-foreground">Patterns & invariants</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-coach-gold/20 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-coach-gold" />
              </div>
              <h3 className="font-medium text-sm">Guided Hints</h3>
              <p className="text-xs text-muted-foreground">3 levels of help</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-coach-mint/20 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-coach-mint" />
              </div>
              <h3 className="font-medium text-sm">No Answers</h3>
              <p className="text-xs text-muted-foreground">You solve it</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust message */}
      <footer className="px-4 py-6 pb-24 text-center">
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          <strong>Parent-approved:</strong> RSM Coach teaches thinking, not copying. 
          Your child discovers the answer—we just light the path.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}
