import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Fehler beim Login', {
        description: 'Bitte überprüfen Sie Ihre Anmeldedaten.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Rainbow Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1000ms' }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '500ms' }}
      ></div>
      <div
        className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '700ms' }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '300ms' }}
      ></div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="backdrop-blur-2xl bg-gradient-to-br from-white/15 to-white/5 p-6 border-b border-white/10">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Admin Login
              </h1>
              <p className="text-white/70 text-sm">
                Willkommen zurück! Melden Sie sich an, um das Admin-Dashboard zu nutzen.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <label htmlFor="email" className="text-white font-medium flex items-center gap-2">
                  <div className="backdrop-blur-2xl bg-white/10 p-1.5 rounded-lg border border-white/20">
                    <User className="h-4 w-4 text-white/80" />
                  </div>
                  E-Mail
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="admin@nuernbergspots.de"
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 pl-12 pr-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/15"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 backdrop-blur-2xl bg-white/10 p-1.5 rounded-lg border border-white/20">
                    <User className="h-4 w-4 text-white/60" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label
                  htmlFor="password"
                  className="text-white font-medium flex items-center gap-2"
                >
                  <div className="backdrop-blur-2xl bg-white/10 p-1.5 rounded-lg border border-white/20">
                    <Lock className="h-4 w-4 text-white/80" />
                  </div>
                  Passwort
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="backdrop-blur-2xl bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/40 focus:ring-white/20 pl-12 pr-12 py-3 rounded-xl transition-all duration-300 hover:bg-white/15"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 backdrop-blur-2xl bg-white/10 p-1.5 rounded-lg border border-white/20">
                    <Lock className="h-4 w-4 text-white/60" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 backdrop-blur-2xl bg-white/10 p-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="backdrop-blur-2xl bg-white/10 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white/80 font-medium">Anmeldung läuft...</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl py-3 rounded-xl font-medium text-base disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    Anmeldung...
                  </div>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Probleme beim Anmelden? Kontaktieren Sie den System-Administrator.
              </p>
            </div>
          </div>

          {/* Footer Section */}
          <div className="backdrop-blur-2xl bg-gradient-to-r from-white/5 to-white/10 border-t border-white/10 p-4">
            <div className="text-center">
              <p className="text-white/50 text-xs">© 2024 Nürnbergspots Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-sm"></div>
        <div className="absolute -top-2 -right-6 w-6 h-6 bg-gradient-to-r from-white/15 to-white/5 rounded-full blur-sm"></div>
        <div className="absolute -bottom-3 -left-5 w-10 h-10 bg-gradient-to-r from-white/10 to-white/5 rounded-full blur-sm"></div>
        <div className="absolute -bottom-4 -right-3 w-7 h-7 bg-gradient-to-r from-white/20 to-white/10 rounded-full blur-sm"></div>
      </div>
    </div>
  );
}
