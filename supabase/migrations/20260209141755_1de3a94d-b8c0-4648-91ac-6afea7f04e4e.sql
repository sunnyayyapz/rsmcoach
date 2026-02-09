
-- Create sessions table to track student activity
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_text TEXT NOT NULL,
  problem_type TEXT,
  topics TEXT[] DEFAULT '{}',
  concepts TEXT[] DEFAULT '{}',
  grade_estimate TEXT,
  hints_used INTEGER NOT NULL DEFAULT 0,
  messages_count INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups by user and date
CREATE INDEX idx_sessions_user_date ON public.sessions (user_id, started_at DESC);
