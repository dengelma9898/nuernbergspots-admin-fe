import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowRight,
  ArrowLeft,
  Users,
  UserPlus,
  TrendingUp,
  UserX,
  RefreshCcw,
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { User, UserType } from '@/models/users';
import { useUserService } from '@/services/userService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { showUserFriendlyError, showSuccessMessage } from '@/utils/errorUtils';
import { Background } from '@/components/Background';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedButton } from '@/components/AnimatedButton';
import { LoadingButton } from '@/components/LoadingButton';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { glassCard, glassCardHover, glassButton } from '@/lib/glassmorphism';
import { cn } from '@/lib/utils';

interface UserStatistics {
  totalUsers: number;
  newUsersThisMonth: number;
  growthFromLastMonth: number;
  blockedUsers: number;
  usersByType: Record<UserType, number>;
}

export function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const userService = useUserService();

  const fetchUsers = useCallback(
    async (showSuccessToast = false) => {
      try {
        setIsRefreshing(true);
        const allUsers = await userService.getAllUsers();
        // Sortiere nach createdAt absteigend (neueste zuerst)
        const sortedUsers = [...allUsers].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setUsers(sortedUsers);
        if (showSuccessToast) {
          showSuccessMessage(toast, {
            title: 'User erfolgreich aktualisiert',
            description: 'Die User-Liste wurde erfolgreich aktualisiert.',
          });
        }
      } catch (error) {
        console.error('Fehler beim Laden der User:', error);
        showUserFriendlyError(error, toast, () => fetchUsers(showSuccessToast), 'load-users');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [userService]
  );

  // Initiale Ladung der Daten
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchUsers(false);
    }
  }, [fetchUsers]);

  // Berechne Statistiken
  const statistics = useMemo((): UserStatistics => {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const newUsersThisMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdAt = new Date(user.createdAt);
      return createdAt >= startOfThisMonth;
    }).length;

    const newUsersLastMonth = users.filter(user => {
      if (!user.createdAt) return false;
      const createdAt = new Date(user.createdAt);
      return createdAt >= startOfLastMonth && createdAt < startOfThisMonth;
    }).length;

    const growthFromLastMonth =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : newUsersThisMonth > 0
          ? 100
          : 0;

    const blockedUsers = users.filter(user => user.isBlocked).length;

    return {
      totalUsers: users.length,
      newUsersThisMonth,
      growthFromLastMonth,
      blockedUsers,
    };
  }, [users]);

  const getUserTypeBadge = (userType: UserType) => {
    const typeConfig = {
      [UserType.USER]: {
        label: 'User',
        className:
          'bg-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400',
      },
      [UserType.ADMIN]: {
        label: 'Admin',
        className:
          'bg-purple-600/20 text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400',
      },
      [UserType.SUPER_ADMIN]: {
        label: 'Super Admin',
        className:
          'bg-red-600/20 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400',
      },
      [UserType.BUSINESS]: {
        label: 'Business',
        className:
          'bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400',
      },
      [UserType.PREMIUM_BUSINESS]: {
        label: 'Premium Business',
        className:
          'bg-yellow-600/20 text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400',
      },
    };

    const config = typeConfig[userType];
    return (
      <Badge className={cn('rounded-full px-3 py-1 text-xs font-medium border', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (user.isBlocked) {
      return (
        <Badge className="bg-red-600/20 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 rounded-full px-3 py-1 text-xs font-medium">
          <UserX className="mr-1 h-3 w-3" />
          Blockiert
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-600/20 text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 rounded-full px-3 py-1 text-xs font-medium">
        <Shield className="mr-1 h-3 w-3" />
        Aktiv
      </Badge>
    );
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    index,
  }: {
    icon: any;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    index: number;
  }) => (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{
        ...defaultTransition,
        delay: index * 0.05,
      }}
    >
      <Card className={cn(glassCardHover, 'p-4')}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-foreground" />
              <span className="text-sm font-semibold text-foreground">{title}</span>
            </div>
            {trend !== undefined && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trend >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
                {trend >= 0 ? '+' : ''}
                {trend.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{value}</div>
          {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
        </CardContent>
      </Card>
    </motion.div>
  );

  const StatCardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{
        ...defaultTransition,
        delay: index * 0.05,
      }}
    >
      <Card className={cn(glassCardHover, 'p-4')}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-8 w-16 mb-1 rounded" />
          <Skeleton className="h-3 w-32 rounded" />
        </CardContent>
      </Card>
    </motion.div>
  );

  const TableSkeleton = () => (
    <Card className={cn(glassCard, 'p-4 md:p-6')}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-24 rounded" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-32 rounded" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20 rounded" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-24 rounded" />
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-28 rounded" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }, (_, index) => (
            <TableRow key={`skeleton-row-${index}`}>
              <TableCell>
                <Skeleton className="h-4 w-full rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full rounded" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full rounded" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        <Background />
        {/* Main Content */}
        <motion.div
          className="container mx-auto p-4 md:p-8 max-w-7xl relative z-10"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="space-y-6">
            {/* Header */}
            <motion.div
              className={cn(glassCard, 'p-6 md:p-8')}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={defaultTransition}
            >
              <div className="flex flex-row items-start justify-between gap-4">
                <AnimatedButton
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/')}
                  className={cn(glassButton, 'rounded-full shrink-0')}
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Zurück zum Dashboard</span>
                </AnimatedButton>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                    User-Verwaltung
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm md:text-base">
                    Übersicht aller registrierten Benutzer und Statistiken
                  </p>
                </div>
                <LoadingButton
                  onClick={() => fetchUsers(true)}
                  disabled={isRefreshing}
                  size="icon"
                  className={cn(glassButton, 'shrink-0 rounded-full')}
                >
                  <RefreshCcw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="sr-only">Aktualisieren</span>
                </LoadingButton>
              </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {loading ? (
                Array.from({ length: 3 }, (_, index) => (
                  <StatCardSkeleton key={`stat-skeleton-${index}`} index={index} />
                ))
              ) : (
                <>
                  <StatCard
                    icon={Users}
                    title="Gesamt User"
                    value={statistics.totalUsers}
                    subtitle="Alle registrierten Benutzer"
                    index={0}
                  />
                  <StatCard
                    icon={UserPlus}
                    title="Neue User"
                    value={statistics.newUsersThisMonth}
                    subtitle={`Dieser Monat (${format(new Date(), 'MMMM', { locale: de })})`}
                    trend={statistics.growthFromLastMonth}
                    index={1}
                  />
                  <StatCard
                    icon={UserX}
                    title="Blockierte User"
                    value={statistics.blockedUsers}
                    subtitle={`${statistics.totalUsers > 0 ? ((statistics.blockedUsers / statistics.totalUsers) * 100).toFixed(1) : 0}% aller User`}
                    index={2}
                  />
                </>
              )}
            </motion.div>

            {/* User Table */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ ...defaultTransition, delay: 0.2 }}
            >
              {loading ? (
                <TableSkeleton />
              ) : users.length === 0 ? (
                <Card className={cn(glassCard, 'p-8 md:p-12 text-center')}>
                  <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                    Keine User gefunden
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Es gibt aktuell keine registrierten Benutzer.
                  </p>
                </Card>
              ) : (
                <Card className={cn(glassCard, 'p-4 md:p-6 overflow-x-auto')}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-foreground">E-Mail</TableHead>
                        <TableHead className="text-foreground">Name</TableHead>
                        <TableHead className="text-foreground">Typ</TableHead>
                        <TableHead className="text-foreground">Status</TableHead>
                        <TableHead className="text-foreground">Erstellt am</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow
                          key={user.id || `${user.email}-${index}` || `user-${index}`}
                          className="border-b border-secondary/50 hover:bg-white/5 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {user.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{user.name || '-'}</TableCell>
                          <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.createdAt ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(user.createdAt), 'dd.MM.yyyy HH:mm', {
                                  locale: de,
                                })}
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
