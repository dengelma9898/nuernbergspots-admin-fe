import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserService, User } from '@/services/userService';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Ban, CheckCircle2, ArrowLeft, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';

export function UserBlockManagement() {
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

    // Verwende customerId für die Blockierung
    const customerId = selectedUser.customerId;

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
      const isBlocking = !selectedUser.isBlocked;
      await userService.blockUser({
        customerId: String(customerId),
        isBlocked: isBlocking,
        blockReason: isBlocking ? blockReason : undefined,
      });

      showSuccessMessage(toast, {
        title: isBlocking ? 'User erfolgreich blockiert' : 'User erfolgreich entsperrt',
        description: `${selectedUser.email} wurde erfolgreich ${isBlocking ? 'blockiert' : 'entsperrt'}.`,
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
        isBlocking ? 'block-user' : 'unblock-user'
      );
    } finally {
      setIsBlocking(false);
    }
  };

  const UserSkeleton = () => (
    <Card className={cn(glassCard, 'p-4 md:p-6')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </div>
        <Skeleton className="h-6 w-24 rounded-xl" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>
    </Card>
  );

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        <div className="relative z-10 container mx-auto py-6">
          {/* Header */}
          <motion.div
            className={cn(glassCard, 'p-6 mb-8')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex items-center gap-2">
                  <AnimatedButton
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/')}
                    className={cn(glassButton, 'rounded-full p-2')}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </AnimatedButton>
                  <span className="sr-only">Zurück</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">
                    User Blockierung verwalten
                  </h1>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="User suchen (E-Mail, Name, ID)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={cn(
                    'pl-10 bg-background/50 backdrop-blur-xl border-border text-foreground placeholder:text-muted-foreground'
                  )}
                />
              </div>
            </div>
          </motion.div>

          {/* Mobile Card-Ansicht */}
          {isLoading ? (
            <motion.div
              className="block md:hidden space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div key={`skeleton-mobile-${i}`} variants={fadeInUp}>
                  <UserSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredUsers.length === 0 ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'p-8 text-center block md:hidden')}>
                <div className="text-foreground/80">
                  {searchQuery ? 'Keine User gefunden' : 'Keine User vorhanden'}
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="block md:hidden space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={`user-mobile-${index}-${user.id || user.email || 'unknown'}`}
                  variants={fadeInUp}
                >
                  <Card className={cn(glassCard, 'p-4 overflow-hidden')}>
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground break-all whitespace-normal">
                          {user.email}
                        </span>
                      </div>
                      {user.name && (
                        <span className="text-xs text-foreground/70 break-all whitespace-normal">
                          {user.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        {user.isBlocked ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 text-xs bg-red-600/20 text-red-400 border-red-600"
                          >
                            <Ban className="h-3 w-3" />
                            Blockiert
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 text-xs bg-green-600/20 text-green-400 border-green-600"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Aktiv
                          </Badge>
                        )}
                      </div>
                    </div>
                    {user.isBlocked && user.blockReason && (
                      <div className="mb-4 p-2 bg-muted/50 rounded text-xs text-foreground/80">
                        <strong>Grund:</strong> {user.blockReason}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <AnimatedButton
                        variant={user.isBlocked ? 'default' : 'destructive'}
                        size="sm"
                        onClick={() => handleBlockClick(user)}
                        className={cn(glassButton, 'min-w-[120px]')}
                      >
                        {user.isBlocked ? (
                          <>
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Entsperren
                          </>
                        ) : (
                          <>
                            <Ban className="mr-1 h-4 w-4" /> Blockieren
                          </>
                        )}
                      </AnimatedButton>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Desktop/Table Ansicht */}
          {isLoading ? (
            <motion.div
              className="hidden md:block"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <Card className={cn(glassCard, 'overflow-hidden')}>
                <div className="p-6 border-b border-border">
                  <Skeleton className="h-6 w-48 rounded" />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="text-foreground font-medium">E-Mail</TableHead>
                        <TableHead className="text-foreground font-medium">Name</TableHead>
                        <TableHead className="text-foreground font-medium">Status</TableHead>
                        <TableHead className="text-foreground font-medium">Block-Grund</TableHead>
                        <TableHead className="text-foreground font-medium">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...Array(5)].map((_, i) => (
                        <TableRow
                          key={`skeleton-desktop-${i}`}
                          className="border-border hover:bg-muted/50"
                        >
                          <TableCell>
                            <Skeleton className="h-4 w-48 rounded" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32 rounded" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24 rounded-xl" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-40 rounded" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-28 rounded-xl" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="hidden md:block"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              <Card className={cn(glassCard, 'overflow-hidden')}>
                <div className="p-6 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">
                    User Übersicht ({filteredUsers.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="text-foreground font-medium">E-Mail</TableHead>
                        <TableHead className="text-foreground font-medium">Name</TableHead>
                        <TableHead className="text-foreground font-medium">Status</TableHead>
                        <TableHead className="text-foreground font-medium">Block-Grund</TableHead>
                        <TableHead className="text-foreground font-medium">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user, index) => (
                        <TableRow
                          key={`user-desktop-${index}-${user.id || user.email || 'unknown'}`}
                          className="border-border hover:bg-muted/50 transition-colors duration-200"
                        >
                          <TableCell className="text-foreground font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell className="text-foreground/80">{user.name || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {user.isBlocked ? (
                                <Badge
                                  variant="destructive"
                                  className="flex items-center gap-1 bg-red-600/20 text-red-600 dark:text-red-400 border-red-600"
                                >
                                  <Ban className="h-3 w-3" />
                                  Blockiert
                                </Badge>
                              ) : (
                                <Badge
                                  variant="default"
                                  className="flex items-center gap-1 bg-green-600/20 text-green-600 dark:text-green-400 border-green-600"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Aktiv
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground/70 text-sm max-w-xs truncate">
                            {user.blockReason || '-'}
                          </TableCell>
                          <TableCell>
                            <AnimatedButton
                              variant={user.isBlocked ? 'default' : 'destructive'}
                              size="sm"
                              onClick={() => handleBlockClick(user)}
                              className={cn(glassButton)}
                            >
                              {user.isBlocked ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Entsperren
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Blockieren
                                </>
                              )}
                            </AnimatedButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Block Dialog */}
          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogContent className={cn(glassCard, 'border-border')}>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {selectedUser?.isBlocked ? 'User entsperren' : 'User blockieren'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {selectedUser?.isBlocked
                    ? `Möchten Sie ${selectedUser?.email} wirklich entsperren?`
                    : `Bitte geben Sie einen Grund für die Blockierung von ${selectedUser?.email} an.`}
                </DialogDescription>
              </DialogHeader>
              {/* Validierungsfehler */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive" className={cn(glassCard, 'border-destructive/50')}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Bitte korrigiere die folgenden Fehler</AlertTitle>
                  <AlertDescription className="mt-2">
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {!selectedUser?.isBlocked && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockReason" className="text-foreground">
                      Blockierungsgrund *
                    </Label>
                    <Textarea
                      id="blockReason"
                      placeholder="z.B. Verstoß gegen Nutzungsbedingungen"
                      value={blockReason}
                      onChange={e => setBlockReason(e.target.value)}
                      className={cn(
                        'bg-background/50 backdrop-blur-xl border-border text-foreground placeholder:text-muted-foreground'
                      )}
                      rows={4}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <AnimatedButton
                  variant="ghost"
                  onClick={() => {
                    setIsBlockDialogOpen(false);
                    setBlockReason('');
                    setValidationErrors([]);
                  }}
                  className={cn(glassButton)}
                >
                  Abbrechen
                </AnimatedButton>
                <LoadingButton
                  variant={selectedUser?.isBlocked ? 'default' : 'destructive'}
                  onClick={handleBlockConfirm}
                  loading={isBlocking}
                  disabled={!selectedUser?.isBlocked && !blockReason.trim()}
                  className={cn(glassButton)}
                >
                  {selectedUser?.isBlocked ? 'Entsperren' : 'Blockieren'}
                </LoadingButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </PageTransition>
  );
}
