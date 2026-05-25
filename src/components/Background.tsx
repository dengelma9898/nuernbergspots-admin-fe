import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

/**
 * Minimalistische Background-Komponente mit maximal 2 Ebenen
 *
 * Verbesserungen:
 * - Reduziert auf maximal 2 Ebenen (1 Gradient-Layer + 1 Blur-Kreis)
 * - Neues Farbschema: Weiß Primary, Schwarz Secondary, Rot Tertiary
 * - Dark Mode Support mit vertauschten Primary/Secondary
 * - Verbesserte Lesbarkeit durch bessere Kontraste
 */
export function Background() {
  const { theme, systemTheme } = useTheme();
  // Fallback zu 'light' wenn theme noch nicht geladen ist
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <>
      {/* Ebene 1: Gradient-Layer - Primary/Secondary basierend auf Theme */}
      <div
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-black to-gray-900'
            : 'bg-gradient-to-br from-white via-gray-50 to-white'
        }`}
      />

      {/* Ebene 2: Einziger Blur-Kreis - Tertiary (Rot) als Akzent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none w-full max-w-full">
        <motion.div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] max-w-[100vw] max-h-[100vh] rounded-full blur-3xl transition-opacity duration-500 ${
            isDark ? 'bg-red-500/10' : 'bg-red-500/5'
          }`}
          animate={{
            scale: [1, 1.05, 1],
            opacity: isDark ? [0.1, 0.15, 0.1] : [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            willChange: 'transform, opacity',
            transformOrigin: 'center center',
          }}
        />
      </div>
    </>
  );
}
