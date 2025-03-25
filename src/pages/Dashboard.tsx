import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/users';
import { useUserService } from '../services/userService';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User,
  Calendar,
  MapPin,
  Store,
  Heart,
  History,
  Settings,
  LogOut,
  Tags,
  Key,
  ArrowRight
} from 'lucide-react';
import { toast } from "sonner";

const NavigationCard = ({ 
  icon: Icon, 
  title, 
  description, 
  href 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  href: string 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/50 transition-colors group"
      onClick={() => navigate(href)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </CardHeader>
    </Card>
  );
};

export function Dashboard() {
  const { logout, getUserId } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userService = useUserService();
  const isInitialMount = useRef(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    const userId = getUserId();
    if (!userId || isLoading) return;

    try {
      setIsLoading(true);
      const userData = await userService.getUserProfile(userId);
      setCurrentUser(userData);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
      toast.error('Die Benutzerdaten konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, [getUserId, userService, isLoading]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  const StatCard = ({ icon: Icon, label, value, helpText }: { icon: any, label: string, value: string | number, helpText?: string }) => (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <Icon className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </div>

        {/* Management Navigation */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NavigationCard
              icon={Store}
              title="Geschäfte verwalten"
              description="Geschäfte hinzufügen, bearbeiten und löschen"
              href="/businesses"
            />
            <NavigationCard
              icon={Tags}
              title="Kategorien verwalten"
              description="Geschäftskategorien und deren Zuordnungen verwalten"
              href="/categories"
            />
            <NavigationCard
              icon={Calendar}
              title="Events verwalten"
              description="Events und Veranstaltungen organisieren"
              href="/events"
            />
            <NavigationCard
              icon={Key}
              title="Keywords verwalten"
              description="Suchbegriffe und Tags für bessere Auffindbarkeit"
              href="/keywords"
            />
          </div>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser?.profilePictureUrl} />
                <AvatarFallback>
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{currentUser?.name || 'Benutzer'}</CardTitle>
                <Badge variant="secondary">{currentUser?.userType}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={User}
                label="E-Mail"
                value={currentUser?.email || '-'}
                helpText="Hauptkontakt"
              />
              <StatCard
                icon={Store}
                label="Management ID"
                value={currentUser?.managementId || '-'}
                helpText="Business Identifikation"
              />
              <StatCard
                icon={MapPin}
                label="Stadt"
                value={currentUser?.currentCityId || '-'}
                helpText="Aktueller Standort"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Store}
            label="Besuchte Geschäfte"
            value={currentUser?.businessHistory?.length || 0}
            helpText="Gesamtbesuche"
          />
          <StatCard
            icon={Heart}
            label="Favorisierte Events"
            value={currentUser?.favoriteEventIds?.length || 0}
            helpText="Interessante Events"
          />
          <StatCard
            icon={Store}
            label="Favorisierte Businesses"
            value={currentUser?.favoriteBusinessIds?.length || 0}
            helpText="Lieblingsgeschäfte"
          />
          <StatCard
            icon={Calendar}
            label="Mitglied seit"
            value={currentUser?.memberSince ? new Date(currentUser.memberSince).toLocaleDateString() : '-'}
            helpText="Registrierungsdatum"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Letzte Aktivitäten</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentUser?.businessHistory?.slice(0, 5).map((visit, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">{visit.businessName}</p>
                      <p className="text-sm text-muted-foreground">Benefit: {visit.benefit}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(visit.visitedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!currentUser?.businessHistory || currentUser.businessHistory.length === 0) && (
                <p className="text-center text-muted-foreground">Keine Aktivitäten vorhanden</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preferences Section */}
        {(currentUser?.preferences?.length || currentUser?.language) && (
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <CardTitle>Präferenzen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentUser.language && (
                  <div>
                    <p className="font-medium mb-2">Sprache</p>
                    <Badge variant="secondary">{currentUser.language}</Badge>
                  </div>
                )}
                {currentUser.preferences?.length && currentUser.preferences.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Interessen</p>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.preferences.map((pref, index) => (
                        <Badge key={index} variant="outline">{pref}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 