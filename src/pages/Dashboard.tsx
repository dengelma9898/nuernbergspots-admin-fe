import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserService } from '../services/userService';
import { useBusinessService } from '../services/businessService';
import { useContactService } from '../services/contactService';
import { BusinessAnalytics } from '../models/business';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Handshake,
  Power,
} from 'lucide-react';

// Skeleton Loading Component for Dashboard Cards
const DashboardCardSkeleton = ({ icon: Icon, titleText }: { icon: any; titleText: string }) => (
  <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30">
    <CardContent className="p-0">
      {/* Header with icon and title in one line */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-white drop-shadow-lg" />
        <span className="text-sm sm:text-base font-semibold text-white">{titleText}</span>
      </div>

      {/* Main content with skeleton animation */}
      <div className="flex items-center justify-between gap-4">
        {/* Number and emoji skeleton */}
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            <div className="w-12 h-8 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
          <div className="text-xl sm:text-2xl">
            <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Action button skeleton */}
        <div className="shrink-0">
          <div className="w-20 sm:w-24 h-8 bg-white/20 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Description text skeleton */}
      <div className="mt-3 space-y-1">
        <div className="w-full h-3 bg-white/15 rounded animate-pulse"></div>
        <div className="w-3/4 h-3 bg-white/15 rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

const NavigationCard = ({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
}) => {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all duration-500 ease-out group backdrop-blur-3xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl hover:bg-white/20 hover:border-white/30 hover:scale-105 hover:-translate-y-2 rounded-2xl ring-1 ring-white/30"
      onClick={() => navigate(href)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/30 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:bg-white/40">
              <Icon className="h-6 w-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white group-hover:text-white/95 transition-colors duration-300 drop-shadow-sm">
                {title}
              </CardTitle>
              <CardDescription className="text-white/80 group-hover:text-white/90 transition-colors duration-300">
                {description}
              </CardDescription>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-white/70 transition-all duration-300 group-hover:translate-x-2 group-hover:text-white group-hover:scale-110 drop-shadow-lg" />
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
  trendDescription,
}: {
  icon: any;
  title: string;
  value: string | number;
  trend?: number;
  description?: string;
  trendDescription?: string;
}) => (
  <Card className="backdrop-blur-3xl bg-white/10 border-white/20 shadow-2xl hover:shadow-3xl hover:bg-white/20 transition-all duration-500 rounded-2xl ring-1 ring-white/30">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-xl border border-white/30 shadow-xl">
            <Icon className="h-5 w-5 text-white drop-shadow-lg" />
          </div>
          <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center backdrop-blur-xl rounded-lg px-3 py-1 border ${trend >= 0 ? 'text-emerald-200 bg-emerald-500/20 border-emerald-300/30' : 'text-red-200 bg-red-500/20 border-red-300/30'}`}
          >
            {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span className="ml-1 text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white drop-shadow-lg">{value}</div>
        {description && <p className="text-sm text-white/80">{description}</p>}
        {trendDescription && <p className="text-xs text-white/70">{trendDescription}</p>}
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

  // Loading states for each card
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState<boolean>(true);
  const [usersInReviewLoading, setUsersInReviewLoading] = useState<boolean>(true);
  const [contactRequestsLoading, setContactRequestsLoading] = useState<boolean>(true);

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
      setPendingApprovalsLoading(true);
      const count = await businessService.getPendingApprovalsCount();
      setPendingApprovals(count);
    } catch (error) {
      console.error('Fehler beim Laden der ausstehenden Genehmigungen:', error);
    } finally {
      setPendingApprovalsLoading(false);
    }
  }, [businessService]);

  const fetchUsersInReview = useCallback(async () => {
    try {
      setUsersInReviewLoading(true);
      const count = await userService.getBusinessUsersInReviewCount();
      setUsersInReview(count);
    } catch (error) {
      console.error('Fehler beim Laden der zu überprüfenden Benutzer:', error);
    } finally {
      setUsersInReviewLoading(false);
    }
  }, [userService]);

  const fetchOpenContactRequests = useCallback(async () => {
    try {
      setContactRequestsLoading(true);
      const openContactRequests = await contactService.getOpenContactRequestsCount();
      setOpenContactRequests(openContactRequests);
    } catch (error) {
      console.error('Fehler beim Laden der offenen Kontaktanfragen:', error);
    } finally {
      setContactRequestsLoading(false);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated rainbow gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-red-500 to-yellow-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-green-500 to-blue-500 opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500 via-purple-500 to-pink-500 opacity-60"></div>
      </div>

      {/* Dynamic animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gradient-to-r from-green-400/25 to-teal-500/25 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-400/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>

      <div className="container mx-auto max-w-full p-8 sm:p-8 px-2 overflow-x-hidden relative z-10">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-4 backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20">
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent drop-shadow-lg">
                  Admin Dashboard
                </h1>
                <div className="text-lg sm:text-xl text-white/90 font-medium backdrop-blur-sm bg-white/5 rounded-2xl px-4 py-2 border border-white/10">
                  Hi Sarah 👋, schön dass du wieder da bist ✨
                  {(pendingApprovals > 0 || usersInReview > 0 || openContactRequests > 0) && (
                    <span className="block mt-2 text-white/80">
                      {pendingApprovals + usersInReview + openContactRequests > 10
                        ? 'Da wartet eine Menge Arbeit auf dich! 💪'
                        : 'Es gibt ein bisschen was zu tun für dich 😊'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className="backdrop-blur-2xl bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto rounded-xl text-white/90 hover:text-white"
                >
                  <User className="h-4 w-4 drop-shadow-sm" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="backdrop-blur-2xl bg-red-500/10 border-red-300/20 hover:bg-red-500/20 hover:border-red-300/30 hover:text-red-100 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto rounded-xl text-red-200"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </div>
            </div>
          </div>

          {/* Management Section */}
          <div className="backdrop-blur-3xl bg-white/5 rounded-3xl p-6 border border-white/10 shadow-2xl ring-1 ring-white/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
              Management
            </h2>

            {/* Pending Reviews Section */}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Pending Business Approvals Card */}
              {pendingApprovalsLoading ? (
                <DashboardCardSkeleton icon={Store} titleText="Ausstehende Partner ✍️" />
              ) : (
                pendingApprovals > 0 && (
                  <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30">
                    <CardContent className="p-0">
                      {/* Header with icon and title in one line */}
                      <div className="flex items-center gap-2 mb-3">
                        <Store className="h-5 w-5 text-white drop-shadow-lg" />
                        <span className="text-sm sm:text-base font-semibold text-white">
                          Ausstehende Partner ✍️
                        </span>
                      </div>

                      {/* Main content with improved layout */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Number and emoji in compact layout */}
                        <div className="flex items-center gap-3">
                          <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                            {pendingApprovals}
                          </div>
                          <div className="text-xl sm:text-2xl">
                            {pendingApprovals > 10 ? '🔥' : '📝'}
                          </div>
                        </div>

                        {/* Action button - always visible */}
                        <Button
                          onClick={() => navigate('/businesses?filter=pending')}
                          size="sm"
                          className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl shrink-0"
                        >
                          <span className="hidden sm:inline">Jetzt prüfen</span>
                          <span className="sm:hidden">Prüfen</span>
                          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      {/* Description text - more compact */}
                      <div className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed">
                        {pendingApprovals === 1
                          ? 'Neues Geschäft wartet auf Genehmigung'
                          : `${pendingApprovals} neue Geschäfte warten auf Genehmigung`}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {/* Business Users in Review Card */}
              {usersInReviewLoading ? (
                <DashboardCardSkeleton icon={User} titleText="Geschäftsinhaber prüfen 🔍" />
              ) : (
                usersInReview > 0 && (
                  <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30">
                    <CardContent className="p-0">
                      {/* Header with icon and title in one line */}
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-5 w-5 text-white drop-shadow-lg" />
                        <span className="text-sm sm:text-base font-semibold text-white">
                          Geschäftsinhaber prüfen 🔍
                        </span>
                      </div>

                      {/* Main content with improved layout */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Number and emoji in compact layout */}
                        <div className="flex items-center gap-3">
                          <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                            {usersInReview}
                          </div>
                          <div className="text-xl sm:text-2xl">
                            {usersInReview > 10 ? '🔥' : '👤'}
                          </div>
                        </div>

                        {/* Action button - always visible */}
                        <Button
                          onClick={() => navigate('/users/business/review')}
                          size="sm"
                          className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl shrink-0"
                        >
                          <span className="hidden sm:inline">Jetzt prüfen</span>
                          <span className="sm:hidden">Prüfen</span>
                          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>

                      {/* Description text - more compact */}
                      <div className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed">
                        {usersInReview === 1
                          ? 'Geschäftsinhaber wartet auf Verifizierung'
                          : `${usersInReview} Geschäftsinhaber warten auf Verifizierung`}
                      </div>
                    </CardContent>
                  </Card>
                )
              )}

              {/* Open Contact Requests Card */}
              {contactRequestsLoading ? (
                <DashboardCardSkeleton icon={MessageSquare} titleText="Offene Kontaktanfragen 📧" />
              ) : (
                <Card className="backdrop-blur-3xl bg-gradient-to-br from-white/15 to-white/5 border-white/20 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 rounded-2xl p-4 ring-1 ring-white/30">
                  <CardContent className="p-0">
                    {/* Header with icon and title in one line */}
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-white drop-shadow-lg" />
                      <span className="text-sm sm:text-base font-semibold text-white">
                        Offene Kontaktanfragen 📧
                      </span>
                    </div>

                    {/* Main content with improved layout */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Number and emoji in compact layout */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                          {openContactRequests}
                        </div>
                        <div className="text-xl sm:text-2xl">
                          {openContactRequests > 10 ? '📬' : '✉️'}
                        </div>
                      </div>

                      {/* Action button - always visible */}
                      <Button
                        onClick={() => navigate('/contacts?filter=pending')}
                        size="sm"
                        className="backdrop-blur-2xl bg-white/20 text-white hover:bg-white/30 border-white/30 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl shrink-0"
                      >
                        <span className="hidden sm:inline">Jetzt prüfen</span>
                        <span className="sm:hidden">Prüfen</span>
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Description text - more compact */}
                    <div className="mt-3 text-xs sm:text-sm text-white/80 leading-relaxed">
                      {openContactRequests === 1
                        ? 'Neue Kontaktanfrage wartet auf Bearbeitung'
                        : `${openContactRequests} neue Kontaktanfragen warten auf Bearbeitung`}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Partner */}
            <div className="mt-8 space-y-4">
              <div className="backdrop-blur-2xl bg-white/8 rounded-2xl p-4 border border-white/15 ring-1 ring-white/25">
                <h3 className="text-xl font-semibold mb-4 text-white">Partner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <NavigationCard
                    icon={Store}
                    title="Partner verwalten"
                    description="Partner hinzufügen, bearbeiten und löschen"
                    href="/businesses"
                  />
                  <NavigationCard
                    icon={Users}
                    title="Business User verwalten"
                    description="Business-User und deren Berechtigungen verwalten"
                    href="/business-users"
                  />
                  <NavigationCard
                    icon={User}
                    title="Geschäftsinhaber prüfen"
                    description="Geschäftsinhaber warten auf Verifizierung"
                    href="/users/business/review"
                  />
                  <NavigationCard
                    icon={Tags}
                    title="Business Kategorien verwalten"
                    description="Geschäftskategorien und deren Zuordnungen verwalten"
                    href="/categories"
                  />
                  <NavigationCard
                    icon={Key}
                    title="Keywords verwalten"
                    description="Suchbegriffe und Tags für bessere Auffindbarkeit"
                    href="/keywords"
                  />
                </div>
              </div>
            </div>

            {/* Events */}
            <div className="mt-8 space-y-4">
              <div className="backdrop-blur-2xl bg-white/8 rounded-2xl p-4 border border-white/15 ring-1 ring-white/25">
                <h3 className="text-xl font-semibold mb-4 text-white">Events</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <NavigationCard
                    icon={Calendar}
                    title="Events verwalten"
                    description="Events und Veranstaltungen organisieren"
                    href="/events"
                  />
                  <NavigationCard
                    icon={Tag}
                    title="Event Kategorien verwalten"
                    description="Event-Kategorien hinzufügen und bearbeiten"
                    href="/event-categories"
                  />
                </div>
              </div>
            </div>

            {/* Kontaktanfragen */}
            <div className="mt-8 space-y-4">
              <div className="backdrop-blur-2xl bg-white/8 rounded-2xl p-4 border border-white/15 ring-1 ring-white/25">
                <h3 className="text-xl font-semibold mb-4 text-white">Kontaktanfragen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <NavigationCard
                    icon={MessageSquare}
                    title="Partner"
                    description="Offene Kontaktanfragen von Partnern verwalten"
                    href="/contacts?filter=partner"
                  />
                  <NavigationCard
                    icon={MessageSquare}
                    title="Nutzer"
                    description="Offene Kontaktanfragen von Nutzern verwalten"
                    href="/contacts?filter=user"
                  />
                </div>
              </div>
            </div>

            {/* Community */}
            <div className="mt-8 space-y-4">
              <div className="backdrop-blur-2xl bg-white/8 rounded-2xl p-4 border border-white/15 ring-1 ring-white/25">
                <h3 className="text-xl font-semibold mb-4 text-white">Community</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <NavigationCard
                    icon={MessageSquare}
                    title="News"
                    description="Verwalte aktuelle News und Ankündigungen."
                    href="/news-management"
                  />
                  <NavigationCard
                    icon={Handshake}
                    title="Mittmach Mittwoch"
                    description="Aktionen, Ideen und Engagement für die Community am Mittwoch."
                    href="/mittmach-mittwoch"
                  />
                  <NavigationCard
                    icon={Calendar}
                    title="Adventskalender"
                    description="Adventskalender-Einträge erstellen und verwalten"
                    href="/advent-calendar"
                  />
                  <NavigationCard
                    icon={MessageCircle}
                    title="Chatrooms"
                    description="Chatrooms erstellen, bearbeiten und moderieren"
                    href="/chatrooms"
                  />
                  <NavigationCard
                    icon={Briefcase}
                    title="Jobs"
                    description="Stellenangebote erstellen und verwalten"
                    href="/job-offers"
                  />
                  <NavigationCard
                    icon={Tags}
                    title="Job-Kategorien"
                    description="Verwalten Sie die Kategorien für Stellenanzeigen"
                    href="/job-categories"
                  />
                </div>
              </div>
            </div>

            {/* Analytics und Sonstiges */}
            <div className="mt-8 space-y-4">
              <div className="backdrop-blur-2xl bg-white/8 rounded-2xl p-4 border border-white/15 ring-1 ring-white/25">
                <h3 className="text-xl font-semibold mb-4 text-white">Analytics und Sonstiges</h3>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                  <NavigationCard
                    icon={BarChart}
                    title="Analytics Dashboard"
                    description="Detaillierte Einblicke in die Performance deiner Partner"
                    href="/analytics"
                  />
                  <NavigationCard
                    icon={Users}
                    title="Account-Management"
                    description="Verwaltung und Bereinigung von anonymen Benutzeraccounts"
                    href="/account-management"
                  />
                  <NavigationCard
                    icon={Power}
                    title="Downtime-Verwaltung"
                    description="Wartungsmodus aktivieren oder deaktivieren"
                    href="/downtime-management"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
