import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useUserService, User } from '@/services/userService';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

export function useUserBlockManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const userService = useUserService();

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error('Fehler beim Laden der User:', error);
      showUserFriendlyError(error, toast, () => loadUsers(), 'load-users');
    } finally {
      setIsLoading(false);
    }
  }, [userService]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        user =>
          user.email.toLowerCase().includes(query) ||
          (user.name && user.name.toLowerCase().includes(query)) ||
          user.id.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleBlockClick = (user: User) => {
    console.log('Selected user:', user);
    setSelectedUser(user);
    setBlockReason(user.isBlocked ? '' : '');
    setIsBlockDialogOpen(true);
  };

  const handleBlockConfirm = async () => {
    if (!selectedUser) {
      setValidationErrors(['Kein User ausgewählt']);
      return;
    }

    setValidationErrors([]);

    const customerId = selectedUser.customerId;
    const isBlockingUser = !selectedUser.isBlocked;

    if (!customerId) {
      console.error('User object:', selectedUser);
      showUserFriendlyError(
        new Error('Customer-ID nicht gefunden. Der User kann nicht blockiert werden.'),
        toast,
        undefined,
        'block-user'
      );
      return;
    }

    try {
      setIsBlocking(true);
      await userService.blockUser({
        customerId: String(customerId),
        isBlocked: isBlockingUser,
        blockReason: isBlockingUser ? blockReason : undefined,
      });

      showSuccessMessage(toast, {
        title: isBlockingUser ? 'User erfolgreich blockiert' : 'User erfolgreich entsperrt',
        description: `${selectedUser.email} wurde erfolgreich ${isBlockingUser ? 'blockiert' : 'entsperrt'}.`,
      });

      setIsBlockDialogOpen(false);
      setSelectedUser(null);
      setBlockReason('');
      await loadUsers();
    } catch (error) {
      console.error('Fehler beim Blockieren/Entsperren:', error);
      showUserFriendlyError(
        error,
        toast,
        () => handleBlockConfirm(),
        isBlockingUser ? 'block-user' : 'unblock-user'
      );
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDialogClose = () => {
    setIsBlockDialogOpen(false);
    setBlockReason('');
    setValidationErrors([]);
  };

  return {
    navigate,
    filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery,
    isBlockDialogOpen,
    setIsBlockDialogOpen,
    selectedUser,
    blockReason,
    setBlockReason,
    isBlocking,
    validationErrors,
    handleBlockClick,
    handleBlockConfirm,
    handleDialogClose,
  };
}
