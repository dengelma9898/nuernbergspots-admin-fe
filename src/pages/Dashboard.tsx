import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserService } from '../services/userService';
import { useBusinessService } from '../services/businessService';
import { useContactService } from '../services/contactService';
import { useEventService } from '../services/eventService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedCard } from '@/components/AnimatedCard';
import { AnimatedButton } from '@/components/AnimatedButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { staggerContainer, staggerItem, fadeInUp, fadeIn } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassCardHover, glassBadge, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';
import {
  User,
  Calendar,
  Store,
  LogOut,
  Tags,
  Key,
  ArrowRight,
  Tag,
  Users,
  BarChart,
  MessageSquare,
  Briefcase,
  MessageCircle,
  Handshake,
  Power,
  Shield,
  FileText,
  Package,
  DollarSign,
  Car,
} from 'lucide-react';

// Skeleton Loading Component for Dashboard Cards
const DashboardCardSkeleton = ({ icon: Icon, titleText }: { icon: any; titleText: string }) => (
  <Card className={cn(glassCardHover, 'p-4')}>
    <CardContent className="p-0">
      {/* Header with icon and title in one line */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-foreground" />
        <span className="text-sm sm:text-base font-semibold text-foreground">{titleText}</span>
      </div>

      {/* Main content with skeleton animation */}
      <div className="flex items-center justify-between gap-4">
        {/* Number and emoji skeleton */}
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl font-bold text-foreground">
            <div className="w-12 h-8 bg-muted rounded-lg animate-pulse"></div>
          </div>
          <div className="text-xl sm:text-2xl">
            <div className="w-8 h-8 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Action button skeleton */}
        <div className="shrink-0">
          <div className="w-20 sm:w-24 h-8 bg-muted rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Description text skeleton */}
      <div className="mt-3 space-y-1">
        <div className="w-full h-3 bg-muted rounded animate-pulse"></div>
        <div className="w-3/4 h-3 bg-muted rounded animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

const NavigationCard = ({
  icon: Icon,
  title,
  description,
  href,
  index = 0,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
  index?: number;
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{
        ...defaultTransition,
        delay: index * 0.05
      }}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: defaultTransition
      }}
    >
      <Card
        className={cn(glassCardHover, 'cursor-pointer group')}
        onClick={() => navigate(href)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                className={cn(glassBadge, 'p-3')}
                whileHover={{ scale: 1.1 }}
                transition={defaultTransition}
              >
                <Icon className="h-6 w-6 text-foreground" />
              </motion.div>
              <div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-foreground/95 transition-colors duration-300">
                  {title}
                </CardTitle>
                <CardDescription className="text-muted-foreground group-hover:text-muted-foreground/90 transition-colors duration-300">
                  {description}
                </CardDescription>
              </div>
            </div>
            <motion.div
              whileHover={{ x: 4, scale: 1.1 }}
              transition={defaultTransition}
            >
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            </motion.div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

export function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const [usersInReview, setUsersInReview] = useState<number>(0);
  const [openContactRequests, setOpenContactRequests] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [llmScrapingCosts, setLlmScrapingCosts] = useState<number>(0);

  // Loading states for each card
  const [pendingApprovalsLoading, setPendingApprovalsLoading] = useState<boolean>(true);
  const [usersInReviewLoading, setUsersInReviewLoading] = useState<boolean>(true);
  const [contactRequestsLoading, setContactRequestsLoading] = useState<boolean>(true);
  const [totalUsersLoading, setTotalUsersLoading] = useState<boolean>(true);
  const [llmScrapingCostsLoading, setLlmScrapingCostsLoading] = useState<boolean>(true);

  const userService = useUserService();
  const businessService = useBusinessService();
  const contactService = useContactService();
  const eventService = useEventService();
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

  const fetchTotalUsers = useCallback(async () => {
    try {
      setTotalUsersLoading(true);
      const allUsers = await userService.getAllUsers();
      setTotalUsers(allUsers.length);
    } catch (error) {
      console.error('Fehler beim Laden der User-Anzahl:', error);
    } finally {
      setTotalUsersLoading(false);
    }
  }, [userService]);

  const fetchLlmScrapingCosts = useCallback(async () => {
    try {
      setLlmScrapingCostsLoading(true);
      const costsData = await eventService.getLlmScrapingCosts();
      setLlmScrapingCosts(costsData.total);
    } catch (error) {
      console.error('Fehler beim Laden der LLM-Scraping-Kosten:', error);
    } finally {
      setLlmScrapingCostsLoading(false);
    }
  }, [eventService]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchPendingApprovals();
      fetchUsersInReview();
      fetchOpenContactRequests();
      fetchTotalUsers();
      fetchLlmScrapingCosts();
    }
  }, [
    fetchPendingApprovals,
    fetchUsersInReview,
    fetchOpenContactRequests,
    fetchTotalUsers,
    fetchLlmScrapingCosts,
  ]);

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        {/* Reduzierte Background-Komponente */}
        <Background />

        <div className="container mx-auto max-w-full p-8 sm:p-8 px-2 overflow-x-hidden relative z-10">
        <motion.div
          className="space-y-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Header Section */}
          <motion.div
            className={cn(glassCard, 'p-6')}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={defaultTransition}
          >
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <motion.div
                  className={cn(glassBadge, 'text-lg sm:text-xl font-medium px-4 py-2')}
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ ...defaultTransition, delay: 0.2 }}
                >
                  <span className="text-foreground">Hi Sarah 👋, schön dass du wieder da bist ✨</span>
                  {(pendingApprovals > 0 || usersInReview > 0 || openContactRequests > 0) && (
                    <span className="block mt-2 text-muted-foreground">
                      {pendingApprovals + usersInReview + openContactRequests > 10
                        ? 'Da wartet eine Menge Arbeit auf dich! 💪'
                        : 'Es gibt ein bisschen was zu tun für dich 😊'}
                    </span>
                  )}
                  {totalUsers > 0 && (
                    <span className="block mt-2 text-muted-foreground">
                      {totalUsers} registrierte Benutzer im System 👥
                    </span>
                  )}
                </motion.div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <ThemeToggle />
                <AnimatedButton
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  className={cn(glassButton, 'w-full sm:w-auto')}
                >
                  <User className="h-4 w-4" />
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  onClick={handleLogout}
                  className="bg-background border border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive w-full sm:w-auto rounded-lg transition-all duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </AnimatedButton>
              </div>
            </div>
          </motion.div>

          {/* Pending Reviews Cards - Direkt auf Background ohne Management-Kachel */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.3 }}
          >
              {/* Pending Business Approvals Card */}
              {pendingApprovalsLoading ? (
                <DashboardCardSkeleton icon={Store} titleText="Ausstehende Partner ✍️" />
              ) : (
                pendingApprovals > 0 && (
                  <AnimatedCard
                    index={0}
                    className={cn(glassCardHover, 'p-4')}
                  >
                    <CardContent className="p-0">
                      {/* Header with icon and title in one line */}
                      <div className="flex items-center gap-2 mb-3">
                        <Store className="h-5 w-5 text-foreground" />
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          Ausstehende Partner ✍️
                        </span>
                      </div>

                      {/* Main content with improved layout */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Number and emoji in compact layout */}
                        <div className="flex items-center gap-3">
                          <div className="text-2xl sm:text-3xl font-bold text-foreground">
                            {pendingApprovals}
                          </div>
                          <div className="text-xl sm:text-2xl">
                            {pendingApprovals > 10 ? '🔥' : '📝'}
                          </div>
                        </div>

                        {/* Action button - always visible */}
                        <AnimatedButton
                          onClick={() => navigate('/businesses?filter=pending')}
                          size="sm"
                          className={cn(glassButton, 'shrink-0')}
                        >
                          <span className="hidden sm:inline">Jetzt prüfen</span>
                          <span className="sm:hidden">Prüfen</span>
                          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </AnimatedButton>
                      </div>

                      {/* Description text - more compact */}
                      <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {pendingApprovals === 1
                          ? 'Neues Geschäft wartet auf Genehmigung'
                          : `${pendingApprovals} neue Geschäfte warten auf Genehmigung`}
                      </div>
                    </CardContent>
                  </AnimatedCard>
                )
              )}

              {/* Business Users in Review Card */}
              {usersInReviewLoading ? (
                <DashboardCardSkeleton icon={User} titleText="Geschäftsinhaber prüfen 🔍" />
              ) : (
                usersInReview > 0 && (
                  <AnimatedCard
                    index={1}
                    className={cn(glassCardHover, 'p-4')}
                  >
                    <CardContent className="p-0">
                      {/* Header with icon and title in one line */}
                      <div className="flex items-center gap-2 mb-3">
                        <User className="h-5 w-5 text-foreground" />
                        <span className="text-sm sm:text-base font-semibold text-foreground">
                          Geschäftsinhaber prüfen 🔍
                        </span>
                      </div>

                      {/* Main content with improved layout */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Number and emoji in compact layout */}
                        <div className="flex items-center gap-3">
                          <div className="text-2xl sm:text-3xl font-bold text-foreground">
                            {usersInReview}
                          </div>
                          <div className="text-xl sm:text-2xl">
                            {usersInReview > 10 ? '🔥' : '👤'}
                          </div>
                        </div>

                        {/* Action button - always visible */}
                        <AnimatedButton
                          onClick={() => navigate('/users/business/review')}
                          size="sm"
                          className={cn(glassButton, 'shrink-0')}
                        >
                          <span className="hidden sm:inline">Jetzt prüfen</span>
                          <span className="sm:hidden">Prüfen</span>
                          <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </AnimatedButton>
                      </div>

                      {/* Description text - more compact */}
                      <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {usersInReview === 1
                          ? 'Geschäftsinhaber wartet auf Verifizierung'
                          : `${usersInReview} Geschäftsinhaber warten auf Verifizierung`}
                      </div>
                    </CardContent>
                  </AnimatedCard>
                )
              )}

              {/* Open Contact Requests Card */}
              {contactRequestsLoading ? (
                <DashboardCardSkeleton icon={MessageSquare} titleText="Offene Kontaktanfragen 📧" />
              ) : (
                <AnimatedCard
                  index={2}
                  className={cn(glassCardHover, 'p-4')}
                >
                  <CardContent className="p-0">
                    {/* Header with icon and title in one line */}
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-foreground" />
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        Offene Kontaktanfragen 📧
                      </span>
                    </div>

                    {/* Main content with improved layout */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Number and emoji in compact layout */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                          {openContactRequests}
                        </div>
                        <div className="text-xl sm:text-2xl">
                          {openContactRequests > 10 ? '📬' : '✉️'}
                        </div>
                      </div>

                      {/* Action button - always visible */}
                      <AnimatedButton
                        onClick={() => navigate('/contacts?filter=pending')}
                        size="sm"
                        className={cn(glassButton, 'shrink-0')}
                      >
                        <span className="hidden sm:inline">Jetzt prüfen</span>
                        <span className="sm:hidden">Prüfen</span>
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </AnimatedButton>
                    </div>

                    {/* Description text - more compact */}
                    <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {openContactRequests === 1
                        ? 'Neue Kontaktanfrage wartet auf Bearbeitung'
                        : `${openContactRequests} neue Kontaktanfragen warten auf Bearbeitung`}
                    </div>
                  </CardContent>
                </AnimatedCard>
              )}

              {/* Total Users Card */}
              {totalUsersLoading ? (
                <DashboardCardSkeleton icon={Users} titleText="User-Verwaltung 👥" />
              ) : (
                <AnimatedCard
                  index={3}
                  className={cn(glassCardHover, 'p-4')}
                >
                  <CardContent className="p-0">
                    {/* Header with icon and title in one line */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-foreground" />
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        User-Verwaltung 👥
                      </span>
                    </div>

                    {/* Main content with improved layout */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Number and emoji in compact layout */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                          {totalUsers}
                        </div>
                        <div className="text-xl sm:text-2xl">
                          👥
                        </div>
                      </div>

                      {/* Action button - always visible */}
                      <AnimatedButton
                        onClick={() => navigate('/users')}
                        size="sm"
                        className={cn(glassButton, 'shrink-0')}
                      >
                        <span className="hidden sm:inline">Anzeigen</span>
                        <span className="sm:hidden">Anzeigen</span>
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </AnimatedButton>
                    </div>

                    {/* Description text - more compact */}
                    <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {totalUsers === 1
                        ? 'Registrierter Benutzer im System'
                        : `${totalUsers} registrierte Benutzer im System`}
                    </div>
                  </CardContent>
                </AnimatedCard>
              )}
          </motion.div>

          {/* Partner */}
          <motion.div
            className="mt-8 space-y-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Partner</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
                <NavigationCard
                  icon={Store}
                  title="Partner verwalten"
                  description="Partner hinzufügen, bearbeiten und löschen"
                  href="/businesses"
                  index={0}
                />
                <NavigationCard
                  icon={Users}
                  title="Business User verwalten"
                  description="Business-User und deren Berechtigungen verwalten"
                  href="/business-users"
                  index={1}
                />
                <NavigationCard
                  icon={User}
                  title="Geschäftsinhaber prüfen"
                  description="Geschäftsinhaber warten auf Verifizierung"
                  href="/users/business/review"
                  index={2}
                />
                <NavigationCard
                  icon={Tags}
                  title="Business Kategorien verwalten"
                  description="Geschäftskategorien und deren Zuordnungen verwalten"
                  href="/categories"
                  index={3}
                />
                <NavigationCard
                  icon={Key}
                  title="Keywords verwalten"
                  description="Suchbegriffe und Tags für bessere Auffindbarkeit"
                  href="/keywords"
                  index={4}
                />
                <NavigationCard
                  icon={Calendar}
                  title="Feature Flags verwalten"
                  description="Feature Flags ein- und ausschalten"
                  href="/feature-flags"
                  index={5}
                />
            </motion.div>
          </motion.div>

          {/* Events */}
          <motion.div
            className="mt-8 space-y-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Events</h3>
            
            {/* LLM Scraping Costs Card */}
            <motion.div
              className="mb-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {llmScrapingCostsLoading ? (
                <DashboardCardSkeleton icon={DollarSign} titleText="LLM Scraping Kosten 💰" />
              ) : (
                <AnimatedCard
                  index={0}
                  className={cn(glassCardHover, 'p-4 cursor-pointer')}
                  onClick={() => navigate('/events/scraper/stats')}
                >
                  <CardContent className="p-0">
                    {/* Header with icon and title in one line */}
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-foreground" />
                      <span className="text-sm sm:text-base font-semibold text-foreground">
                        LLM Scraping Kosten 💰
                      </span>
                    </div>

                    {/* Main content with improved layout */}
                    <div className="flex items-center justify-between gap-4">
                      {/* Number and emoji in compact layout */}
                      <div className="flex items-center gap-3">
                        <div className="text-2xl sm:text-3xl font-bold text-foreground">
                          {new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(llmScrapingCosts)}
                        </div>
                        <div className="text-xl sm:text-2xl">💰</div>
                      </div>

                      {/* Action button - always visible */}
                      <AnimatedButton
                        onClick={e => {
                          e.stopPropagation();
                          navigate('/events/scraper/stats');
                        }}
                        size="sm"
                        className={cn(glassButton, 'shrink-0')}
                      >
                        <span className="hidden sm:inline">Details</span>
                        <span className="sm:hidden">Details</span>
                        <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </AnimatedButton>
                    </div>

                    {/* Description text - more compact */}
                    <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Monatliche Kosten für LLM-basierte Event-Extraktion
                    </div>
                  </CardContent>
                </AnimatedCard>
              )}
            </motion.div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
                <NavigationCard
                  icon={Calendar}
                  title="Events verwalten"
                  description="Events und Veranstaltungen organisieren"
                  href="/events"
                  index={0}
                />
                <NavigationCard
                  icon={Tag}
                  title="Event Kategorien verwalten"
                  description="Event-Kategorien hinzufügen und bearbeiten"
                  href="/event-categories"
                  index={1}
                />
            </motion.div>
          </motion.div>

          {/* Kontaktanfragen */}
          <motion.div
            className="mt-8 space-y-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Kontaktanfragen</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
                <NavigationCard
                  icon={MessageSquare}
                  title="Partner"
                  description="Offene Kontaktanfragen von Partnern verwalten"
                  href="/contacts?filter=partner"
                  index={0}
                />
                <NavigationCard
                  icon={MessageSquare}
                  title="Nutzer"
                  description="Offene Kontaktanfragen von Nutzern verwalten"
                  href="/contacts?filter=user"
                  index={1}
                />
            </motion.div>
          </motion.div>

          {/* Community */}
          <motion.div
            className="mt-8 space-y-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.7 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Community</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
                <NavigationCard
                  icon={MessageSquare}
                  title="News"
                  description="Verwalte aktuelle News und Ankündigungen."
                  href="/news-management"
                  index={0}
                />
                <NavigationCard
                  icon={Handshake}
                  title="Mittmach Mittwoch"
                  description="Aktionen, Ideen und Engagement für die Community am Mittwoch."
                  href="/mittmach-mittwoch"
                  index={1}
                />
                <NavigationCard
                  icon={Calendar}
                  title="Adventskalender"
                  description="Adventskalender-Einträge erstellen und verwalten"
                  href="/advent-calendar"
                  index={2}
                />
                <NavigationCard
                  icon={Calendar}
                  title="Ostereiersuche"
                  description="Ostereier anlegen, Gewinner auslosen und Statistiken einsehen"
                  href="/easter-egg-hunt"
                  index={3}
                />
                <NavigationCard
                  icon={MessageCircle}
                  title="Chatrooms"
                  description="Chatrooms erstellen, bearbeiten und moderieren"
                  href="/chatrooms"
                  index={4}
                />
                <NavigationCard
                  icon={Briefcase}
                  title="Jobs"
                  description="Stellenangebote erstellen und verwalten"
                  href="/job-offers"
                  index={5}
                />
                <NavigationCard
                  icon={Tags}
                  title="Job-Kategorien"
                  description="Verwalten Sie die Kategorien für Stellenanzeigen"
                  href="/job-categories"
                  index={6}
                />
                <NavigationCard
                  icon={Car}
                  title="Taxistandorte"
                  description="Taxistandorte anlegen, bearbeiten und Klick-Statistiken einsehen"
                  href="/taxi-stands"
                  index={7}
                />
            </motion.div>
          </motion.div>

          {/* Analytics und Sonstiges */}
          <motion.div
            className="mt-8 space-y-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.85 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Analytics und Sonstiges</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <NavigationCard
                icon={BarChart}
                title="Analytics Dashboard"
                description="Detaillierte Einblicke in die Performance deiner Partner"
                href="/analytics"
                index={0}
              />
              <NavigationCard
                icon={Users}
                title="User-Verwaltung"
                description="Übersicht aller registrierten Benutzer und Statistiken"
                href="/users"
                index={1}
              />
              <NavigationCard
                icon={Users}
                title="Account-Management"
                description="Verwaltung und Bereinigung von anonymen Benutzeraccounts"
                href="/account-management"
                index={2}
              />
              <NavigationCard
                icon={Shield}
                title="User Blockierung"
                description="User blockieren oder entsperren bei Verstößen gegen AGBs"
                href="/users/block-management"
                index={3}
              />
              <NavigationCard
                icon={Power}
                title="Downtime-Verwaltung"
                description="Wartungsmodus aktivieren oder deaktivieren"
                href="/downtime-management"
                index={4}
              />
              <NavigationCard
                icon={Package}
                title="App-Version-Verwaltung"
                description="Mindestversion der App setzen und verwalten"
                href="/app-version-management"
                index={5}
              />
            </motion.div>
          </motion.div>

          {/* Legal */}
          <motion.div
            className="mt-8 space-y-4"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...defaultTransition, delay: 0.75 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-foreground">Legal</h3>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <NavigationCard
                icon={FileText}
                title="Impressum"
                description="Impressums-Informationen verwalten und bearbeiten"
                href="/legal/impressum/edit"
                index={0}
              />
              <NavigationCard
                icon={FileText}
                title="Datenschutzerklärung"
                description="Datenschutzerklärung verwalten und bearbeiten"
                href="/legal/datenschutz/edit"
                index={1}
              />
              <NavigationCard
                icon={FileText}
                title="AGBs"
                description="Allgemeine Geschäftsbedingungen verwalten und bearbeiten"
                href="/legal/agb/edit"
                index={2}
              />
            </motion.div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
