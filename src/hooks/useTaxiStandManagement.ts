import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useTaxiStandService } from '@/services/taxiStandService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { TaxiStand, TaxiStandFeatureStatus } from '@/models/taxi-stand';
import { UserType } from '@/models/users';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

export function useTaxiStandManagement() {
  const [stands, setStands] = useState<TaxiStand[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureDisabledError, setFeatureDisabledError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState<TaxiStandFeatureStatus>({
    isFeatureActive: false,
    startDate: undefined,
  });
  const [startDateInput, setStartDateInput] = useState('');
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);
  const [isUpdatingFeatureStatus, setIsUpdatingFeatureStatus] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const taxiStandService = useTaxiStandService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadStands = async () => {
    try {
      setLoading(true);
      setFeatureDisabledError(false);
      const fetchedStands = await taxiStandService.getAll();
      setStands(fetchedStands.filter(stand => stand.id !== 'feature-status'));
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 503) {
        setFeatureDisabledError(true);
        setStands([]);
      } else {
        console.error('Fehler beim Laden der Taxistandorte:', error);
        showUserFriendlyError(error, toast, () => loadStands(), 'generic');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureStatus = async () => {
    try {
      setIsLoadingFeatureStatus(true);
      const status = await taxiStandService.getFeatureStatus();
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
      const status = await taxiStandService.setFeatureStatus(newValue, startDateInput || undefined);
      setFeatureStatus(status);
      showSuccessMessage(toast, {
        title: status.isFeatureActive
          ? 'Taxistandorte-Feature wurde aktiviert'
          : 'Taxistandorte-Feature wurde deaktiviert',
        description: status.isFeatureActive
          ? 'Die Taxistandorte sind jetzt für Benutzer sichtbar.'
          : 'Die Taxistandorte wurden für Benutzer ausgeblendet.',
      });
      if (status.isFeatureActive) {
        loadStands();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Feature-Status:', error);
      showUserFriendlyError(error, toast, () => handleFeatureStatusToggle(newValue), 'generic');
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  const handleStartDateSave = async () => {
    if (isUpdatingFeatureStatus) return;

    try {
      setIsUpdatingFeatureStatus(true);
      const status = await taxiStandService.setFeatureStatus(
        featureStatus.isFeatureActive,
        startDateInput || undefined
      );
      setFeatureStatus(status);
      showSuccessMessage(toast, {
        title: 'Startdatum aktualisiert',
        description: 'Das Startdatum wurde erfolgreich gespeichert.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Startdatums:', error);
      showUserFriendlyError(error, toast, () => handleStartDateSave(), 'generic');
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  useEffect(() => {
    loadFeatureStatus();
    loadStands();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (standId: string) => {
    if (!confirm('Möchten Sie diesen Taxistandort wirklich löschen?')) return;

    try {
      await taxiStandService.delete(standId);
      showSuccessMessage(toast, {
        title: 'Taxistandort gelöscht',
        description: 'Der Taxistandort wurde erfolgreich gelöscht.',
      });
      loadStands();
    } catch (error) {
      console.error('Fehler beim Löschen des Taxistandorts:', error);
      showUserFriendlyError(error, toast, () => handleDelete(standId), 'generic');
    }
  };

  const filteredStands = stands.filter(stand => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (stand.title && stand.title.toLowerCase().includes(query)) ||
      stand.location.address.toLowerCase().includes(query) ||
      stand.phoneNumber.toLowerCase().includes(query)
    );
  });

  const totalPhoneClicks = stands.reduce(
    (sum, stand) => sum + (stand.phoneClickTimestamps?.length || 0),
    0
  );

  const isInitialLoading = loading || isLoadingFeatureStatus;

  return {
    navigate,
    searchQuery,
    setSearchQuery,
    featureStatus,
    startDateInput,
    setStartDateInput,
    isLoadingFeatureStatus,
    isUpdatingFeatureStatus,
    isAdminOrSuperAdmin,
    featureDisabledError,
    filteredStands,
    loading,
    isInitialLoading,
    stands,
    totalPhoneClicks,
    handleFeatureStatusToggle,
    handleStartDateSave,
    handleDelete,
  };
}
