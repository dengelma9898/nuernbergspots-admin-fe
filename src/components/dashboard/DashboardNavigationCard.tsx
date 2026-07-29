import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from '@/components/motion';
import { staggerItem } from '@/lib/animations';
import { defaultTransition } from '@/lib/animations';
import { cardPresetHover, badgePreset } from '@/lib/designTokens';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface DashboardNavigationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  index?: number;
}

export function DashboardNavigationCard({
  icon: Icon,
  title,
  description,
  href,
  index = 0,
}: DashboardNavigationCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{
        ...defaultTransition,
        delay: index * 0.02,
      }}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: defaultTransition,
      }}
    >
      <Card className={cn(cardPresetHover, 'cursor-pointer group')} onClick={() => navigate(href)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                className={cn(badgePreset, 'p-3')}
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
            <motion.div whileHover={{ x: 4, scale: 1.1 }} transition={defaultTransition}>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            </motion.div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
}
