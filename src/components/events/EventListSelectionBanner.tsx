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
      <div className="flex flex-wrap items-center gap-3 text-foreground">
        <CheckSquare className="h-5 w-5 text-primary shrink-0" />
        <span className="font-medium text-left">
          Auswahlmodus aktiv – Nur aktuelle und zukünftige Events auswählbar
        </span>
        <span className="sm:ml-auto text-sm opacity-80 w-full sm:w-auto text-left sm:text-right">
          {selectedCount} von {totalCount} ausgewählt
        </span>
      </div>
    </motion.div>
  );
}
