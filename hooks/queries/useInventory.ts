import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  InventoryResponse, 
  CreateInventoryRequest, 
  UpdateInventoryRequest 
} from '@/lib/types';
import { toast } from 'sonner';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: { depotId?: number | string; category?: string } | (number | string)) => {
    const p = typeof params === 'object' ? params : params ? { depotId: params } : undefined;
    return [...inventoryKeys.lists(), p] as const;
  },
  expiring: (daysAhead: number = 30) => [...inventoryKeys.all, 'expiring', { daysAhead }] as const,
};

/**
 * Hook to fetch inventory batches (with optional params or depotId)
 */
export function useInventoryQuery(params?: { depotId?: number | string; category?: string } | (number | string)) {
  const queryParams = typeof params === 'object' ? params : params ? { depotId: params } : undefined;
  return useQuery<InventoryResponse[]>({
    queryKey: inventoryKeys.list(queryParams),
    queryFn: () => api.inventory.list(queryParams),
  });
}

/**
 * Hook to fetch expiring inventory batches (FIFO)
 */
export function useExpiringInventoryQuery(daysAhead: number = 90) {
  return useQuery<InventoryResponse[]>({
    queryKey: inventoryKeys.expiring(daysAhead),
    queryFn: () => api.inventory.getExpiring(daysAhead),
  });
}

/**
 * Mutation to receive / intake inventory shipment
 */
export function useCreateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<InventoryResponse, Error, CreateInventoryRequest>({
    mutationFn: (data: CreateInventoryRequest) => api.inventory.add(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list(variables.depotId) });
      toast.success('تم تسجيل وتخزين الشحنة بنجاح في المستودع');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تسجيل شحنة المخزون');
    },
  });
}

/**
 * Mutation to update inventory batch
 */
export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<InventoryResponse, Error, { id: number | string; data: UpdateInventoryRequest }>({
    mutationFn: ({ id, data }) => api.inventory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('تم تحديث بيانات الدفعة بنجاح');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر تحديث الدفعة');
    },
  });
}

/**
 * Mutation to delete inventory batch
 */
export function useDeleteInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number | string>({
    mutationFn: (id: number | string) => api.inventory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('تم حذف الدفعة من المخزون');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'تعذر حذف دفعة المخزون');
    },
  });
}
