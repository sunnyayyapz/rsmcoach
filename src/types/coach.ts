export interface Problem {
  id: string;
  originalImage?: string;
  ocrText: string;
  editedText: string;
  confidence: number;
  topics: string[];
  concepts: string[];
  gradeEstimate: string;
  safeRephrase: string;
  problemType?: string;
}

export interface Message {
  id: string;
  role: 'student' | 'coach';
  content: string;
  timestamp: Date;
  type?: 'text' | 'hint' | 'question' | 'reflection';
  hintLevel?: 1 | 2 | 3;
}

export interface Session {
  id: string;
  problem: Problem;
  messages: Message[];
  hintsUsed: number;
  strategiesTried: string[];
  startTime: Date;
  endTime?: Date;
  reflection?: SessionReflection;
}

export interface SessionReflection {
  conceptsPracticed: string[];
  strategiesUsed: string[];
  reflectionQuestions: string[];
  studentNotes?: string;
}

export interface HintRequest {
  level: 1 | 2 | 3;
  problemContext: string;
  conversationHistory: Message[];
}

export interface TutoringState {
  currentPhase: 'upload' | 'ocr-review' | 'tutoring' | 'summary';
  problem?: Problem;
  session?: Session;
}
