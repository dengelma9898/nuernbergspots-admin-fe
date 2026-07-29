import { useSpecialPollDetail } from '@/hooks/useSpecialPollDetail';
import { SpecialPollDetailContent } from '@/components/special-poll/SpecialPollDetailContent';

export default function SpecialPollDetail() {
  const specialPollDetail = useSpecialPollDetail();
  return <SpecialPollDetailContent {...specialPollDetail} />;
}
