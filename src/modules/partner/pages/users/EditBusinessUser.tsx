import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessUserService, BusinessUser } from '@/services/businessUserService';
import { useBusinessService } from '@/services/businessService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from '@/components/ui/button';
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

      toast.success(
        `${selectedBusiness.name} wurde erfolgreich zu ${businessUser.email} hinzugefügt.`
      );
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Geschäfts:', error);
      toast.error('Beim Hinzufügen des Geschäfts ist ein Fehler aufgetreten.');
    } finally {
      setIsAddingBusiness(false);
      setIsConfirmDialogOpen(false);
      setSelectedBusiness(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

        {/* Animated Blur Circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        <div className="relative z-10 container mx-auto p-4 sm:p-8">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/business-users')}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Business-User bearbeiten
              </h1>
            </div>
          </div>

          {/* Loading Skeletons */}
          <div className="space-y-6">
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6">
              <div className="space-y-4">
                <div className="h-4 bg-white/20 rounded animate-pulse w-1/4"></div>
                <div className="h-8 bg-white/15 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-white/10 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
            <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6">
              <div className="space-y-4">
                <div className="h-6 bg-white/20 rounded animate-pulse w-1/3"></div>
                <div className="h-16 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!businessUser) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Rainbow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

        {/* Animated Blur Circles */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        <div className="relative z-10 container mx-auto p-4 sm:p-8">
          {/* Glass Header */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/business-users')}
                className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl w-fit"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Business-User bearbeiten
              </h1>
            </div>
          </div>

          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-6">
            <p className="text-white/80">Business-User nicht gefunden</p>
          </div>
        </div>
      </div>
    );
  }

  const assignedBusinesses = availableBusinesses.filter(business =>
    businessUser.businessIds.includes(business.id)
  );

  const unassignedBusinesses = availableBusinesses.filter(business => !business.hasAccount);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Rainbow Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>

      {/* Animated Blur Circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>

      <div className="relative z-10 container mx-auto p-4 sm:p-8">
        {/* Glass Header */}
        <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/business-users')}
              className="backdrop-blur-2xl bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Business-User bearbeiten
            </h1>
          </div>
        </div>

        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Business-User Info */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Business-User Informationen</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-white/70 mb-1">E-Mail</p>
                  <p className="text-white font-medium">{businessUser.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/70 mb-2">Status</p>
                  <div className="flex items-center gap-2">
                    {businessUser.isDeleted ? (
                      <div className="backdrop-blur-2xl bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl px-3 py-1 text-xs font-medium flex items-center gap-1">
                        <Trash2 className="h-3 w-3" />
                        Gelöscht
                      </div>
                    ) : businessUser.needsReview ? (
                      <div className="backdrop-blur-2xl bg-orange-500/20 border border-orange-400/30 text-orange-200 rounded-xl px-3 py-1 text-xs font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Überprüfung erforderlich
                      </div>
                    ) : (
                      <div className="backdrop-blur-2xl bg-green-500/20 border border-green-400/30 text-green-200 rounded-xl px-3 py-1 text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Aktiv
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Zugewiesene Geschäfte */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Zugewiesene Geschäfte</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/90 font-medium">Name</TableHead>
                    <TableHead className="text-white/90 font-medium">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedBusinesses.map(business => (
                    <TableRow
                      key={business.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <TableCell className="text-white font-medium">{business.name}</TableCell>
                      <TableCell className="text-white/80">{business.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Verfügbare Geschäfte */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Verfügbare Geschäfte</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-white/5">
                    <TableHead className="text-white/90 font-medium">Name</TableHead>
                    <TableHead className="text-white/90 font-medium">ID</TableHead>
                    <TableHead className="text-white/90 font-medium">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedBusinesses.map(business => (
                    <TableRow
                      key={business.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
                    >
                      <TableCell className="text-white font-medium">{business.name}</TableCell>
                      <TableCell className="text-white/80">{business.id}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddBusiness(business)}
                          className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Hinzufügen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Bestätigungs-Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="backdrop-blur-3xl bg-white/10 border border-white/20 text-white rounded-3xl shadow-2xl ring-1 ring-white/30">
            <DialogHeader>
              <DialogTitle className="text-white text-lg font-semibold">
                Geschäft zuweisen
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Möchten Sie das Geschäft "{selectedBusiness?.name}" (ID: {selectedBusiness?.id})
                wirklich dem Business-User "{businessUser.email}" zuweisen?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsConfirmDialogOpen(false);
                  setSelectedBusiness(null);
                }}
                className="backdrop-blur-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 rounded-xl"
              >
                Abbrechen
              </Button>
              <Button
                onClick={confirmAddBusiness}
                disabled={isAddingBusiness}
                className="backdrop-blur-2xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 border border-green-400/30 text-white hover:from-green-400/90 hover:to-emerald-400/90 hover:scale-105 transition-all duration-300 rounded-xl shadow-lg"
              >
                {isAddingBusiness ? 'Wird hinzugefügt...' : 'Zuweisen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
