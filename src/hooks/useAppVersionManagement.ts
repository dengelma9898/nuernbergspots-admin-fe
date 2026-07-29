import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { useAppVersionService } from '@/services/appVersionService';
import type { Changelog } from '@/models/app-version';
import { compareVersions, validateVersionFormat } from '@/utils/appVersionUtils';

export function useAppVersionManagement() {
  const appVersionService = useAppVersionService();

  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [versionInput, setVersionInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      const sorted = [...data].sort((a, b) => compareVersions(a.version, b.version));
      setChangelogs(sorted);

      if (!selectedVersion && sorted.length > 0) {
        handleVersionSelect(sorted[0].version, sorted);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Changelogs:', error);
      showUserFriendlyError(error, toast, () => loadAllChangelogs(), 'generic');
    } finally {
      setIsLoadingChangelogs(false);
    }
  };

  const handleVersionSelect = async (version: string, sourceChangelogs = changelogs) => {
    setSelectedVersion(version);
    setIsCreatingNew(false);
    setNewVersionInput('');

    const existingChangelog = sourceChangelogs.find(c => c.version === version);
    if (existingChangelog) {
      setChangelogContent(existingChangelog.content);
      setOriginalContent(existingChangelog.content);
    } else {
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
      const version = newVersionInput.trim();
      if (!version) {
        toast.error('Bitte geben Sie eine Version ein');
        return;
      }
      if (!validateVersionFormat(version)) {
        toast.error('Ungültiges Versionsformat. Bitte verwenden Sie das Format X.Y.Z (z.B. 1.2.3)');
        return;
      }
      if (changelogs.some(c => c.version === version)) {
        toast.error('Für diese Version existiert bereits ein Changelog');
        return;
      }

      try {
        setIsSavingChangelog(true);
        const newChangelog = await appVersionService.createChangelog({ version, content });
        showSuccessMessage(toast, {
          title: 'Changelog erstellt',
          description: `Changelog für Version ${version} wurde erfolgreich erstellt.`,
        });
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
      try {
        setIsSavingChangelog(true);
        const updatedChangelog = await appVersionService.updateChangelog(selectedVersion, {
          content,
        });
        showSuccessMessage(toast, {
          title: 'Changelog aktualisiert',
          description: `Changelog für Version ${selectedVersion} wurde erfolgreich aktualisiert.`,
        });
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
      const updatedChangelogs = changelogs.filter(c => c.version !== selectedVersion);
      setChangelogs(updatedChangelogs);
      setDeleteDialogOpen(false);

      if (updatedChangelogs.length > 0) {
        handleVersionSelect(updatedChangelogs[0].version, updatedChangelogs);
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

    if (isSaving) return;

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
    ? Boolean(newVersionInput.trim() && changelogContent.trim())
    : Boolean(selectedVersion && changelogContent.trim() && hasChangelogChanges);

  return {
    currentVersion,
    versionInput,
    setVersionInput,
    isLoading,
    isSaving,
    changelogs,
    selectedVersion,
    changelogContent,
    setChangelogContent,
    newVersionInput,
    setNewVersionInput,
    isCreatingNew,
    isLoadingChangelogs,
    isSavingChangelog,
    isDeletingChangelog,
    deleteDialogOpen,
    setDeleteDialogOpen,
    originalContent,
    hasChangelogChanges,
    canSaveChangelog,
    loadInitialData,
    handleVersionSelect,
    handleCreateNewMode,
    handleCancelNewMode,
    handleChangelogSave,
    handleChangelogDelete,
    handleSubmit,
  };
}
