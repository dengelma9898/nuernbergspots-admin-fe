import React from 'react';
import { useCreateBusiness } from '@/hooks/useCreateBusiness';
import { CreateBusinessForm } from '@/components/businesses/CreateBusinessForm';

export const CreateBusiness: React.FC = () => {
  const form = useCreateBusiness();
  return <CreateBusinessForm {...form} />;
};
