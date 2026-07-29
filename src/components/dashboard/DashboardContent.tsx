import { motion } from '@/components/motion';
import { fadeInUp, fadeIn, staggerContainer } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPreset, badgePreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { DashboardNavigationCard } from '@/components/dashboard/DashboardNavigationCard';
import { dashboardNavigationSections } from '@/utils/dashboardNavigationConfig';

interface DashboardHeaderProps {
  pendingApprovals: number;
  usersInReview: number;
  openContactRequests: number;
  totalUsers: number;
}

export function DashboardHeader({
  pendingApprovals,
  usersInReview,
  openContactRequests,
  totalUsers,
}: DashboardHeaderProps) {
  const pendingTotal = pendingApprovals + usersInReview + openContactRequests;

  return (
    <motion.div
      className={cn(cardPreset, 'p-4')}
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={defaultTransition}
    >
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <motion.div
          className={cn(badgePreset, 'text-lg sm:text-xl font-medium px-4 py-2')}
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <span className="text-foreground">Hi Sarah 👋, schön dass du wieder da bist ✨</span>
          {pendingTotal > 0 && (
            <span className="block mt-2 text-muted-foreground">
              {pendingTotal > 10
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
    </motion.div>
  );
}

export function DashboardNavigationSections() {
  return (
    <>
      {dashboardNavigationSections.map(section => (
        <motion.div
          key={section.title}
          className="mt-6 space-y-4"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={defaultTransition}
        >
          <h3 className="text-xl font-semibold mb-4 text-foreground">{section.title}</h3>
          <motion.div
            className={
              section.gridClassName ?? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4'
            }
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {section.items.map((item, index) => (
              <DashboardNavigationCard key={item.href} {...item} index={index} />
            ))}
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}
