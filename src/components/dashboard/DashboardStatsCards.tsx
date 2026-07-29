import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Store, User, MessageSquare, Users, ArrowRight } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { motion } from '@/components/motion';
import { AnimatedCard } from '@/components/AnimatedCard';
import { LoadingButton } from '@/components/LoadingButton';
import { staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPresetHover, buttonPreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { DashboardCardSkeleton } from '@/components/dashboard/DashboardCardSkeleton';

interface StatCardConfig {
  loading: boolean;
  count: number;
  icon: LucideIcon;
  title: string;
  hideWhenZero?: boolean;
  emoji: (count: number) => string;
  description: (count: number) => string;
  href: string;
  index: number;
}

interface DashboardStatsCardsProps {
  pendingApprovals: number;
  usersInReview: number;
  openContactRequests: number;
  totalUsers: number;
  pendingApprovalsLoading: boolean;
  usersInReviewLoading: boolean;
  contactRequestsLoading: boolean;
  totalUsersLoading: boolean;
}

function DashboardStatCard({
  loading,
  count,
  icon,
  title,
  hideWhenZero,
  emoji,
  description,
  href,
  index,
}: StatCardConfig) {
  const navigate = useNavigate();

  if (loading) {
    return <DashboardCardSkeleton icon={icon} titleText={title} />;
  }

  if (hideWhenZero && count === 0) {
    return null;
  }

  return (
    <AnimatedCard index={index} className={cn(cardPresetHover, 'p-4')}>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 mb-3">
          {(() => {
            const Icon = icon;
            return <Icon className="h-5 w-5 text-foreground" />;
          })()}
          <span className="text-sm sm:text-base font-semibold text-foreground">{title}</span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{count}</div>
            <div className="text-xl sm:text-2xl">{emoji(count)}</div>
          </div>

          <LoadingButton
            onClick={() => navigate(href)}
            size="sm"
            className={cn(buttonPreset, 'shrink-0')}
          >
            <span className="hidden sm:inline">
              {href === '/users' ? 'Anzeigen' : 'Jetzt prüfen'}
            </span>
            <span className="sm:hidden">{href === '/users' ? 'Anzeigen' : 'Prüfen'}</span>
            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </LoadingButton>
        </div>

        <div className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description(count)}
        </div>
      </CardContent>
    </AnimatedCard>
  );
}

export function DashboardStatsCards({
  pendingApprovals,
  usersInReview,
  openContactRequests,
  totalUsers,
  pendingApprovalsLoading,
  usersInReviewLoading,
  contactRequestsLoading,
  totalUsersLoading,
}: DashboardStatsCardsProps) {
  const cards: StatCardConfig[] = [
    {
      loading: pendingApprovalsLoading,
      count: pendingApprovals,
      icon: Store,
      title: 'Ausstehende Partner ✍️',
      hideWhenZero: true,
      emoji: count => (count > 10 ? '🔥' : '📝'),
      description: count =>
        count === 1
          ? 'Neues Geschäft wartet auf Genehmigung'
          : `${count} neue Geschäfte warten auf Genehmigung`,
      href: '/businesses?filter=pending',
      index: 0,
    },
    {
      loading: usersInReviewLoading,
      count: usersInReview,
      icon: User,
      title: 'Geschäftsinhaber prüfen 🔍',
      hideWhenZero: true,
      emoji: count => (count > 10 ? '🔥' : '👤'),
      description: count =>
        count === 1
          ? 'Geschäftsinhaber wartet auf Verifizierung'
          : `${count} Geschäftsinhaber warten auf Verifizierung`,
      href: '/users/business/review',
      index: 1,
    },
    {
      loading: contactRequestsLoading,
      count: openContactRequests,
      icon: MessageSquare,
      title: 'Offene Kontaktanfragen 📧',
      emoji: count => (count > 10 ? '📬' : '✉️'),
      description: count =>
        count === 1
          ? 'Neue Kontaktanfrage wartet auf Bearbeitung'
          : `${count} neue Kontaktanfragen warten auf Bearbeitung`,
      href: '/contacts?filter=pending',
      index: 2,
    },
    {
      loading: totalUsersLoading,
      count: totalUsers,
      icon: Users,
      title: 'User-Verwaltung 👥',
      emoji: () => '👥',
      description: count =>
        count === 1
          ? 'Registrierter Benutzer im System'
          : `${count} registrierte Benutzer im System`,
      href: '/users',
      index: 3,
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      {cards.map(card => (
        <DashboardStatCard key={card.title} {...card} />
      ))}
    </motion.div>
  );
}
