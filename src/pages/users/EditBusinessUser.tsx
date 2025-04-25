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
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/business-users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold">Business-User bearbeiten</h1>
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
      <div className="container mx-auto p-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/business-users')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold">Business-User bearbeiten</h1>
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
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/business-users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <h1 className="text-3xl font-bold">Business-User bearbeiten</h1>
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
        <Card>
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

        {/* Verfügbare Geschäfte */}
        <Card>
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