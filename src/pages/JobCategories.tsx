import { useJobCategories } from '@/hooks/useJobCategories';
import { JobCategoriesContent } from '@/components/job-categories/JobCategoriesContent';

export function JobCategories() {
  const form = useJobCategories();
  return <JobCategoriesContent {...form} />;
}
