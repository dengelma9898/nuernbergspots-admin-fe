import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { showUserFriendlyError } from '@/utils/errorUtils';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { fadeInUp, shake, fadeIn, scaleIn } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassInput, glassButton, glassBadge } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

/**
 * Login-Komponente für die Nürnbergspots Admin-Anwendung
 *
 * Ermöglicht Administratoren die Anmeldung über Email und Passwort.
 * Verwendet Firebase Authentication im Hintergrund.
 *
 * Features:
 * - Email/Password-Authentifizierung
 * - Loading-Zustand während der Anmeldung
 * - Fehlerbehandlung mit Toast-Benachrichtigungen
 * - Automatische Weiterleitung nach erfolgreichem Login
 * - Spektakuläres Glassmorphism-Design mit Rainbow-Background
 *
 * @returns JSX.Element Login-Formular
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasError(false);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setHasError(true);
      console.error('Fehler beim Login:', error);
      showUserFriendlyError(error, toast, () => handleLogin(), 'login');
      // Reset error state after animation
      setTimeout(() => setHasError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
        {/* Reduzierte Background-Komponente */}
        <Background />

        {/* Main Login Card */}
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          transition={defaultTransition}
        >
          <motion.div
            className={cn(glassCard, 'overflow-hidden')}
            variants={scaleIn}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            {/* Header Section */}
            <motion.div
              className="bg-card p-6 border-b border-secondary"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-center flex-1 space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Admin Login</h1>
                  <p className="text-muted-foreground text-sm">
                    Willkommen zurück! Melden Sie sich an, um das Admin-Dashboard zu nutzen.
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </motion.div>

            {/* Form Section */}
            <motion.div
              className="p-6"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  className="space-y-3"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.3 }}
                >
                  <label
                    htmlFor="email"
                    className="text-foreground font-medium flex items-center gap-2"
                  >
                    <div className={glassBadge}>
                      <User className="h-4 w-4 text-foreground/80" />
                    </div>
                    E-Mail
                  </label>
                  <motion.div
                    className="relative"
                    variants={hasError ? shake : {}}
                    animate={hasError ? 'animate' : 'initial'}
                  >
                    <motion.div whileFocus={{ scale: 1.01 }} transition={defaultTransition}>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        placeholder="admin@nuernbergspots.de"
                        className={cn(
                          glassInput,
                          'pl-12 pr-4 py-3',
                          hasError &&
                            'border-destructive/50 focus:border-destructive/70 focus:ring-destructive/20'
                        )}
                      />
                    </motion.div>
                    <div className={cn(glassBadge, 'absolute left-3 top-1/2 -translate-y-1/2')}>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </motion.div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  className="space-y-3"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.4 }}
                >
                  <label
                    htmlFor="password"
                    className="text-foreground font-medium flex items-center gap-2"
                  >
                    <div className={glassBadge}>
                      <Lock className="h-4 w-4 text-foreground/80" />
                    </div>
                    Passwort
                  </label>
                  <motion.div
                    className="relative"
                    variants={hasError ? shake : {}}
                    animate={hasError ? 'animate' : 'initial'}
                  >
                    <motion.div whileFocus={{ scale: 1.01 }} transition={defaultTransition}>
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className={cn(
                          glassInput,
                          'pl-12 pr-12 py-3',
                          hasError &&
                            'border-destructive/50 focus:border-destructive/70 focus:ring-destructive/20'
                        )}
                      />
                    </motion.div>
                    <div className={cn(glassBadge, 'absolute left-3 top-1/2 -translate-y-1/2')}>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={defaultTransition}
                      className={cn(glassButton, 'absolute right-3 top-1/2 -translate-y-1/2 p-1.5')}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </motion.button>
                  </motion.div>
                </motion.div>

                {/* Loading State */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      className={cn(glassCard, 'p-4')}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={defaultTransition}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                        <span className="text-muted-foreground font-medium">
                          Anmeldung läuft...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.5 }}
                >
                  <AnimatedButton
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      glassButton,
                      'w-full py-3 font-medium text-base disabled:opacity-50'
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-muted-foreground/50 border-t-foreground rounded-full animate-spin"></div>
                        Anmeldung...
                      </div>
                    ) : (
                      'Anmelden'
                    )}
                  </AnimatedButton>
                </motion.div>
              </form>

              {/* Additional Info */}
              <motion.div
                className="mt-6 text-center"
                variants={fadeIn}
                initial="initial"
                animate="animate"
                transition={{ ...defaultTransition, delay: 0.6 }}
              >
                <p className="text-muted-foreground text-sm">
                  Probleme beim Anmelden? Kontaktieren Sie den System-Administrator.
                </p>
              </motion.div>
            </motion.div>

            {/* Footer Section */}
            <motion.div
              className="bg-card border-t border-secondary p-4"
              variants={fadeIn}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.7 }}
            >
              <div className="text-center">
                <p className="text-muted-foreground text-xs">© 2024 Nürnbergspots Admin Portal</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
