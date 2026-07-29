import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AdventCalendarEntry } from '@/models/advent-calendar';
import { useAdventCalendarService } from '@/services/adventCalendarService';
import { useUserService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/models/users';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

export function useAdventCalendarManagement() {
  const [entries, setEntries] = useState<AdventCalendarEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [featureStatus, setFeatureStatus] = useState<boolean>(false);
  const [isLoadingFeatureStatus, setIsLoadingFeatureStatus] = useState(true);
  const [isUpdatingFeatureStatus, setIsUpdatingFeatureStatus] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);
  const adventCalendarService = useAdventCalendarService();
  const userService = useUserService();
  const { getUserId } = useAuth();
  const navigate = useNavigate();

  const isAdminOrSuperAdmin = userRole === UserType.ADMIN || userRole === UserType.SUPER_ADMIN;

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedEntries = await adventCalendarService.getAll();
      const sortedEntries = fetchedEntries.sort((a, b) => a.number - b.number);
      setEntries(sortedEntries);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      showUserFriendlyError(error, toast, () => loadData(), 'load-advent-calendar');
    } finally {
      setLoading(false);
    }
  };

  const loadFeatureStatus = async () => {
    try {
      setIsLoadingFeatureStatus(true);
      const status = await adventCalendarService.getFeatureStatus();
      setFeatureStatus(status.isFeatureActive);
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
    try {
      setIsUpdatingFeatureStatus(true);
      const status = await adventCalendarService.setFeatureStatus(newValue);
      setFeatureStatus(status.isFeatureActive);
      showSuccessMessage(toast, {
        title: status.isFeatureActive
          ? 'Adventskalender-Feature wurde aktiviert'
          : 'Adventskalender-Feature wurde deaktiviert',
        description: status.isFeatureActive
          ? 'Der Adventskalender ist jetzt für Benutzer sichtbar.'
          : 'Der Adventskalender wurde für Benutzer ausgeblendet.',
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Feature-Status:', error);
      showUserFriendlyError(
        error,
        toast,
        () => handleFeatureStatusToggle(newValue),
        'save-advent-calendar'
      );
    } finally {
      setIsUpdatingFeatureStatus(false);
    }
  };

  useEffect(() => {
    loadData();
    loadFeatureStatus();
    loadUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (entryId: string) => {
    if (!confirm('Möchten Sie diesen Adventskalender-Eintrag wirklich löschen?')) {
      return;
    }

    try {
      await adventCalendarService.delete(entryId);
      showSuccessMessage(toast, {
        title: 'Eintrag gelöscht',
        description: 'Der Adventskalender-Eintrag wurde erfolgreich gelöscht.',
      });
      loadData();
    } catch (error) {
      console.error('Fehler beim Löschen des Eintrags:', error);
      showUserFriendlyError(error, toast, () => handleDelete(entryId), 'delete-advent-calendar');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.number.toString().includes(searchQuery);
    return matchesSearch;
  });

  return {
    navigate,
    loading,
    searchQuery,
    setSearchQuery,
    featureStatus,
    isLoadingFeatureStatus,
    isUpdatingFeatureStatus,
    isAdminOrSuperAdmin,
    filteredEntries,
    handleFeatureStatusToggle,
    handleDelete,
  };
}
