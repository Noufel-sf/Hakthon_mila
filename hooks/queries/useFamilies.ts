import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  FamilyResponse, 
  CreateFamilyRequest, 
  UpdateFamilyRequest 
} from '@/lib/types';
import { toast } from 'sonner';

export const familyKeys = {
  all: ['families'] as const,
  lists: () => [...familyKeys.all, 'list'] as const,
  list: (wilaya?: string) => [...familyKeys.lists(), { wilaya }] as const,
};

/**
 * Hook to fetch families list
 */
export function useFamiliesQuery(params?: { wilaya?: string; commune?: string; status?: string } | string) {
  const queryParams = typeof params === 'string' ? { wilaya: params } : params;
  return useQuery<FamilyResponse[]>({
    queryKey: familyKeys.list(queryParams?.wilaya),
    queryFn: () => api.families.list(queryParams),
  });
}

/**
 * Mutation to create a new affected family file
 */
export function useCreateFamilyMutation() {
  const queryClient = useQueryClient();

  return useMutation<FamilyResponse, Error, CreateFamilyRequest>({
    mutationFn: (data: CreateFamilyRequest) => api.families.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      toast.success('تم تسجيل العائلة المتضررة بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تسجيل العائلة');
    },
  });
}

/**
 * Mutation to update family details
 */
export function useUpdateFamilyMutation() {
  const queryClient = useQueryClient();

  return useMutation<FamilyResponse, Error, { id: number | string; data: UpdateFamilyRequest }>({
    mutationFn: ({ id, data }) => api.families.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      toast.success('تم تحديث بيانات العائلة بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تحديث بيانات العائلة');
    },
  });
}

/**
 * Mutation to delete family record
 */
export function useDeleteFamilyMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => api.families.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      toast.success('تم حذف ملف العائلة بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر حذف ملف العائلة');
    },
  });
}
