import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { SpecialPoll, SpecialPollResponse, SpecialPollStatus } from '@/models/specialPoll';
import { UserType } from '@/models/users';
import { useSpecialPollService } from '@/services/specialPollService';
import { useUserService } from '@/services/userService';
import { showSuccessMessage, showUserFriendlyError } from '@/utils/errorUtils';

export function normalizePollResponses(poll: SpecialPoll): SpecialPoll {
  return {
    ...poll,
    isHighlighted: poll.isHighlighted ?? false,
    responses: poll.responses.map(r => ({
      ...r,
      upvotedUserIds: r.upvotedUserIds ?? [],
    })),
  };
}

export function useSpecialPollDetail() {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();

  const specialPollService = useSpecialPollService();
  const specialPollServiceRef = useRef(specialPollService);
  useEffect(() => {
    specialPollServiceRef.current = specialPollService;
  }, [specialPollService]);

  const userService = useUserService();
  const userServiceRef = useRef(userService);
  useEffect(() => {
    userServiceRef.current = userService;
  }, [userService]);

  const { getUserId } = useAuth();

  const [poll, setPoll] = useState<SpecialPoll | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<SpecialPollResponse | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [isHighlightUpdating, setIsHighlightUpdating] = useState(false);
  const [upvotingResponseId, setUpvotingResponseId] = useState<string | null>(null);
  const [removingOwnResponse, setRemovingOwnResponse] = useState(false);
  const [pollDeleteOpen, setPollDeleteOpen] = useState(false);
  const [isDeletingPoll, setIsDeletingPoll] = useState(false);
  const [userRole, setUserRole] = useState<UserType | null>(null);

  const isSuperAdmin = userRole === UserType.SUPER_ADMIN;
  const currentUserId = getUserId();

  const loadPoll = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const data = await specialPollServiceRef.current.getSpecialPoll(id);
      if (data == null) {
        setPoll(null);
        return;
      }
      setPoll(normalizePollResponses(data));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden der Umfrage:', error);
      showUserFriendlyError(error, toast, undefined, 'generic');
      setPoll(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserRole = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    try {
      const profile = await userServiceRef.current.getUserProfile(uid);
      setUserRole(profile.userType);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Laden der Benutzerrolle:', error);
    }
  }, [getUserId]);

  useEffect(() => {
    if (pollId) {
      void loadPoll(pollId);
    }
  }, [pollId, loadPoll]);

  useEffect(() => {
    void loadUserRole();
  }, [loadUserRole]);

  const handleAddResponse = async () => {
    if (!pollId || !responseText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await specialPollServiceRef.current.addResponse(pollId, responseText.trim());
      showSuccessMessage(toast, {
        title: 'Antwort wurde hinzugefügt',
        description: 'Die Antwort wurde erfolgreich hinzugefügt.',
      });
      setResponseText('');
      await loadPoll(pollId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Hinzufügen der Antwort:', error);
      showUserFriendlyError(error, toast, () => void handleAddResponse(), 'save-event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResponseModerate = async () => {
    if (!pollId || !responseToDelete || !poll || !isSuperAdmin) return;
    try {
      const updatedResponses = poll.responses.filter(r => r.id !== responseToDelete.id);
      await specialPollServiceRef.current.updateResponses(pollId, updatedResponses);
      showSuccessMessage(toast, {
        title: 'Antwort wurde gelöscht',
        description: 'Die Antwort wurde erfolgreich gelöscht.',
      });
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
      await loadPoll(pollId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Löschen der Antwort:', error);
      showUserFriendlyError(error, toast, () => void handleDeleteResponseModerate(), 'save-event');
    }
  };

  const handleRemoveOwnResponse = async () => {
    if (!pollId || removingOwnResponse) return;
    setRemovingOwnResponse(true);
    try {
      await specialPollServiceRef.current.removeResponse(pollId);
      showSuccessMessage(toast, {
        title: 'Antwort entfernt',
        description: 'Deine Antwort wurde entfernt.',
      });
      await loadPoll(pollId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Entfernen der eigenen Antwort:', error);
      showUserFriendlyError(error, toast, () => void handleRemoveOwnResponse(), 'save-event');
    } finally {
      setRemovingOwnResponse(false);
    }
  };

  const handleStatusChange = async (newStatus: SpecialPollStatus) => {
    if (!pollId || !poll || poll.status === newStatus || !isSuperAdmin || isStatusUpdating) return;
    setIsStatusUpdating(true);
    try {
      await specialPollServiceRef.current.updateSpecialPollStatus(pollId, { status: newStatus });
      showSuccessMessage(toast, {
        title: 'Status wurde aktualisiert',
        description: `Der Status wurde erfolgreich geändert.`,
      });
      await loadPoll(pollId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Ändern des Status:', error);
      showUserFriendlyError(error, toast, () => void handleStatusChange(newStatus), 'save-event');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleHighlightChange = async (next: boolean) => {
    if (!pollId || !poll || !isSuperAdmin || isHighlightUpdating) return;
    if (poll.isHighlighted === next) return;
    setIsHighlightUpdating(true);
    try {
      await specialPollServiceRef.current.updateSpecialPollHighlight(pollId, {
        isHighlighted: next,
      });
      showSuccessMessage(toast, {
        title: 'Hervorhebung aktualisiert',
        description: next ? 'Die Umfrage ist hervorgehoben.' : 'Hervorhebung wurde entfernt.',
      });
      await loadPoll(pollId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler bei der Hervorhebung:', error);
      showUserFriendlyError(error, toast, () => void handleHighlightChange(next), 'save-event');
    } finally {
      setIsHighlightUpdating(false);
    }
  };

  const handleUpvote = async (responseId: string) => {
    if (!pollId || upvotingResponseId) return;
    setUpvotingResponseId(responseId);
    try {
      await specialPollServiceRef.current.upvoteResponse(pollId, responseId);
      await loadPoll(pollId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Upvote:', error);
      showUserFriendlyError(error, toast, () => void handleUpvote(responseId), 'save-event');
    } finally {
      setUpvotingResponseId(null);
    }
  };

  const handleDeletePoll = async () => {
    if (!pollId || isDeletingPoll) return;
    setIsDeletingPoll(true);
    try {
      await specialPollServiceRef.current.removeSpecialPoll(pollId);
      showSuccessMessage(toast, {
        title: 'Umfrage gelöscht',
        description: 'Die Umfrage wurde entfernt.',
      });
      setPollDeleteOpen(false);
      navigate('/mittmach-mittwoch');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim Löschen der Umfrage:', error);
      showUserFriendlyError(error, toast, () => void handleDeletePoll(), 'save-event');
    } finally {
      setIsDeletingPoll(false);
    }
  };

  return {
    pollId,
    navigate,
    poll,
    isLoading,
    responseText,
    setResponseText,
    isSubmitting,
    deleteDialogOpen,
    setDeleteDialogOpen,
    responseToDelete,
    setResponseToDelete,
    isStatusUpdating,
    isHighlightUpdating,
    upvotingResponseId,
    removingOwnResponse,
    pollDeleteOpen,
    setPollDeleteOpen,
    isDeletingPoll,
    userRole,
    isSuperAdmin,
    currentUserId,
    handleAddResponse,
    handleDeleteResponseModerate,
    handleRemoveOwnResponse,
    handleStatusChange,
    handleHighlightChange,
    handleUpvote,
    handleDeletePoll,
  };
}
