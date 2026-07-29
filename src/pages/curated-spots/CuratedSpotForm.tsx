import { useCuratedSpotForm } from '@/hooks/useCuratedSpotForm';
import { CuratedSpotFormFields } from '@/components/curated-spots/CuratedSpotFormFields';

export function CuratedSpotForm() {
  const form = useCuratedSpotForm();
  return <CuratedSpotFormFields {...form} />;
}
