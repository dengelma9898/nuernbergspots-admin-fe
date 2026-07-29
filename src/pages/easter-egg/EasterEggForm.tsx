import { useEasterEggForm } from '@/hooks/useEasterEggForm';
import { EasterEggFormContent } from '@/components/easter-egg/EasterEggFormContent';

export function EasterEggForm() {
  const easterEggForm = useEasterEggForm();
  return <EasterEggFormContent {...easterEggForm} />;
}
