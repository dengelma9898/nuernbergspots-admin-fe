import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Business } from '@/models/business';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';
import type { useBusinessService } from '@/services/businessService';

interface UseBusinessBulkSelectionParams {
  businesses: Business[];
  businessService: ReturnType<typeof useBusinessService>;
  onDeleted: () => Promise<void>;
}

export function useBusinessBulkSelection({
  businesses,
  businessService,
  onDeleted,
}: UseBusinessBulkSelectionParams) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const selectedBusinesses = useMemo(
    () => businesses.filter(business => selectedBusinessIds.has(business.id)),
    [businesses, selectedBusinessIds]
  );

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedBusinessIds(new Set());
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      exitSelectionMode();
      return;
    }
    setIsSelectionMode(true);
  };

  const toggleBusinessSelection = (businessId: string) => {
    setSelectedBusinessIds(prev => {
      const next = new Set(prev);
      if (next.has(businessId)) {
        next.delete(businessId);
      } else {
        next.add(businessId);
      }
      return next;
    });
  };

  const selectAllVisible = (visibleBusinesses: Business[]) => {
    setSelectedBusinessIds(new Set(visibleBusinesses.map(business => business.id)));
  };

  const deselectAll = () => {
    setSelectedBusinessIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (bulkDeleting || selectedBusinessIds.size === 0) return;
    if (
      !confirm(
        `Möchten Sie wirklich ${selectedBusinessIds.size} Partner löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      )
    ) {
      return;
    }

    try {
      setBulkDeleting(true);
      const ids = Array.from(selectedBusinessIds);
      for (const id of ids) {
        await businessService.deleteBusiness(id);
      }
      showSuccessMessage(toast, {
        title: 'Partner gelöscht',
        description: `${ids.length} Partner wurden erfolgreich gelöscht.`,
      });
      exitSelectionMode();
      await onDeleted();
    } catch (error) {
      console.error('Fehler beim Bulk-Löschen:', error);
      showUserFriendlyError(error, toast, () => handleBulkDelete(), 'delete-business');
    } finally {
      setBulkDeleting(false);
    }
  };

  return {
    isSelectionMode,
    selectedBusinessIds,
    selectedBusinesses,
    bulkDeleting,
    toggleSelectionMode,
    toggleBusinessSelection,
    selectAllVisible,
    deselectAll,
    handleBulkDelete,
    exitSelectionMode,
  };
}
