import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserService } from '../services/userService';
import { useBusinessService } from '../services/businessService';
import { useContactService } from '../services/contactService';
import { BusinessAnalytics } from '../models/business';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  User,
  Calendar,
  Store,
  LogOut,
  Tags,
  Key,
  ArrowRight,
  Tag,
  TrendingUp,
  TrendingDown,
  Users,
  Scan,
  BarChart,
  Euro,
  MessageSquare,
  Briefcase,
  MessageCircle,
  Handshake
} from 'lucide-react';


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

const AnalyticsCard = ({ 
  icon: Icon,
  title,
  value,
  trend,
  description,
  trendDescription
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  trendDescription?: string;
}) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 text-sm">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {trendDescription && (
          <p className="text-xs text-muted-foreground">{trendDescription}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [usersInReview, setUsersInReview] = useState<number>(0);
  const [openContactRequests, setOpenContactRequests] = useState<number>(0);
  const userService = useUserService();
  const businessService = useBusinessService();
  const contactService = useContactService();
  const isInitialMount = useRef(true);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Fehler beim Logout:', error);
    }
  };

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

  const fetchOpenContactRequests = useCallback(async () => {
    try {
      const openContactRequests = await contactService.getOpenContactRequestsCount();
      setOpenContactRequests(openContactRequests);
    } catch (error) {
      console.error('Fehler beim Laden der offenen Kontaktanfragen:', error);
    }
  }, [contactService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchPendingApprovals();
      fetchUsersInReview();
      fetchOpenContactRequests();
    }
  }, [fetchPendingApprovals, fetchUsersInReview, fetchOpenContactRequests]);

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile')}
                className="hover:bg-primary/10"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
          <div className="text-lg text-muted-foreground">
            Hi Sarah 👋, schön dass du wieder da bist ✨
            {(pendingApprovals > 0 || usersInReview > 0 || openContactRequests > 0) && (
              <span className="block mt-1">
                {pendingApprovals + usersInReview + openContactRequests > 10 
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                    onClick={() => navigate('/users/business/review')}
                    className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                  >
                    Jetzt prüfen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Open Contact Requests Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-primary">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Offene Kontaktanfragen 📧
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-bold text-primary">
                    {openContactRequests} {openContactRequests > 10 ? '📬' : '✉️'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {openContactRequests === 1 
                      ? 'Neue Kontaktanfrage wartet auf Bearbeitung'
                      : 'Neue Kontaktanfragen warten auf Bearbeitung'
                    }
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/contacts?filter=pending')}
                  className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                >
                  Jetzt prüfen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Partner */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Partner</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavigationCard icon={Store} title="Partner verwalten" description="Partner hinzufügen, bearbeiten und löschen" href="/businesses" />
              <NavigationCard icon={Users} title="Business User verwalten" description="Business-User und deren Berechtigungen verwalten" href="/business-users" />
              <NavigationCard icon={User} title="Geschäftsinhaber prüfen" description="Geschäftsinhaber warten auf Verifizierung" href="/users/business/review" />
              <NavigationCard icon={Tags} title="Business Kategorien verwalten" description="Geschäftskategorien und deren Zuordnungen verwalten" href="/categories" />
              <NavigationCard icon={Key} title="Keywords verwalten" description="Suchbegriffe und Tags für bessere Auffindbarkeit" href="/keywords" />
            </div>
          </div>

          {/* Events */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavigationCard icon={Calendar} title="Events verwalten" description="Events und Veranstaltungen organisieren" href="/events" />
              <NavigationCard icon={Tag} title="Event Kategorien verwalten" description="Event-Kategorien hinzufügen und bearbeiten" href="/event-categories" />
            </div>
          </div>

          {/* Kontaktanfragen */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Kontaktanfragen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavigationCard icon={MessageSquare} title="Partner" description="Offene Kontaktanfragen von Partnern verwalten" href="/contacts?filter=partner" />
              <NavigationCard icon={MessageSquare} title="Nutzer" description="Offene Kontaktanfragen von Nutzern verwalten" href="/contacts?filter=user" />
            </div>
          </div>

          {/* Community */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavigationCard icon={MessageSquare} title="News" description="Verwalte aktuelle News und Ankündigungen." href="/news-management" />
              <NavigationCard icon={Handshake} title="Mittmach Mittwoch" description="Aktionen, Ideen und Engagement für die Community am Mittwoch." href="/mittmach-mittwoch" />
              <NavigationCard icon={MessageCircle} title="Chatrooms" description="Chatrooms erstellen, bearbeiten und moderieren" href="/chatrooms" />
              <NavigationCard icon={Briefcase} title="Jobs" description="Stellenangebote erstellen und verwalten" href="/job-offers" />
              <NavigationCard icon={Tags} title="Job-Kategorien" description="Verwalten Sie die Kategorien für Stellenanzeigen" href="/job-categories" />
            </div>
          </div>

          {/* Analytics und Sonstiges */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Analytics und Sonstiges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NavigationCard icon={BarChart} title="Analytics Dashboard" description="Detaillierte Einblicke in die Performance deiner Partner" href="/analytics" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 