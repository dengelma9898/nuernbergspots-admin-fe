import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusinessUserService, BusinessUser } from '@/services/businessUserService';
import { useBusinessService } from '@/services/businessService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
} from "@/components/ui/dialog";
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
          businessService.getBusinesses()
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
      
      toast.success(`${selectedBusiness.name} wurde erfolgreich zu ${businessUser.email} hinzugefügt.`);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Geschäfts:', error);
      toast.error("Beim Hinzufügen des Geschäfts ist ein Fehler aufgetreten.");
    } finally {
      setIsAddingBusiness(false);
      setIsConfirmDialogOpen(false);
      setSelectedBusiness(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted px-4 py-6 sm:px-8 overflow-x-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business-users')} className="rounded-full p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="sr-only">Zurück</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">Business-User bearbeiten</h1>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!businessUser) {
    return (
      <div className="min-h-screen bg-muted px-4 py-6 sm:px-8 overflow-x-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/business-users')} className="rounded-full p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="sr-only">Zurück</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">Business-User bearbeiten</h1>
        </div>
        <div className="bg-card rounded-lg p-6">
          <p>Business-User nicht gefunden</p>
        </div>
      </div>
    );
  }

  const assignedBusinesses = availableBusinesses.filter(business => 
    businessUser.businessIds.includes(business.id)
  );

  const unassignedBusinesses = availableBusinesses.filter(business => 
    !business.hasAccount
  );

  return (
    <div className="min-h-screen bg-muted px-4 py-6 sm:px-8 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/business-users')} className="rounded-full p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="sr-only">Zurück</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">Business-User bearbeiten</h1>
      </div>
      <div className="space-y-6">
        {/* Business-User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Business-User Informationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">E-Mail</p>
                <p>{businessUser.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
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
          </CardContent>
        </Card>

        {/* Zugewiesene Geschäfte */}
        <div>
          <div className="md:hidden space-y-2">
            <div className="font-semibold mb-2">Zugewiesene Geschäfte</div>
            {assignedBusinesses.length === 0 ? (
              <div className="text-muted-foreground text-sm">Keine zugewiesenen Geschäfte</div>
            ) : (
              assignedBusinesses.map((business) => (
                <Card key={business.id} className="p-3">
                  <div className="font-medium">{business.name}</div>
                  <div className="text-xs text-muted-foreground break-all">{business.id}</div>
                </Card>
              ))
            )}
          </div>
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Zugewiesene Geschäfte</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.name}</TableCell>
                      <TableCell>{business.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Verfügbare Geschäfte */}
        <div>
          <div className="md:hidden space-y-2">
            <div className="font-semibold mb-2">Verfügbare Geschäfte</div>
            {unassignedBusinesses.length === 0 ? (
              <div className="text-muted-foreground text-sm">Keine verfügbaren Geschäfte</div>
            ) : (
              unassignedBusinesses.map((business) => (
                <Card key={business.id} className="p-3 flex flex-col gap-1">
                  <div className="font-medium">{business.name}</div>
                  <div className="text-xs text-muted-foreground break-all">{business.id}</div>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddBusiness(business)}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Hinzufügen
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle>Verfügbare Geschäfte</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedBusinesses.map((business) => (
                    <TableRow key={business.id}>
                      <TableCell>{business.name}</TableCell>
                      <TableCell>{business.id}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddBusiness(business)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Hinzufügen
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bestätigungs-Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Geschäft zuweisen</DialogTitle>
            <DialogDescription>
              Möchten Sie das Geschäft "{selectedBusiness?.name}" (ID: {selectedBusiness?.id}) wirklich dem Business-User "{businessUser.email}" zuweisen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setSelectedBusiness(null);
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={confirmAddBusiness}
              disabled={isAddingBusiness}
            >
              {isAddingBusiness ? "Wird hinzugefügt..." : "Zuweisen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 