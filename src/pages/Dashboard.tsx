import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile } from '../models/users';
import { useUserService } from '../services/userService';
import { useBusinessService } from '../services/businessService';
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
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [usersInReview, setUsersInReview] = useState<number>(0);
  const userService = useUserService();
  const businessService = useBusinessService();
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

  const fetchPendingApprovals = useCallback(async () => {
    try {
      const count = await businessService.getPendingApprovalsCount();
      setPendingApprovals(count);
    } catch (error) {
      console.error('Fehler beim Laden der ausstehenden Genehmigungen:', error);
    }
  }, [businessService]);

  const fetchUsersInReview = useCallback(async () => {
    try {
      const count = await userService.getBusinessUsersInReviewCount();
      setUsersInReview(count);
    } catch (error) {
      console.error('Fehler beim Laden der zu überprüfenden Benutzer:', error);
    }
  }, [userService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCurrentUser();
      fetchPendingApprovals();
      fetchUsersInReview();
    }
  }, [fetchCurrentUser, fetchPendingApprovals, fetchUsersInReview]);

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
        <div className="space-y-2">
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
          <div className="text-lg text-muted-foreground">
            Hi Sarah 👋, schön dass du wieder da bist ✨
            {(pendingApprovals > 0 || usersInReview > 0) && (
              <span className="block mt-1">
                {pendingApprovals + usersInReview > 10 
                  ? "Da wartet eine Menge Arbeit auf dich! 💪"
                  : "Es gibt ein bisschen was zu tun für dich 😊"
                }
              </span>
            )}
          </div>
        </div>

        {/* Management Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Management</h2>
          
          {/* Pending Reviews Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Pending Business Approvals Card */}
            {pendingApprovals > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center text-primary">
                    <Store className="mr-2 h-5 w-5" />
                    Ausstehende Partner ✍️
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-primary">
                      {pendingApprovals} {pendingApprovals > 10 ? '🔥' : '📝'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pendingApprovals === 1 
                        ? 'Neues Geschäft wartet auf Ihre Genehmigung'
                        : 'Neue Geschäfte warten auf Ihre Genehmigung'
                      }
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/businesses?filter=pending')}
                    className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                  >
                    Jetzt prüfen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Business Users in Review Card */}
            {usersInReview > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center text-primary">
                    <User className="mr-2 h-5 w-5" />
                    Geschäftsinhaber prüfen 🔍
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-primary">
                      {usersInReview} {usersInReview > 10 ? '🔥' : '👤'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {usersInReview === 1 
                        ? 'Geschäftsinhaber wartet auf Verifizierung'
                        : 'Geschäftsinhaber warten auf Verifizierung'
                      }
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/users/business?filter=review')}
                    className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                  >
                    Jetzt prüfen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Management Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NavigationCard
              icon={Store}
              title="Partner verwalten"
              description="Partner hinzufügen, bearbeiten und löschen"
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