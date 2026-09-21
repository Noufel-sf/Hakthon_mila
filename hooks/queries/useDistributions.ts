import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  DistributionResponse, 
  CreateDistributionRequest 
} from '@/lib/types';
import { toast } from 'sonner';

export const distributionKeys = {
  all: ['distributions'] as const,
  lists: () => [...distributionKeys.all, 'list'] as const,
};

/**
 * Hook to fetch field distribution records
 */
export function useDistributionsQuery() {
  return useQuery<DistributionResponse[]>({
    queryKey: distributionKeys.lists(),
    queryFn: () => api.distributions.list(),
  });
}

/**
 * Mutation to record a new aid distribution
 */
export function useCreateDistributionMutation() {
  const queryClient = useQueryClient();

  return useMutation<DistributionResponse, Error, CreateDistributionRequest>({
    mutationFn: (data: CreateDistributionRequest) => api.distributions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distributionKeys.all });
      toast.success('تم تسجيل عملية التوزيع الميداني بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تسجيل عملية التوزيع');
    },
  });
}

/**
 * Mutation to delete distribution record
 */
export function useDeleteDistributionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => api.distributions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: distributionKeys.all });
      toast.success('تم حذف قيد التوزيع بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر حذف قيد التوزيع');
    },
  });
}
