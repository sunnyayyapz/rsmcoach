import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/coach/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen coach-gradient flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <Logo size="md" />
        
        <div className="mt-8 mb-6">
          <h1 className="font-serif text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">
            Page not found
          </h2>
          <p className="text-muted-foreground">
            Just like a tricky math problem, this page seems to have hidden itself. 
            Let's get you back on track!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-hint-1 rounded-lg border border-coach-gold/20">
          <p className="text-sm text-foreground flex items-start gap-2">
            <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-coach-gold" />
            <span>
              <strong>Hint 1:</strong> The page you're looking for doesn't exist. 
              Try navigating to the main page to start a new coaching session.
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
