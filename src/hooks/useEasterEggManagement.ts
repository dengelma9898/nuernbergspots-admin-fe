import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useEasterEggService } from '@/services/easterEggService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { EasterEgg, EasterEggStatistics, EasterEggFeatureStatus } from '@/models/easter-egg';
import { UserType } from '@/models/users';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { formatEasterEggDate } from '@/utils/easterEggFormatUtils';

export function useEasterEggManagement() {
  const [eggs, setEggs] = useState<EasterEgg[]>([]);
  const [statistics, setStatistics] = useState<EasterEggStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [featureDisabledError, setFeatureDisabledError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState<EasterEggFeatureStatus>({
    isFeatureActive: false,
    startDate: undefined,
  });
  const [startDateInput, setStartDateInput] = useState('');
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);
  const [isUpdatingFeatureStatus, setIsUpdatingFeatureStatus] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const easterEggService = useEasterEggService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadEggs = async () => {
    try {
      setLoading(true);
      setFeatureDisabledError(false);
      const fetchedEggs = await easterEggService.getAll(false);
      setEggs(fetchedEggs);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 503) {
        setFeatureDisabledError(true);
        setEggs([]);
      } else {
        console.error('Fehler beim Laden der Ostereier:', error);
        showUserFriendlyError(error, toast, () => loadEggs(), 'load-easter-egg');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await easterEggService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
  };

  const loadFeatureStatus = async () => {
    try {
      setIsLoadingFeatureStatus(true);
      const status = await easterEggService.getFeatureStatus();
      setFeatureStatus(status);
      setStartDateInput(status.startDate || '');
    } catch (error) {
      console.error('Fehler beim Laden des Feature-Status:', error);
    } finally {
      setIsLoadingFeatureStatus(false);
    }
  };

  const loadUserRole = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const userProfile = await userService.getUserProfile(userId);
      setUserRole(userProfile.userType);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  };

  const handleFeatureStatusToggle = async (newValue: boolean) => {
    if (isUpdatingFeatureStatus) return;

    try {
      setIsUpdatingFeatureStatus(true);
      const status = await easterEggService.setFeatureStatus(newValue, startDateInput || undefined);
      setFeatureStatus(status);
      showSuccessMessage(toast, {
        title: status.isFeatureActive
          ? 'Ostereiersuche-Feature wurde aktiviert'
          : 'Ostereiersuche-Feature wurde deaktiviert',
        description: status.isFeatureActive
          ? 'Die Ostereiersuche ist jetzt für Benutzer sichtbar.'
          : 'Die Ostereiersuche wurde für Benutzer ausgeblendet.',
      });
      if (status.isFeatureActive) {
        loadEggs();
        loadStatistics();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Feature-Status:', error);
      showUserFriendlyError(
        error,
        toast,
        () => handleFeatureStatusToggle(newValue),
        'save-easter-egg'
      );
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  const handleStartDateSave = async () => {
    if (isUpdatingFeatureStatus) return;

    try {
      setIsUpdatingFeatureStatus(true);
      const status = await easterEggService.setFeatureStatus(
        featureStatus.isFeatureActive,
        startDateInput || undefined
      );
      setFeatureStatus(status);
      showSuccessMessage(toast, {
        title: 'Startdatum aktualisiert',
        description: `Das Startdatum wurde auf ${formatEasterEggDate(startDateInput)} gesetzt.`,
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Startdatums:', error);
      showUserFriendlyError(error, toast, () => handleStartDateSave(), 'save-easter-egg');
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  useEffect(() => {
    loadFeatureStatus();
    loadEggs();
    loadStatistics();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (eggId: string) => {
    if (!confirm('Möchten Sie dieses Osterei wirklich löschen?')) return;

    try {
      await easterEggService.delete(eggId);
      showSuccessMessage(toast, {
        title: 'Osterei gelöscht',
        description: 'Das Osterei wurde erfolgreich gelöscht.',
      });
      loadEggs();
      loadStatistics();
    } catch (error) {
      console.error('Fehler beim Löschen des Ostereis:', error);
      showUserFriendlyError(error, toast, () => handleDelete(eggId), 'delete-easter-egg');
    }
  };

  const filteredEggs = eggs.filter(egg => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      egg.title.toLowerCase().includes(query) ||
      egg.location.address.toLowerCase().includes(query) ||
      (egg.prizeDescription && egg.prizeDescription.toLowerCase().includes(query))
    );
  });

  const isInitialLoading = loading && isLoadingFeatureStatus;

  return {
    navigate,
    statistics,
    searchQuery,
    setSearchQuery,
    featureStatus,
    startDateInput,
    setStartDateInput,
    isLoadingFeatureStatus,
    isUpdatingFeatureStatus,
    isAdminOrSuperAdmin,
    featureDisabledError,
    filteredEggs,
    loading,
    isInitialLoading,
    handleFeatureStatusToggle,
    handleStartDateSave,
    handleDelete,
  };
}
