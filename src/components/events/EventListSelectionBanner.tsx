import { CheckSquare } from 'lucide-react';
import { motion } from '@/components/motion';

interface EventListSelectionBannerProps {
  selectedCount: number;
  totalCount: number;
}

export function EventListSelectionBanner({
  selectedCount,
  totalCount,
}: EventListSelectionBannerProps) {
  return (
    <motion.div
      className="mb-4 p-4 rounded-xl bg-primary/20 border border-primary/40"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center gap-3 text-foreground">
        <CheckSquare className="h-5 w-5 text-primary" />
        <span className="font-medium">
          Auswahlmodus aktiv – Nur aktuelle und zukünftige Events auswählbar
        </span>
        <span className="ml-auto text-sm opacity-80">
          {selectedCount} von {totalCount} ausgewählt
        </span>
      </div>
    </motion.div>
  );
}
