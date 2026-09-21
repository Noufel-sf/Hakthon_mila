import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  DepotSummaryResponse, 
  PublicDepotResponse, 
  PublicDepotDetailResponse, 
  CreateDepotRequest, 
  UpdateDepotRequest, 
  DepotResponse 
} from '@/lib/types';
import { toast } from 'sonner';

export const depotKeys = {
  all: ['depots'] as const,
  lists: () => [...depotKeys.all, 'list'] as const,
  list: (wilaya?: string) => [...depotKeys.lists(), { wilaya }] as const,
  publicLists: () => [...depotKeys.all, 'public'] as const,
  publicList: (wilaya?: string) => [...depotKeys.publicLists(), { wilaya }] as const,
  details: () => [...depotKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...depotKeys.details(), String(id)] as const,
};

/**
 * Hook to fetch all depots (admin/general summary)
 */
export function useDepotsQuery(wilaya?: string) {
  return useQuery<DepotSummaryResponse[]>({
    queryKey: depotKeys.list(wilaya),
    queryFn: () => api.depots.list(wilaya),
  });
}

/**
 * Hook to fetch public citizen depots list
 */
export function usePublicDepotsQuery(wilaya?: string) {
  return useQuery<PublicDepotResponse[]>({
    queryKey: depotKeys.publicList(wilaya),
    queryFn: () => api.public.getDepots(wilaya),
  });
}

/**
 * Hook to fetch single depot public details
 */
export function useDepotDetailsQuery(id: number | string | undefined) {
  return useQuery<PublicDepotDetailResponse>({
    queryKey: depotKeys.detail(id || ''),
    queryFn: () => api.public.getDepotDetails(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook to fetch single depot full details (admin/operations)
 */
export function useAdminDepotQuery(id: number | string | undefined) {
  return useQuery<DepotResponse>({
    queryKey: [...depotKeys.detail(id || ''), 'admin'],
    queryFn: () => api.depots.getById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Mutation to create a new depot
 */
export function useCreateDepotMutation() {
  const queryClient = useQueryClient();

  return useMutation<DepotResponse, Error, CreateDepotRequest>({
    mutationFn: (data: CreateDepotRequest) => api.depots.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: depotKeys.all });
      toast.success('تمت إضافة المستودع بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر إنشاء المستودع الجديد');
    },
  });
}

/**
 * Mutation to update an existing depot
 */
export function useUpdateDepotMutation() {
  const queryClient = useQueryClient();

  return useMutation<DepotResponse, Error, { id: number | string; data: UpdateDepotRequest }>({
    mutationFn: ({ id, data }) => api.depots.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: depotKeys.all });
      queryClient.invalidateQueries({ queryKey: depotKeys.detail(variables.id) });
      toast.success('تم تحديث بيانات المستودع بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تحديث بيانات المستودع');
    },
  });
}

/**
 * Mutation to delete a depot
 */
export function useDeleteDepotMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => api.depots.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: depotKeys.all });
      toast.success('تم حذف المستودع بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر حذف المستودع');
    },
  });
}
