import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

import { useUserBlockManagement } from '@/hooks/useUserBlockManagement';
import {
  UserBlockManagementCard,
  UserBlockStatusBadge,
} from '@/components/users/UserBlockManagementCards';
import {
  UserBlockManagementCardSkeleton,
  UserBlockManagementTableHeaderSkeleton,
  UserBlockManagementTableSkeletonRows,
} from '@/components/users/UserBlockManagementSkeletons';

export type UserBlockManagementContentProps = ReturnType<typeof useUserBlockManagement>;

export function UserBlockManagementContent({
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
}: UserBlockManagementContentProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        <motion.div
          className={listSectionPreset}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <LoadingButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className={cn(buttonPreset, 'rounded-full p-2')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </LoadingButton>
                <span className="sr-only">Zurück</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">
                  User Blockierung verwalten
                </h1>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="User suchen (E-Mail, Name, ID)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(
                  'pl-10 bg-background border border-secondary text-foreground placeholder:text-muted-foreground'
                )}
              />
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <motion.div
            className="block md:hidden space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div key={`skeleton-mobile-${i}`} variants={fadeInUp}>
                <UserBlockManagementCardSkeleton />
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
            <Card className={cn(cardPreset, 'p-8 text-center block md:hidden')}>
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
                <UserBlockManagementCard user={user} onBlockClick={handleBlockClick} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {isLoading ? (
          <motion.div
            className="hidden md:block"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.2 }}
          >
            <Card className={cn(cardPreset, 'overflow-hidden')}>
              <div className="p-6 border-b border-border">
                <UserBlockManagementTableHeaderSkeleton />
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
                    <UserBlockManagementTableSkeletonRows />
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
            <Card className={cn(cardPreset, 'overflow-hidden')}>
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
                        <TableCell className="text-foreground font-medium">{user.email}</TableCell>
                        <TableCell className="text-foreground/80">{user.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserBlockStatusBadge user={user} />
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground/70 text-sm max-w-xs truncate">
                          {user.blockReason || '-'}
                        </TableCell>
                        <TableCell>
                          <LoadingButton
                            variant={user.isBlocked ? 'default' : 'destructive'}
                            size="sm"
                            onClick={() => handleBlockClick(user)}
                            className={cn(buttonPreset)}
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
                          </LoadingButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>
        )}

        <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
          <DialogContent className={cn(cardPreset, 'border-border')}>
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
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className={cn(cardPreset, 'border-destructive/50')}>
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
                      'bg-background border border-secondary text-foreground placeholder:text-muted-foreground'
                    )}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <LoadingButton
                variant="ghost"
                onClick={handleDialogClose}
                className={cn(buttonPreset)}
              >
                Abbrechen
              </LoadingButton>
              <LoadingButton
                variant={selectedUser?.isBlocked ? 'default' : 'destructive'}
                onClick={handleBlockConfirm}
                loading={isBlocking}
                disabled={!selectedUser?.isBlocked && !blockReason.trim()}
                className={cn(buttonPreset)}
              >
                {selectedUser?.isBlocked ? 'Entsperren' : 'Blockieren'}
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
