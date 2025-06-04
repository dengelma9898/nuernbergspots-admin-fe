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
      await userService.updateBusinessUserReviewStatus(userId, false);
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
      await userService.updateBusinessUserReviewStatus(userId, false);
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
    <div className="min-h-screen bg-muted px-4 py-6 sm:px-8 overflow-x-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-full p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="sr-only">Zurück zum Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight break-words">Geschäftsinhaber prüfen</h1>
      </div>

      <div className="space-y-6">
        <div className="text-sm text-muted-foreground">
          {users.length} Benutzer zur Überprüfung gefunden
        </div>

        <div className="grid grid-cols-1 gap-6">
          {users.map(user => (
            <Card key={user.id} className="w-full max-w-full rounded-2xl shadow-lg border border-border bg-background p-4">
              <CardHeader className="pb-2 border-b border-muted/40 mb-2">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">Business User</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground break-all truncate max-w-xs sm:max-w-none">
                      ID: {user.id}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2 whitespace-nowrap text-xs px-2 py-1">
                    Überprüfung erforderlich
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center text-sm break-all truncate max-w-full">
                        <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                      {user.businessIds && user.businessIds.length > 0 && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Building2 className="mr-2 h-4 w-4" />
                          {user.businessIds.length} {user.businessIds.length === 1 ? 'Geschäft' : 'Geschäfte'} zugewiesen
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 text-right">
                      <div className="flex items-center text-sm justify-end">
                        <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className={user.isDeleted ? 'text-destructive' : 'text-success'}>{user.isDeleted ? 'Gelöscht' : 'Aktiv'}</span>
                      </div>
                      <div className="flex items-center text-xs justify-end text-muted-foreground">
                        Registriert am {formatDate(user.createdAt)}
                      </div>
                    </div>
                  </div>

                  {user.businessNames && user.businessNames.length > 0 && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium mb-2">Beanspruchte Geschäfte:</div>
                      <div className="space-y-2">
                        {user.businessNames.map(name => (
                          <div key={name} className="flex items-center text-sm bg-muted/50 p-2 rounded break-all truncate max-w-full">
                            <Store className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 flex flex-col sm:flex-row justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleReject(user.id)}
                  className="text-destructive hover:text-destructive w-full sm:w-auto"
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Ablehnen
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleApprove(user.id)}
                  className="w-full sm:w-auto"
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