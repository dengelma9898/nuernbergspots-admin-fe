import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, Save, RefreshCw, Plus, Trash2, FileText } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset, inputPreset } from '@/lib/designTokens';
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
import { useAppVersionManagement } from '@/hooks/useAppVersionManagement';
import { AppVersionManagementSkeleton } from '@/components/app-version/AppVersionManagementSkeleton';

export function AppVersionManagementContent() {
  const navigate = useNavigate();
  const management = useAppVersionManagement();

  if (management.isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <AppVersionManagementSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto max-w-full p-4 sm:p-6 lg:p-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden relative z-10">
        <motion.div
          className={cn(cardPreset, 'p-4 sm:p-6 mb-6')}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <LoadingButton
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className={cn(buttonPreset, 'rounded-full')}
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Zurück zum Dashboard</span>
              </LoadingButton>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                App-Version-Verwaltung
              </h1>
            </div>
            <LoadingButton
              variant="ghost"
              size="icon"
              onClick={management.loadInitialData}
              disabled={management.isLoading || management.isLoadingChangelogs}
              className={cn(buttonPreset, 'rounded-full')}
              title="Aktualisieren"
            >
              <RefreshCw
                className={cn(
                  'h-5 w-5',
                  (management.isLoading || management.isLoadingChangelogs) && 'animate-spin'
                )}
              />
              <span className="sr-only">Aktualisieren</span>
            </LoadingButton>
          </div>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ ...defaultTransition, delay: 0.1 }}
          className="space-y-6"
        >
          <Card className={cn(cardPreset)}>
            <CardHeader>
              <CardTitle className="text-foreground">Aktuelle Mindestversion</CardTitle>
              <CardDescription className="text-muted-foreground">
                Die aktuell konfigurierte Mindestversion der App
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {management.currentVersion ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-foreground">
                        {management.currentVersion}
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
                    <span className="text-lg text-muted-foreground">
                      Keine Version konfiguriert
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full border border-yellow-500/50">
                      Nicht gesetzt
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(cardPreset)}>
            <CardHeader>
              <CardTitle className="text-foreground">Mindestversion setzen</CardTitle>
              <CardDescription className="text-muted-foreground">
                Setzen Sie die Mindestversion für die App. Wenn bereits eine Version existiert, wird
                sie aktualisiert.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={management.handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-foreground">
                    Version
                  </Label>
                  <Input
                    id="version"
                    type="text"
                    placeholder="z.B. 1.2.3"
                    value={management.versionInput}
                    onChange={e => management.setVersionInput(e.target.value)}
                    disabled={management.isLoading || management.isSaving}
                    className={cn(inputPreset)}
                    pattern="^\d+\.\d+\.\d+$"
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: X.Y.Z (z.B. 1.2.3) - Semantic Versioning
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <LoadingButton
                    type="submit"
                    disabled={
                      management.isLoading || management.isSaving || !management.versionInput.trim()
                    }
                    loading={management.isSaving}
                    className={cn(
                      buttonPreset,
                      'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                    )}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Version speichern
                  </LoadingButton>
                  {management.currentVersion && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => management.setVersionInput(management.currentVersion || '')}
                      disabled={management.isLoading || management.isSaving}
                      className={cn(buttonPreset)}
                    >
                      Aktuelle Version verwenden
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className={cn(cardPreset)}>
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
                <div className="flex flex-col sm:flex-row gap-4">
                  {!management.isCreatingNew ? (
                    <>
                      <div className="flex-1">
                        <Label htmlFor="changelog-version" className="text-foreground mb-2 block">
                          Version auswählen
                        </Label>
                        <Select
                          value={management.selectedVersion || ''}
                          onValueChange={management.handleVersionSelect}
                          disabled={management.isLoadingChangelogs || management.isSavingChangelog}
                        >
                          <SelectTrigger className={cn(inputPreset, 'w-full')}>
                            <SelectValue placeholder="Version wählen..." />
                          </SelectTrigger>
                          <SelectContent>
                            {management.changelogs.length === 0 ? (
                              <SelectItem value="__no_changelogs__" disabled>
                                Keine Changelogs vorhanden
                              </SelectItem>
                            ) : (
                              management.changelogs.map(changelog => (
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
                        <LoadingButton
                          onClick={management.handleCreateNewMode}
                          disabled={management.isLoadingChangelogs || management.isSavingChangelog}
                          className={cn(buttonPreset)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Neuer Changelog
                        </LoadingButton>
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
                          value={management.newVersionInput}
                          onChange={e => management.setNewVersionInput(e.target.value)}
                          disabled={management.isSavingChangelog}
                          className={cn(inputPreset)}
                          pattern="^\d+\.\d+\.\d+$"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Format: X.Y.Z (z.B. 1.2.3)
                        </p>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={management.handleCancelNewMode}
                          disabled={management.isSavingChangelog}
                          className={cn(buttonPreset)}
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </>
                  )}
                </div>

                {(management.selectedVersion || management.isCreatingNew) && (
                  <div className="space-y-2">
                    <Label className="text-foreground">
                      Changelog-Inhalt{' '}
                      {management.isCreatingNew &&
                        management.newVersionInput &&
                        `(Version ${management.newVersionInput})`}
                      {!management.isCreatingNew &&
                        management.selectedVersion &&
                        `(Version ${management.selectedVersion})`}
                    </Label>
                    <MarkdownEditor
                      value={management.changelogContent}
                      onChange={management.setChangelogContent}
                      placeholder="# Changelog für Version X.Y.Z"
                      minHeight="min-h-[300px]"
                    />
                  </div>
                )}

                {!management.selectedVersion &&
                  !management.isCreatingNew &&
                  management.changelogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Noch keine Changelogs vorhanden.</p>
                      <p className="text-sm">
                        Klicken Sie auf &quot;Neuer Changelog&quot;, um einen zu erstellen.
                      </p>
                    </div>
                  )}

                {(management.selectedVersion || management.isCreatingNew) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <LoadingButton
                      onClick={management.handleChangelogSave}
                      disabled={!management.canSaveChangelog || management.isSavingChangelog}
                      loading={management.isSavingChangelog}
                      className={cn(
                        buttonPreset,
                        'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                      )}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {management.isCreatingNew ? 'Changelog erstellen' : 'Changelog speichern'}
                    </LoadingButton>

                    {!management.isCreatingNew && management.selectedVersion && (
                      <LoadingButton
                        variant="destructive"
                        onClick={() => management.setDeleteDialogOpen(true)}
                        disabled={management.isSavingChangelog || management.isDeletingChangelog}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Changelog löschen
                      </LoadingButton>
                    )}

                    {management.hasChangelogChanges && !management.isCreatingNew && (
                      <Button
                        variant="outline"
                        onClick={() => management.setChangelogContent(management.originalContent)}
                        disabled={management.isSavingChangelog}
                        className={cn(buttonPreset)}
                      >
                        Änderungen verwerfen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(cardPreset, 'border-blue-500/50 bg-blue-500/5')}>
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

        <AlertDialog
          open={management.deleteDialogOpen}
          onOpenChange={management.setDeleteDialogOpen}
        >
          <AlertDialogContent className={cn(cardPreset)}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Changelog löschen</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Möchten Sie den Changelog für Version {management.selectedVersion} wirklich löschen?
                Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className={cn(buttonPreset)}
                disabled={management.isDeletingChangelog}
              >
                Abbrechen
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={management.handleChangelogDelete}
                disabled={management.isDeletingChangelog}
                className={cn(
                  'bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl',
                  management.isDeletingChangelog && 'opacity-50 cursor-not-allowed'
                )}
              >
                {management.isDeletingChangelog ? 'Wird gelöscht...' : 'Löschen'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
