import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Save, RefreshCw, Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { useAppVersionService } from '@/services/appVersionService';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton, glassInput } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import type { Changelog } from '@/models/app-version';

// Semantic Version Vergleich für Sortierung (absteigend)
const compareVersions = (a: string, b: string): number => {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    if (partsA[i] > partsB[i]) return -1;
    if (partsA[i] < partsB[i]) return 1;
  }
  return 0;
};

// Skeleton Component
const AppVersionManagementSkeleton = () => (
  <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
    {/* Header Skeleton */}
    <Card className={cn(glassCard, 'p-4 sm:p-6 mb-6')}>
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64 rounded" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </Card>

    {/* Content Skeleton */}
    <div className="space-y-6">
      {/* Current Version Card Skeleton */}
      <Card className={cn(glassCard)}>
        <CardHeader>
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-72 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Set Version Card Skeleton */}
      <Card className={cn(glassCard)}>
        <CardHeader>
          <Skeleton className="h-6 w-56 rounded" />
          <Skeleton className="h-4 w-80 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-32 rounded" />
          </div>
        </CardContent>
      </Card>

      {/* Changelog Card Skeleton */}
      <Card className={cn(glassCard)}>
        <CardHeader>
          <Skeleton className="h-6 w-52 rounded" />
          <Skeleton className="h-4 w-96 rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 w-full sm:w-48 rounded" />
              <Skeleton className="h-10 w-full sm:w-48 rounded" />
            </div>
            <Skeleton className="h-[200px] w-full rounded" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32 rounded" />
              <Skeleton className="h-10 w-32 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export function AppVersionManagement() {
  const navigate = useNavigate();
  const appVersionService = useAppVersionService();

  // Mindestversion State
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [versionInput, setVersionInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Changelog State
  const [changelogs, setChangelogs] = useState<Changelog[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [changelogContent, setChangelogContent] = useState('');
  const [newVersionInput, setNewVersionInput] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoadingChangelogs, setIsLoadingChangelogs] = useState(false);
  const [isSavingChangelog, setIsSavingChangelog] = useState(false);
  const [isDeletingChangelog, setIsDeletingChangelog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([loadMinimumVersion(), loadAllChangelogs()]);
    setIsLoading(false);
  };

  const loadMinimumVersion = async () => {
    try {
      const version = await appVersionService.getMinimumVersion();
      if (version) {
        setCurrentVersion(version.minimumVersion);
        setVersionInput(version.minimumVersion);
      } else {
        setCurrentVersion(null);
        setVersionInput('');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Mindestversion:', error);
      showUserFriendlyError(error, toast, () => loadMinimumVersion(), 'generic');
    }
  };

  const loadAllChangelogs = async () => {
    if (isLoadingChangelogs) return;
    try {
      setIsLoadingChangelogs(true);
      const data = await appVersionService.getAllChangelogs();
      // Sortiere nach Version (absteigend)
      const sorted = [...data].sort((a, b) => compareVersions(a.version, b.version));
      setChangelogs(sorted);

      // Wenn noch keine Version ausgewählt ist und Changelogs existieren, wähle die erste
      if (!selectedVersion && sorted.length > 0) {
        handleVersionSelect(sorted[0].version);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Changelogs:', error);
      showUserFriendlyError(error, toast, () => loadAllChangelogs(), 'generic');
    } finally {
      setIsLoadingChangelogs(false);
    }
  };

  const handleVersionSelect = async (version: string) => {
    setSelectedVersion(version);
    setIsCreatingNew(false);
    setNewVersionInput('');

    const existingChangelog = changelogs.find(c => c.version === version);
    if (existingChangelog) {
      setChangelogContent(existingChangelog.content);
      setOriginalContent(existingChangelog.content);
    } else {
      // Falls nicht im Cache, vom Server laden
      try {
        const changelog = await appVersionService.getChangelogByVersion(version);
        if (changelog) {
          setChangelogContent(changelog.content);
          setOriginalContent(changelog.content);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Changelogs:', error);
        setChangelogContent('');
        setOriginalContent('');
      }
    }
  };

  const handleCreateNewMode = () => {
    setIsCreatingNew(true);
    setSelectedVersion(null);
    setChangelogContent('');
    setOriginalContent('');
    setNewVersionInput('');
  };

  const handleCancelNewMode = () => {
    setIsCreatingNew(false);
    setNewVersionInput('');
    // Wähle wieder den ersten Changelog, wenn vorhanden
    if (changelogs.length > 0) {
      handleVersionSelect(changelogs[0].version);
    } else {
      setChangelogContent('');
      setOriginalContent('');
    }
  };

  const handleChangelogSave = async () => {
    if (isSavingChangelog) return;

    const content = changelogContent.trim();
    if (!content) {
      toast.error('Bitte geben Sie einen Changelog-Inhalt ein');
      return;
    }

    if (isCreatingNew) {
      // Neuen Changelog erstellen
      const version = newVersionInput.trim();
      if (!version) {
        toast.error('Bitte geben Sie eine Version ein');
        return;
      }
      if (!validateVersionFormat(version)) {
        toast.error('Ungültiges Versionsformat. Bitte verwenden Sie das Format X.Y.Z (z.B. 1.2.3)');
        return;
      }
      // Prüfen ob Version bereits existiert
      if (changelogs.some(c => c.version === version)) {
        toast.error('Für diese Version existiert bereits ein Changelog');
        return;
      }

      try {
        setIsSavingChangelog(true);
        const newChangelog = await appVersionService.createChangelog({
          version,
          content,
        });
        showSuccessMessage(toast, {
          title: 'Changelog erstellt',
          description: `Changelog für Version ${version} wurde erfolgreich erstellt.`,
        });
        // Aktualisiere die Liste und wähle den neuen Changelog
        const updatedChangelogs = [...changelogs, newChangelog].sort((a, b) =>
          compareVersions(a.version, b.version)
        );
        setChangelogs(updatedChangelogs);
        setIsCreatingNew(false);
        setSelectedVersion(version);
        setOriginalContent(content);
      } catch (error) {
        console.error('Fehler beim Erstellen des Changelogs:', error);
        showUserFriendlyError(error, toast, () => handleChangelogSave(), 'generic');
      } finally {
        setIsSavingChangelog(false);
      }
    } else if (selectedVersion) {
      // Bestehenden Changelog aktualisieren
      try {
        setIsSavingChangelog(true);
        const updatedChangelog = await appVersionService.updateChangelog(selectedVersion, {
          content,
        });
        showSuccessMessage(toast, {
          title: 'Changelog aktualisiert',
          description: `Changelog für Version ${selectedVersion} wurde erfolgreich aktualisiert.`,
        });
        // Aktualisiere die Liste
        setChangelogs(prev =>
          prev.map(c => (c.version === selectedVersion ? updatedChangelog : c))
        );
        setOriginalContent(content);
      } catch (error) {
        console.error('Fehler beim Aktualisieren des Changelogs:', error);
        showUserFriendlyError(error, toast, () => handleChangelogSave(), 'generic');
      } finally {
        setIsSavingChangelog(false);
      }
    }
  };

  const handleChangelogDelete = async () => {
    if (isDeletingChangelog || !selectedVersion) return;

    try {
      setIsDeletingChangelog(true);
      await appVersionService.deleteChangelog(selectedVersion);
      showSuccessMessage(toast, {
        title: 'Changelog gelöscht',
        description: `Changelog für Version ${selectedVersion} wurde erfolgreich gelöscht.`,
      });
      // Entferne aus der Liste
      const updatedChangelogs = changelogs.filter(c => c.version !== selectedVersion);
      setChangelogs(updatedChangelogs);
      setDeleteDialogOpen(false);

      // Wähle den nächsten Changelog oder setze zurück
      if (updatedChangelogs.length > 0) {
        handleVersionSelect(updatedChangelogs[0].version);
      } else {
        setSelectedVersion(null);
        setChangelogContent('');
        setOriginalContent('');
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Changelogs:', error);
      showUserFriendlyError(error, toast, () => handleChangelogDelete(), 'generic');
    } finally {
      setIsDeletingChangelog(false);
    }
  };

  const validateVersionFormat = (version: string): boolean => {
    // Format: X.Y.Z (z.B. 1.2.3)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedVersion = versionInput.trim();

    if (!trimmedVersion) {
      toast.error('Bitte geben Sie eine Version ein');
      return;
    }

    if (!validateVersionFormat(trimmedVersion)) {
      toast.error('Ungültiges Versionsformat. Bitte verwenden Sie das Format X.Y.Z (z.B. 1.2.3)');
      return;
    }

    try {
      setIsSaving(true);
      const result = await appVersionService.setMinimumVersion({
        minimumVersion: trimmedVersion,
      });
      setCurrentVersion(result.minimumVersion);
      showSuccessMessage(toast, {
        title: 'Mindestversion aktualisiert',
        description: `Die Mindestversion wurde erfolgreich auf ${result.minimumVersion} gesetzt.`,
      });
    } catch (error) {
      console.error('Fehler beim Setzen der Mindestversion:', error);
      showUserFriendlyError(error, toast, () => handleSubmit(e), 'generic');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChangelogChanges = changelogContent !== originalContent;
  const canSaveChangelog = isCreatingNew
    ? newVersionInput.trim() && changelogContent.trim()
    : selectedVersion && changelogContent.trim() && hasChangelogChanges;

  const pageContent = (
    <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
      {/* Header Section */}
      <motion.div
        className={cn(glassCard, 'p-4 sm:p-6 mb-6')}
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={defaultTransition}
      >
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <AnimatedButton
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className={cn(glassButton, 'rounded-full')}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Zurück zum Dashboard</span>
            </AnimatedButton>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
              App-Version-Verwaltung
            </h1>
          </div>
          <AnimatedButton
            variant="ghost"
            size="icon"
            onClick={loadInitialData}
            disabled={isLoading || isLoadingChangelogs}
            className={cn(glassButton, 'rounded-full')}
            title="Aktualisieren"
          >
            <RefreshCw
              className={cn('h-5 w-5', (isLoading || isLoadingChangelogs) && 'animate-spin')}
            />
            <span className="sr-only">Aktualisieren</span>
          </AnimatedButton>
        </div>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ ...defaultTransition, delay: 0.1 }}
        className="space-y-6"
      >
        {/* Aktuelle Version Card */}
        <Card className={cn(glassCard)}>
          <CardHeader>
            <CardTitle className="text-foreground">Aktuelle Mindestversion</CardTitle>
            <CardDescription className="text-muted-foreground">
              Die aktuell konfigurierte Mindestversion der App
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentVersion ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-foreground">
                      {currentVersion}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-500/50">
                      Aktiv
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Format: X.Y.Z (Semantic Versioning)
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground">Keine Version konfiguriert</span>
                  <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/50">
                    Nicht gesetzt
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Version setzen Card */}
        <Card className={cn(glassCard)}>
          <CardHeader>
            <CardTitle className="text-foreground">Mindestversion setzen</CardTitle>
            <CardDescription className="text-muted-foreground">
              Setzen Sie die Mindestversion für die App. Wenn bereits eine Version existiert, wird
              sie aktualisiert.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version" className="text-foreground">
                  Version
                </Label>
                <Input
                  id="version"
                  type="text"
                  placeholder="z.B. 1.2.3"
                  value={versionInput}
                  onChange={e => setVersionInput(e.target.value)}
                  disabled={isLoading || isSaving}
                  className={cn(glassInput)}
                  pattern="^\d+\.\d+\.\d+$"
                />
                <p className="text-xs text-muted-foreground">
                  Format: X.Y.Z (z.B. 1.2.3) - Semantic Versioning
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <LoadingButton
                  type="submit"
                  disabled={isLoading || isSaving || !versionInput.trim()}
                  loading={isSaving}
                  className={cn(
                    glassButton,
                    'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                  )}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Version speichern
                </LoadingButton>
                {currentVersion && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVersionInput(currentVersion)}
                    disabled={isLoading || isSaving}
                    className={cn(glassButton)}
                  >
                    Aktuelle Version verwenden
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Changelog-Verwaltung Card */}
        <Card className={cn(glassCard)}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Changelog-Verwaltung
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Verwalten Sie Changelogs für verschiedene App-Versionen im Markdown-Format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Version Auswahl / Erstellen */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isCreatingNew ? (
                  <>
                    <div className="flex-1">
                      <Label htmlFor="changelog-version" className="text-foreground mb-2 block">
                        Version auswählen
                      </Label>
                      <Select
                        value={selectedVersion || ''}
                        onValueChange={handleVersionSelect}
                        disabled={isLoadingChangelogs || isSavingChangelog}
                      >
                        <SelectTrigger className={cn(glassInput, 'w-full')}>
                          <SelectValue placeholder="Version wählen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {changelogs.length === 0 ? (
                            <SelectItem value="__no_changelogs__" disabled>
                              Keine Changelogs vorhanden
                            </SelectItem>
                          ) : (
                            changelogs.map(changelog => (
                              <SelectItem key={changelog.version} value={changelog.version}>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span>Version {changelog.version}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <AnimatedButton
                        onClick={handleCreateNewMode}
                        disabled={isLoadingChangelogs || isSavingChangelog}
                        className={cn(glassButton)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Neuer Changelog
                      </AnimatedButton>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <Label htmlFor="new-version" className="text-foreground mb-2 block">
                        Neue Version
                      </Label>
                      <Input
                        id="new-version"
                        type="text"
                        placeholder="z.B. 1.2.3"
                        value={newVersionInput}
                        onChange={e => setNewVersionInput(e.target.value)}
                        disabled={isSavingChangelog}
                        className={cn(glassInput)}
                        pattern="^\d+\.\d+\.\d+$"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: X.Y.Z (z.B. 1.2.3)
                      </p>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={handleCancelNewMode}
                        disabled={isSavingChangelog}
                        className={cn(glassButton)}
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {/* Markdown Editor */}
              {(selectedVersion || isCreatingNew) && (
                <div className="space-y-2">
                  <Label className="text-foreground">
                    Changelog-Inhalt{' '}
                    {isCreatingNew && newVersionInput && `(Version ${newVersionInput})`}
                    {!isCreatingNew && selectedVersion && `(Version ${selectedVersion})`}
                  </Label>
                  <MarkdownEditor
                    value={changelogContent}
                    onChange={setChangelogContent}
                    placeholder="# Changelog für Version X.Y.Z

## Neue Features
- Feature 1
- Feature 2

## Bugfixes
- Fix 1
- Fix 2

## Verbesserungen
- Verbesserung 1"
                    minHeight="min-h-[300px]"
                  />
                </div>
              )}

              {/* Keine Auswahl Hinweis */}
              {!selectedVersion && !isCreatingNew && changelogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Changelogs vorhanden.</p>
                  <p className="text-sm">
                    Klicken Sie auf "Neuer Changelog", um einen zu erstellen.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              {(selectedVersion || isCreatingNew) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <LoadingButton
                    onClick={handleChangelogSave}
                    disabled={!canSaveChangelog || isSavingChangelog}
                    loading={isSavingChangelog}
                    className={cn(
                      glassButton,
                      'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                    )}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isCreatingNew ? 'Changelog erstellen' : 'Changelog speichern'}
                  </LoadingButton>

                  {!isCreatingNew && selectedVersion && (
                    <AnimatedButton
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isSavingChangelog || isDeletingChangelog}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Changelog löschen
                    </AnimatedButton>
                  )}

                  {hasChangelogChanges && !isCreatingNew && (
                    <Button
                      variant="outline"
                      onClick={() => setChangelogContent(originalContent)}
                      disabled={isSavingChangelog}
                      className={cn(glassButton)}
                    >
                      Änderungen verwerfen
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className={cn(glassCard, 'border-blue-500/50 bg-blue-500/5')}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Information</p>
                <p className="text-xs text-muted-foreground">
                  Die Mindestversion bestimmt, welche App-Versionen ein Update benötigen. Apps mit
                  einer niedrigeren Version als der Mindestversion werden aufgefordert, ein Update
                  durchzuführen.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Versionsformat:</strong> X.Y.Z (Semantic Versioning)
                  <br />
                  <strong>Beispiel:</strong> 1.2.3 (Major.Minor.Patch)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  <strong>Changelogs:</strong> Markdown-Changelogs werden automatisch beim
                  Version-Check an die App übermittelt, sofern ein Changelog für die entsprechende
                  Version existiert.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className={cn(glassCard)}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Changelog löschen</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Möchten Sie den Changelog für Version {selectedVersion} wirklich löschen? Diese Aktion
              kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={cn(glassButton)} disabled={isDeletingChangelog}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleChangelogDelete}
              disabled={isDeletingChangelog}
              className={cn(
                'bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl',
                isDeletingChangelog && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isDeletingChangelog ? 'Wird gelöscht...' : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen relative overflow-hidden">
          <Background />
          <AppVersionManagementSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {pageContent}
      </div>
    </PageTransition>
  );
}
