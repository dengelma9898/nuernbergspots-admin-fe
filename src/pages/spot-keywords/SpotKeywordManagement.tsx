import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoadingButton } from '@/components/LoadingButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { cn } from '@/lib/utils';
import { cardPreset, inputPreset, buttonPreset } from '@/lib/designTokens';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';

import { useSpotKeywordService } from '@/services/spotKeywordService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { SpotKeyword } from '@/models/spot-keyword';
import { UserType } from '@/models/users';

import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

import { motion } from '@/components/motion';
import { AlertCircle, ArrowLeft, Hash, Search, Tag } from 'lucide-react';

export function SpotKeywordManagement() {
  const navigate = useNavigate();
  const spotKeywordService = useSpotKeywordService();
  const spotKeywordServiceRef = useRef(spotKeywordService);
  useEffect(() => {
    spotKeywordServiceRef.current = spotKeywordService;
  }, [spotKeywordService]);

  const userService = useUserService();
  const userServiceRef = useRef(userService);
  useEffect(() => {
    userServiceRef.current = userService;
  }, [userService]);

  const { getUserId } = useAuth();

  const [userRole, setUserRole] = useState<UserType | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const [searchQ, setSearchQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [suggestions, setSuggestions] = useState<SpotKeyword[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadUserRole = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const profile = await userServiceRef.current.getUserProfile(userId);
      setUserRole(profile.userType);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  }, [getUserId]);

  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 320);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!debouncedQ) {
        setSuggestions([]);
        return;
      }
      try {
        setSuggestLoading(true);
        const list = await spotKeywordServiceRef.current.suggest(debouncedQ, 30);
        if (!cancelled) setSuggestions(list);
      } catch (error) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.error('Suggest-Fehler:', error);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setSuggestLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating || !isAdminOrSuperAdmin) return;
    const name = newName.trim();
    if (!name) {
      toast.error('Bitte einen Namen eingeben.');
      return;
    }
    try {
      setCreating(true);
      const created = await spotKeywordServiceRef.current.create({ name });
      showSuccessMessage(toast, {
        title: 'Spot-Keyword gespeichert',
        description: `„${created.name}“ (${created.id})`,
      });
      setNewName('');
    } catch (error) {
      showUserFriendlyError(error, toast, () => handleCreate(e), 'generic');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 min-h-screen bg-muted !bg-transparent px-2 sm:px-4 py-4 sm:py-6 overflow-x-hidden">
        <div className="max-w-2xl mx-auto space-y-6">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            transition={defaultTransition}
            className="flex items-center gap-3"
          >
            <LoadingButton
              variant="outline"
              size="icon"
              onClick={() => navigate('/')}
              className={cn(buttonPreset)}
              aria-label="Zurück zum Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </LoadingButton>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <Tag className="h-7 w-7 shrink-0" />
                Spot-Keywords
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Eigene Vokabular-Tags für kuratierte Spots (nicht die Partner-Keywords unter
                /keywords).
              </p>
            </div>
          </motion.div>

          {!isAdminOrSuperAdmin && userRole !== null && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Anlegen nur für Admins</AlertTitle>
              <AlertDescription>
                POST /spot-keywords ist admin-geschützt. Suche (Suggest) ist für authentifizierte
                Nutzer verfügbar.
              </AlertDescription>
            </Alert>
          )}

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground">Neues Spot-Keyword</CardTitle>
                <CardDescription>
                  Duplikate nach Normalisierung liefern laut API das bestehende Keyword zurück.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kw-name" className="text-foreground">
                      Name
                    </Label>
                    <Input
                      id="kw-name"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      maxLength={120}
                      className={cn(inputPreset)}
                      placeholder="z. B. Rooftop"
                      disabled={!isAdminOrSuperAdmin}
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    isLoading={creating}
                    disabled={!isAdminOrSuperAdmin || creating}
                    className={cn(buttonPreset)}
                  >
                    Keyword anlegen
                  </LoadingButton>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset)}>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Suche / Vorschläge
                </CardTitle>
                <CardDescription>
                  Prefix-Suche (mind. 1 Zeichen). Es gibt keinen Listen-Endpunkt für alle Keywords
                  in der aktuellen API-Doku.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kw-search" className="text-foreground">
                    Präfix
                  </Label>
                  <Input
                    id="kw-search"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    className={cn(inputPreset)}
                    placeholder="Tippen zum Suchen…"
                  />
                </div>
                {suggestLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                )}
                {!suggestLoading && debouncedQ && suggestions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Keine Treffer.</p>
                )}
                {!suggestLoading && suggestions.length > 0 && (
                  <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {suggestions.map(kw => (
                      <li
                        key={kw.id}
                        className="rounded-lg border border-secondary bg-card px-3 py-2 text-sm text-foreground"
                      >
                        <div className="font-medium flex items-center gap-2">
                          <Hash className="h-3.5 w-3.5 shrink-0 opacity-70" />
                          {kw.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 font-mono break-all">
                          id: {kw.id}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
