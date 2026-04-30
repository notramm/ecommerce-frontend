import { motion }   from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useUIStore   from '../../store/uiStore';

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
      className={`
        relative w-14 h-7 rounded-full border transition-colors duration-300
        ${isDark
          ? 'bg-[#1a1a1a] border-white/[0.1]'
          : 'bg-gold/20 border-gold/30'
        }
        ${className || ''}
      `}
    >
      {/* Track */}
      <motion.div
        className={`
          absolute top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300
          ${isDark ? 'bg-stone/40 left-0.5' : 'bg-gold left-7'}
        `}
        animate={{ left: isDark ? '2px' : '30px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {isDark
          ? <Moon size={12} className="text-stone" />
          : <Sun  size={12} className="text-obsidian" />
        }
      </motion.div>
    </motion.button>
  );
}