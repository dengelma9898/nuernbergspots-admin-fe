import { useEffect, useState, useCallback, useRef } from 'react';
import { useUserService } from '@/services/userService';
import { useBusinessService } from '@/services/businessService';
import { useContactService } from '@/services/contactService';

export function useDashboardStats() {
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [usersInReview, setUsersInReview] = useState<number>(0);
  const [openContactRequests, setOpenContactRequests] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState<boolean>(true);
  const [usersInReviewLoading, setUsersInReviewLoading] = useState<boolean>(true);
  const [contactRequestsLoading, setContactRequestsLoading] = useState<boolean>(true);
  const [totalUsersLoading, setTotalUsersLoading] = useState<boolean>(true);

  const userService = useUserService();
  const businessService = useBusinessService();
  const contactService = useContactService();
  const isInitialMount = useRef(true);

  const fetchPendingApprovals = useCallback(async () => {
    try {
      setPendingApprovalsLoading(true);
      const count = await businessService.getPendingApprovalsCount();
      setPendingApprovals(count);
    } catch (error) {
      console.error('Fehler beim Laden der ausstehenden Genehmigungen:', error);
    } finally {
      setPendingApprovalsLoading(false);
    }
  }, [businessService]);

  const fetchUsersInReview = useCallback(async () => {
    try {
      setUsersInReviewLoading(true);
      const count = await userService.getBusinessUsersInReviewCount();
      setUsersInReview(count);
    } catch (error) {
      console.error('Fehler beim Laden der zu überprüfenden Benutzer:', error);
    } finally {
      setUsersInReviewLoading(false);
    }
  }, [userService]);

  const fetchOpenContactRequests = useCallback(async () => {
    try {
      setContactRequestsLoading(true);
      const openRequests = await contactService.getOpenContactRequestsCount();
      setOpenContactRequests(openRequests);
    } catch (error) {
      console.error('Fehler beim Laden der offenen Kontaktanfragen:', error);
    } finally {
      setContactRequestsLoading(false);
    }
  }, [contactService]);

  const fetchTotalUsers = useCallback(async () => {
    try {
      setTotalUsersLoading(true);
      const allUsers = await userService.getAllUsers();
      setTotalUsers(allUsers.length);
    } catch (error) {
      console.error('Fehler beim Laden der User-Anzahl:', error);
    } finally {
      setTotalUsersLoading(false);
    }
  }, [userService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchPendingApprovals();
      fetchUsersInReview();
      fetchOpenContactRequests();
      fetchTotalUsers();
    }
  }, [fetchPendingApprovals, fetchUsersInReview, fetchOpenContactRequests, fetchTotalUsers]);

  return {
    pendingApprovals,
    usersInReview,
    openContactRequests,
    totalUsers,
    pendingApprovalsLoading,
    usersInReviewLoading,
    contactRequestsLoading,
    totalUsersLoading,
  };
}
