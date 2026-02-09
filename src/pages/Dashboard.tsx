import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/coach/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Brain, Clock, Lightbulb, TrendingUp } from 'lucide-react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { BottomNav } from '@/components/coach/BottomNav';

interface SessionRecord {
  id: string;
  problem_text: string;
  problem_type: string | null;
  topics: string[];
  hints_used: number;
  messages_count: number;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSessions = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50);

      setSessions((data as SessionRecord[]) || []);
      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  const todaySessions = sessions.filter(s => isToday(new Date(s.started_at)));
  const totalHints = sessions.reduce((sum, s) => sum + s.hints_used, 0);
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

  // Group sessions by day
  const groupedSessions = sessions.reduce<Record<string, SessionRecord[]>>((groups, session) => {
    const day = startOfDay(new Date(session.started_at)).toISOString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(session);
    return groups;
  }, {});

  const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'EEEE, MMM d');
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen coach-gradient flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen coach-gradient pb-24">
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 space-y-6"
      >
        <h1 className="font-serif text-2xl font-semibold text-foreground">Activity</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-semibold text-foreground">{todaySessions.length}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-coach-mint" />
              <p className="text-2xl font-semibold text-foreground">{sessions.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Lightbulb className="w-5 h-5 mx-auto mb-1 text-coach-gold" />
              <p className="text-2xl font-semibold text-foreground">{totalHints}</p>
              <p className="text-xs text-muted-foreground">Hints Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Session history */}
        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Brain className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-muted-foreground">No sessions yet.</p>
              <p className="text-sm text-muted-foreground">Complete a coaching session to see your activity here.</p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Start a Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedSessions).map(([day, daySessions]) => (
            <div key={day} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-sm font-medium text-muted-foreground">
                  {formatDayLabel(day)}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>

              {daySessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {session.problem_text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {session.problem_type && (
                        <Badge variant="secondary" className="text-xs">
                          {session.problem_type}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lightbulb className="w-3 h-3" />
                        {session.hints_used} hints
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(session.duration_seconds)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(session.started_at), 'h:mm a')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        )}
      </motion.div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
