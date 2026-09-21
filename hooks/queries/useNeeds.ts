import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  NeedResponse, 
  PublicShortageDTO, 
  CreateNeedRequest, 
  UpdateNeedRequest 
} from '@/lib/types';
import { toast } from 'sonner';

export const needKeys = {
  all: ['needs'] as const,
  lists: () => [...needKeys.all, 'list'] as const,
  list: (params?: { depotId?: number | string; priority?: string } | (number | string)) => {
    const p = typeof params === 'object' ? params : params ? { depotId: params } : undefined;
    return [...needKeys.lists(), p] as const;
  },
  shortages: (wilaya?: string) => [...needKeys.all, 'shortages', { wilaya }] as const,
};

/**
 * Hook to fetch needs list (with optional params or depotId filter)
 */
export function useNeedsQuery(params?: { depotId?: number | string; priority?: string } | (number | string)) {
  const queryParams = typeof params === 'object' ? params : params ? { depotId: params } : undefined;
  return useQuery<NeedResponse[]>({
    queryKey: needKeys.list(queryParams),
    queryFn: () => api.needs.list(queryParams),
  });
}

/**
 * Hook to fetch public shortages across all depots
 */
export function useShortagesQuery(wilaya?: string) {
  return useQuery<PublicShortageDTO[]>({
    queryKey: needKeys.shortages(wilaya),
    queryFn: () => api.public.getShortages(wilaya),
  });
}

/**
 * Mutation to create a new need request
 */
export function useCreateNeedMutation() {
  const queryClient = useQueryClient();

  return useMutation<NeedResponse, Error, CreateNeedRequest>({
    mutationFn: (data: CreateNeedRequest) => api.needs.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: needKeys.all });
      toast.success('تم تسجيل طلب الاحتياج بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تسجيل طلب الاحتياج');
    },
  });
}

/**
 * Mutation to update an existing need request
 */
export function useUpdateNeedMutation() {
  const queryClient = useQueryClient();

  return useMutation<NeedResponse, Error, { id: number | string; data: UpdateNeedRequest }>({
    mutationFn: ({ id, data }) => api.needs.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: needKeys.all });
      toast.success('تم تحديث طلب الاحتياج بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تحديث طلب الاحتياج');
    },
  });
}

/**
 * Mutation to delete a need request
 */
export function useDeleteNeedMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => api.needs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: needKeys.all });
      toast.success('تم حذف طلب الاحتياج بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر حذف طلب الاحتياج');
    },
  });
}
