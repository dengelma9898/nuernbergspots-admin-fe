import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessUserService, BusinessUser } from '@/services/businessUserService';
import { useBusinessService } from '@/services/businessService';
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
import { CheckCircle2, AlertCircle, Trash2, ArrowLeft, Plus } from 'lucide-react';
import { Business } from '@/models/business';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

export function EditBusinessUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [businessUser, setBusinessUser] = useState<BusinessUser | null>(null);
  const [availableBusinesses, setAvailableBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isAddingBusiness, setIsAddingBusiness] = useState(false);
  const businessUserService = useBusinessUserService();
  const businessService = useBusinessService();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) return;

        const [user, businesses] = await Promise.all([
          businessUserService.getBusinessUser(id),
          businessService.getBusinesses(),
        ]);

        setBusinessUser(user);
        setAvailableBusinesses(businesses);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, businessUserService, businessService]);

  const handleAddBusiness = async (business: Business) => {
    if (!businessUser) return;

    setSelectedBusiness(business);
    setIsConfirmDialogOpen(true);
  };

  const confirmAddBusiness = async () => {
    if (!selectedBusiness || !businessUser) return;

    try {
      setIsAddingBusiness(true);
      await businessUserService.addBusinessToUser(businessUser.id, selectedBusiness.id);

      // Aktualisiere die Daten
      const updatedUser = await businessUserService.getBusinessUser(businessUser.id);
      setBusinessUser(updatedUser);

      showSuccessMessage(toast, {
        title: 'Geschäft hinzugefügt',
        description: `"${selectedBusiness.name}" wurde erfolgreich zu ${businessUser.email} hinzugefügt.`,
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Geschäfts:', error);
      showUserFriendlyError(error, toast, () => handleAddBusiness(), 'save-business');
    } finally {
      setIsAddingBusiness(false);
      setIsConfirmDialogOpen(false);
      setSelectedBusiness(null);
    }
  };

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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/business-users')}
                  className={cn(glassButton, 'rounded-full p-2')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </AnimatedButton>
                <span className="sr-only">Zurück</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">
                Business-User bearbeiten
              </h1>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              <Card className={cn(glassCard)}>
                <Skeleton className="h-20 w-full rounded" />
              </Card>
              <Card className={cn(glassCard)}>
                <Skeleton className="h-20 w-full rounded" />
              </Card>
            </div>
          ) : !businessUser ? (
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <Card className={cn(glassCard, 'p-6')}>
                <p className="text-muted-foreground">Business-User nicht gefunden</p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-6 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Business-User Info */}
              <motion.div variants={fadeInUp}>
                <Card className={cn(glassCard, 'overflow-hidden')}>
                  <div className="p-6 border-b border-secondary">
                    <h2 className="text-lg font-semibold text-foreground">
                      Business-User Informationen
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">E-Mail</p>
                        <p className="text-foreground font-medium">{businessUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
                        <div className="flex items-center gap-2">
                          {businessUser.isDeleted ? (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Trash2 className="h-3 w-3" />
                              Gelöscht
                            </Badge>
                          ) : businessUser.needsReview ? (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Überprüfung erforderlich
                            </Badge>
                          ) : (
                            <Badge variant="default" className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Aktiv
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {(() => {
                const assignedBusinesses = availableBusinesses.filter(business =>
                  businessUser.businessIds.includes(business.id)
                );

                const unassignedBusinesses = availableBusinesses.filter(
                  business => !business.hasAccount
                );

                return (
                  <>
                    {/* Zugewiesene Geschäfte */}
                    <motion.div variants={fadeInUp}>
                      {/* Mobile Card Layout */}
                      <div className="md:hidden space-y-2">
                        <Card className={cn(glassCard, 'p-4')}>
                          <div className="text-lg font-semibold text-foreground mb-4">
                            Zugewiesene Geschäfte
                          </div>
                          {assignedBusinesses.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                              Keine zugewiesenen Geschäfte
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {assignedBusinesses.map(business => (
                                <Card key={business.id} className={cn(glassCard, 'p-3')}>
                                  <div className="font-medium text-foreground">{business.name}</div>
                                  <div className="text-xs text-muted-foreground break-all mt-1">
                                    {business.id}
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </Card>
                      </div>

                      {/* Desktop Table Layout */}
                      <Card
                        className={cn(glassCard, 'hidden md:block overflow-hidden')}
                        data-slot="card"
                      >
                        <div className="p-6 border-b border-secondary">
                          <h2 className="text-lg font-semibold text-foreground">
                            Zugewiesene Geschäfte
                          </h2>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-secondary hover:bg-muted/50">
                                <TableHead className="text-foreground font-medium">Name</TableHead>
                                <TableHead className="text-foreground font-medium">ID</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {assignedBusinesses.map(business => (
                                <TableRow
                                  key={business.id}
                                  className="border-secondary hover:bg-muted/50 transition-colors duration-200"
                                >
                                  <TableCell className="text-foreground font-medium">
                                    {business.name}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {business.id}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Verfügbare Geschäfte */}
                    <motion.div variants={fadeInUp}>
                      {/* Mobile Card Layout */}
                      <div className="md:hidden space-y-4">
                        <Card className={cn(glassCard, 'p-4')}>
                          <div className="text-lg font-semibold text-foreground mb-4">
                            Verfügbare Geschäfte
                          </div>
                          {unassignedBusinesses.length === 0 ? (
                            <div className="text-muted-foreground text-sm">
                              Keine verfügbaren Geschäfte
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {unassignedBusinesses.map(business => (
                                <Card key={business.id} className={cn(glassCard, 'p-3')}>
                                  <div className="font-medium text-foreground">{business.name}</div>
                                  <div className="text-xs text-muted-foreground break-all mt-1">
                                    {business.id}
                                  </div>
                                  <div className="flex justify-end mt-3">
                                    <AnimatedButton
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAddBusiness(business)}
                                      className={cn(glassButton)}
                                    >
                                      <Plus className="mr-1 h-4 w-4" /> Hinzufügen
                                    </AnimatedButton>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </Card>
                      </div>

                      {/* Desktop Table Layout */}
                      <Card className={cn(glassCard, 'hidden md:block overflow-hidden')}>
                        <div className="p-6 border-b border-secondary">
                          <h2 className="text-lg font-semibold text-foreground">
                            Verfügbare Geschäfte
                          </h2>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-secondary hover:bg-muted/50">
                                <TableHead className="text-foreground font-medium">Name</TableHead>
                                <TableHead className="text-foreground font-medium">ID</TableHead>
                                <TableHead className="text-foreground font-medium">
                                  Aktionen
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {unassignedBusinesses.map(business => (
                                <TableRow
                                  key={business.id}
                                  className="border-secondary hover:bg-muted/50 transition-colors duration-200"
                                >
                                  <TableCell className="text-foreground font-medium">
                                    {business.name}
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">
                                    {business.id}
                                  </TableCell>
                                  <TableCell>
                                    <AnimatedButton
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAddBusiness(business)}
                                      className={cn(glassButton)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Hinzufügen
                                    </AnimatedButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </Card>
                    </motion.div>
                  </>
                );
              })()}
            </motion.div>
          )}

          {/* Bestätigungs-Dialog */}
          {businessUser && (
            <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
              <DialogContent className={cn(glassCard)}>
                <DialogHeader>
                  <DialogTitle className="text-foreground text-lg font-semibold">
                    Geschäft zuweisen
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Möchten Sie das Geschäft "{selectedBusiness?.name}" (ID: {selectedBusiness?.id})
                    wirklich dem Business-User "{businessUser.email}" zuweisen?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <AnimatedButton
                    variant="outline"
                    onClick={() => {
                      setIsConfirmDialogOpen(false);
                      setSelectedBusiness(null);
                    }}
                    className={cn(glassButton)}
                  >
                    Abbrechen
                  </AnimatedButton>
                  <LoadingButton
                    onClick={confirmAddBusiness}
                    isLoading={isAddingBusiness}
                    loadingText="Wird hinzugefügt..."
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Zuweisen
                  </LoadingButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
