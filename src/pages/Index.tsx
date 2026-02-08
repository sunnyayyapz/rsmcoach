import { AnimatePresence, motion } from 'framer-motion';
import { useCoach } from '@/hooks/useCoach';
import { HomeScreen } from '@/components/coach/HomeScreen';
import { OCRReview } from '@/components/coach/OCRReview';
import { TutoringChat } from '@/components/coach/TutoringChat';
import { SessionSummary } from '@/components/coach/SessionSummary';

const Index = () => {
  const {
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
  } = useCoach();

  return (
    <AnimatePresence mode="wait">
      {state.currentPhase === 'upload' && (
        <motion.div
          key="upload"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <HomeScreen
            onImageUpload={processImage}
            onTextSubmit={processTypedProblem}
            isProcessing={isProcessing}
          />
        </motion.div>
      )}

      {state.currentPhase === 'ocr-review' && state.problem && (
        <motion.div
          key="ocr-review"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen coach-gradient py-8 px-4"
        >
          <OCRReview
            problem={state.problem}
            onConfirm={confirmProblem}
            onBack={goBack}
          />
        </motion.div>
      )}

      {state.currentPhase === 'tutoring' && state.session && state.problem && (
        <motion.div
          key="tutoring"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <TutoringChat
            session={state.session}
            problem={state.problem}
            isProcessing={isProcessing}
            hintsUsed={hintsUsed}
            onSendMessage={sendMessage}
            onRequestHint={requestHint}
            onEndSession={endSession}
            onBack={goBack}
          />
        </motion.div>
      )}

      {state.currentPhase === 'summary' && state.session && (
        <motion.div
          key="summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen coach-gradient py-8 px-4"
        >
          <SessionSummary
            session={state.session}
            onNewProblem={startNewSession}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
