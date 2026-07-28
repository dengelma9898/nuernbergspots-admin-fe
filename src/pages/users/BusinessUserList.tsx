import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessUserService, BusinessUser } from '@/services/businessUserService';
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
import { CheckCircle2, AlertCircle, Trash2, Pencil, ArrowLeft } from 'lucide-react';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from '@/components/motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, buttonPreset, listSectionPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';

export function BusinessUserList() {
  const [businessUsers, setBusinessUsers] = useState<BusinessUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const businessUserService = useBusinessUserService();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBusinessUsers = async () => {
      try {
        const users = await businessUserService.getBusinessUsers();
        setBusinessUsers(users);
      } catch (error) {
        console.error('Fehler beim Laden der Business-User:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessUsers();
  }, [businessUserService]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-6">
        {/* Header */}
        <motion.div
          className={listSectionPreset}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">
              Business-User verwalten
            </h1>
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
              <motion.div key={i} variants={fadeInUp}>
                <Card className={cn(cardPreset, 'p-4')}>
                  <div className="mb-3">
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                  <div className="flex items-center mb-4">
                    <Skeleton className="h-6 w-32 rounded-xl" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-32 rounded-xl" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : businessUsers.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <Card className={cn(cardPreset, 'p-8 text-center block md:hidden')}>
              <div className="text-muted-foreground">Keine Business-User vorhanden</div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="block md:hidden space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {businessUsers.map((user, index) => (
              <motion.div key={user.id} variants={fadeInUp}>
                <Card className={cn(cardPreset, 'p-4 overflow-hidden')}>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-foreground break-all whitespace-normal">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    {user.isDeleted ? (
                      <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                        <Trash2 className="h-3 w-3" />
                        Gelöscht
                      </Badge>
                    ) : user.needsReview ? (
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <AlertCircle className="h-3 w-3" />
                        Überprüfung erforderlich
                      </Badge>
                    ) : (
                      <Badge variant="default" className="flex items-center gap-1 text-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Aktiv
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <LoadingButton
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/business-users/${user.id}/edit`)}
                      className={cn(buttonPreset, 'min-w-[120px]')}
                    >
                      <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                    </LoadingButton>
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
            <Card className={cn(cardPreset, 'overflow-hidden')}>
              <div className="p-6 border-b border-secondary">
                <Skeleton className="h-6 w-48 rounded" />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-secondary hover:bg-muted/50">
                      <TableHead className="text-foreground font-medium">E-Mail</TableHead>
                      <TableHead className="text-foreground font-medium">Status</TableHead>
                      <TableHead className="text-foreground font-medium">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i} className="border-secondary hover:bg-muted/50">
                        <TableCell>
                          <Skeleton className="h-4 w-48 rounded" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32 rounded-xl" />
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
            <Card className={cn(cardPreset, 'overflow-hidden')}>
              <div className="p-6 border-b border-secondary">
                <h2 className="text-lg font-semibold text-foreground">Business-User Übersicht</h2>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-secondary hover:bg-muted/50">
                      <TableHead className="text-foreground font-medium">E-Mail</TableHead>
                      <TableHead className="text-foreground font-medium">Status</TableHead>
                      <TableHead className="text-foreground font-medium">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessUsers.map((user, index) => (
                      <TableRow
                        key={user.id}
                        className="border-secondary hover:bg-muted/50 transition-colors duration-200"
                      >
                        <TableCell className="text-foreground font-medium">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.isDeleted ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Trash2 className="h-3 w-3" />
                                Gelöscht
                              </Badge>
                            ) : user.needsReview ? (
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
                        </TableCell>
                        <TableCell>
                          <LoadingButton
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/business-users/${user.id}/edit`)}
                            className={cn(buttonPreset)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Bearbeiten
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
      </div>
    </div>
  );
}
