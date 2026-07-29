import { motion } from '@/components/motion';
import { staggerContainer } from '@/lib/animations';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  DashboardHeader,
  DashboardNavigationSections,
} from '@/components/dashboard/DashboardContent';
import { DashboardStatsCards } from '@/components/dashboard/DashboardStatsCards';

export function DashboardPageContent() {
  const stats = useDashboardStats();

  return (
    <div className="overflow-x-hidden p-4 sm:p-6">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <DashboardHeader
          pendingApprovals={stats.pendingApprovals}
          usersInReview={stats.usersInReview}
          openContactRequests={stats.openContactRequests}
          totalUsers={stats.totalUsers}
        />

        <DashboardStatsCards {...stats} />

        <DashboardNavigationSections />
      </motion.div>
    </div>
  );
}
