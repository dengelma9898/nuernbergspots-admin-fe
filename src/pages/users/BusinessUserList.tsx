import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessUserService, BusinessUser } from '@/services/businessUserService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Trash2, Pencil, ArrowLeft } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted px-4 py-6 sm:px-8 overflow-x-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="sr-only">Zurück</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">Business-User verwalten</h1>
        </div>
        <div className="space-y-4 block md:hidden">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="hidden md:block">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted px-4 py-6 sm:px-8 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="sr-only">Zurück</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">Business-User verwalten</h1>
      </div>
      {/* Mobile Card-Ansicht */}
      {businessUsers.length === 0 ? (
        <div className="block md:hidden text-center text-muted-foreground">Keine Business-User vorhanden</div>
      ) : (
        <div className="block md:hidden space-y-4">
          {businessUsers.map((user) => (
            <Card key={user.id} className="p-4 w-full max-w-full rounded-2xl shadow-lg border border-border bg-background">
              <div className="mb-2">
                <span className="text-sm font-medium break-all whitespace-normal">{user.email}</span>
              </div>
              <div className="flex items-center mb-4">
                {user.isDeleted ? (
                  <Badge variant="destructive" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                    <Trash2 className="h-3 w-3" />
                    Gelöscht
                  </Badge>
                ) : user.needsReview ? (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                    <AlertCircle className="h-3 w-3" />
                    Überprüfung erforderlich
                  </Badge>
                ) : (
                  <Badge variant="default" className="flex items-center gap-1 text-xs px-2 py-1 whitespace-nowrap">
                    <CheckCircle2 className="h-3 w-3" />
                    Aktiv
                  </Badge>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/business-users/${user.id}/edit`)}
                  className="min-w-[120px]"
                >
                  <Pencil className="mr-1 h-4 w-4" /> Bearbeiten
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Desktop/Table Ansicht */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>Business-User Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-Mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {businessUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/business-users/${user.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Bearbeiten
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 