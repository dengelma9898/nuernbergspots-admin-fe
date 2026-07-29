import { useUserBlockManagement } from '@/hooks/useUserBlockManagement';
import { UserBlockManagementContent } from '@/components/users/UserBlockManagementContent';

export function UserBlockManagement() {
  const userBlockManagement = useUserBlockManagement();
  return <UserBlockManagementContent {...userBlockManagement} />;
}
