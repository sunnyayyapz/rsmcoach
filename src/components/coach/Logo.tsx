import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 48, text: 'text-2xl' },
    lg: { icon: 64, text: 'text-4xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative"
      >
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Book/thinking cap shape */}
          <rect
            x="8"
            y="16"
            width="48"
            height="40"
            rx="4"
            className="fill-primary"
          />
          <rect
            x="12"
            y="20"
            width="40"
            height="32"
            rx="2"
            className="fill-primary-foreground"
          />
          {/* Math symbols */}
          <text
            x="20"
            y="42"
            className="fill-primary"
            fontSize="16"
            fontFamily="serif"
            fontWeight="600"
          >
            π
          </text>
          <text
            x="36"
            y="42"
            className="fill-coach-mint"
            fontSize="14"
            fontFamily="serif"
            fontWeight="600"
          >
            ∑
          </text>
          {/* Lightbulb accent */}
          <circle
            cx="48"
            cy="12"
            r="8"
            className="fill-coach-gold"
          />
          <path
            d="M46 10 L48 8 L50 10 L50 14 L46 14 Z"
            className="fill-coach-gold"
          />
        </svg>
      </motion.div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-semibold text-foreground ${text}`}>
            RSM Coach
          </span>
          <span className="text-xs text-muted-foreground tracking-wide">
            Think it through
          </span>
        </div>
      )}
    </div>
  );
}
