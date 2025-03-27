import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Building2, 
  CheckCircle2, 
  XCircle,
  ArrowLeft,
  Tag,
  Store
} from 'lucide-react';
import { toast } from 'sonner';
import { BusinessUser } from '@/models/users';
import { useUserService } from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export const BusinessUserReview: React.FC = () => {
  const [users, setUsers] = useState<BusinessUser[]>([]);
  const [loading, setLoading] = useState(true);
  const userService = useUserService();
  const navigate = useNavigate();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await userService.getBusinessUsersInReview();
      setUsers(fetchedUsers.filter(user => user.needsReview));
    } catch (error) {
      toast.error("Fehler beim Laden der Benutzer", {
        description: "Die Benutzer konnten nicht geladen werden. Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await userService.updateBusinessUser(userId, { needsReview: false });
      toast.success("Benutzer verifiziert", {
        description: "Der Benutzer wurde erfolgreich verifiziert.",
      });
      loadUsers();
    } catch (error) {
      toast.error("Fehler bei der Verifizierung", {
        description: "Der Benutzer konnte nicht verifiziert werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await userService.updateBusinessUser(userId, { needsReview: false });
      toast.success("Benutzer abgelehnt", {
        description: "Der Benutzer wurde erfolgreich abgelehnt.",
      });
      loadUsers();
    } catch (error) {
      toast.error("Fehler bei der Ablehnung", {
        description: "Der Benutzer konnte nicht abgelehnt werden. Bitte versuchen Sie es später erneut.",
      });
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd. MMMM yyyy', { locale: de });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Lade Benutzer...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Geschäftsinhaber prüfen</h1>
      </div>

      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          {users.length} Benutzer zur Überprüfung gefunden
        </div>

        <div className="grid grid-cols-1 gap-4">
          {users.map(user => (
            <Card key={user.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">Business User</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      ID: {user.id}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Überprüfung erforderlich
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                      {user.businessIds && user.businessIds.length > 0 && (
                        <div className="flex items-center text-sm">
                          <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          {user.businessIds.length} {user.businessIds.length === 1 ? 'Geschäft' : 'Geschäfte'} zugewiesen
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm justify-end">
                        <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                        {user.isDeleted ? 'Gelöscht' : 'Aktiv'}
                      </div>
                      <div className="flex items-center text-sm justify-end text-muted-foreground">
                        Registriert am {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  {user.businessNames && user.businessNames.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2">Beanspruchte Geschäfte:</div>
                      <div className="space-y-2">
                        {user.businessNames.map(name => (
                          <div key={name} className="flex items-center text-sm bg-muted/50 p-2 rounded">
                            <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleReject(user.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Ablehnen
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleApprove(user.id)}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verifizieren
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Benutzer zur Überprüfung gefunden.
          </div>
        )}
      </div>
    </div>
  );
}; 