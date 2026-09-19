import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Depot, 
  AidCategory, 
  BatchItem, 
  FamilyResponse, 
  DistributionResponse, 
  CreateFamilyRequest, 
  CreateDistributionRequest,
  DepotSummaryResponse,
  NeedResponse,
  InventoryResponse
} from './types';
import { api } from './api';

export function mapSummaryToDepot(
  sum: DepotSummaryResponse, 
  needs: NeedResponse[] = [], 
  inventory: InventoryResponse[] = []
): Depot {
  const depotNeeds = needs.filter(n => String(n.depotId) === String(sum.id));
  const depotInventory = inventory.filter(i => String(i.depotId) === String(sum.id));

  // Pure real needs only
  const items = depotNeeds.map(n => ({
    id: `need-${n.id}`,
    name: n.itemName,
    nameFr: n.itemName,
    category: n.category,
    currentStock: n.currentAvailableQuantity,
    targetNeed: n.requestedQuantity,
    unit: n.unit,
    priority: n.priority,
    status: n.status,
    notes: n.notes,
  }));

  // Pure real inventory only
  const batches: BatchItem[] = depotInventory.map(inv => ({
    id: inv.batchNumber || `BATCH-${inv.id}`,
    depotId: String(sum.id),
    itemName: inv.itemName,
    quantity: inv.quantity,
    unit: inv.unit,
    expiryDate: inv.expirationDate || '',
    receivedDate: inv.receivedDate || '',
    status: (inv.isExpiringSoon ? 'expiring_soon' : inv.isExpired ? 'expired' : 'good') as any,
    batchNumber: inv.batchNumber,
    notes: inv.notes,
  }));

  const occupancy = sum.occupancyPercentage || 0;

  return {
    id: String(sum.id),
    code: `DZ-${(sum.location?.wilaya || 'DEP').slice(0, 3).toUpperCase()}-0${sum.id}`,
    name: sum.name,
    description: 'مستودع إغاثة ميداني معتمد',
    wilaya: sum.location?.wilaya || '',
    municipality: sum.location?.commune || '',
    address: sum.location?.address || '',
    googleMapsUrl: sum.location?.googleMapsUrl || '',
    phone: '',
    manager: 'مسؤول المستودع الميداني',
    status: (sum.status || 'ACTIVE') as any,
    totalCapacityPercent: Math.round(occupancy),
    occupancyPercentage: Math.round(occupancy),
    lastUpdated: 'محدث مباشرة عبر خادم Render',
    location: sum.location,
    items,
    batches,
  };
}

export interface ReliefState {
  depots: Depot[];
  families: FamilyResponse[];
  distributions: DistributionResponse[];
  selectedDepotId: string;
  isLoadingApi: boolean;
  isLiveApiConnected: boolean;
  setDepots: (depots: Depot[]) => void;
  setSelectedDepotId: (id: string) => void;
  getDepot: (id: string | number) => Depot | undefined;
  fetchDepotsOnly: () => Promise<Depot[]>;
  fetchLiveData: () => Promise<void>;
  receiveCargo: (
    depotId: string | number, 
    category: AidCategory, 
    itemName: string, 
    quantity: number, 
    unit: string, 
    expiryDate?: string
  ) => { success: boolean; message: string; batchId: string };
  updateDepotItem: (
    depotId: string | number, 
    itemId: string, 
    currentStock: number, 
    targetNeed: number
  ) => void;
  addFamily: (family: CreateFamilyRequest) => FamilyResponse;
  recordDistribution: (dist: CreateDistributionRequest) => DistributionResponse;
  resetAllData: () => void;
  findBestDepotForCargo: (category: AidCategory, quantity: number) => { depot: Depot; deficit: number }[];
}

export const useReliefStore = create<ReliefState>()(
  persist(
    (set, get) => ({
      // Clean real initial state — zero fake mock arrays
      depots: [],
      families: [],
      distributions: [],
      selectedDepotId: '1',
      isLoadingApi: false,
      isLiveApiConnected: false,

      setDepots: (depots: Depot[]) => set({ depots }),
      setSelectedDepotId: (id: string) => set({ selectedDepotId: String(id) }),

      getDepot: (id: string | number) => {
        return get().depots.find(d => String(d.id) === String(id));
      },

      /**
       * Fetch ONLY depots list (single endpoint GET /api/v1/depots)
       */
      fetchDepotsOnly: async () => {
        set({ isLoadingApi: true });
        try {
          const list = await api.depots.list();
          const mapped = list.map(d => mapSummaryToDepot(d, [], []));
          set({ 
            depots: mapped, 
            isLiveApiConnected: true, 
            isLoadingApi: false,
            selectedDepotId: mapped.length > 0 ? String(mapped[0].id) : '1'
          });
          return mapped;
        } catch (err) {
          console.warn('[Relief API] Failed to fetch depots list:', err);
          set({ isLoadingApi: false, isLiveApiConnected: false });
          return [];
        }
      },

      /**
       * Full live sync (only if explicitly called, zero mock data injection)
       */
      fetchLiveData: async () => {
        set({ isLoadingApi: true });
        try {
          const [summaryList, allNeeds, allInventory, allFamilies, allDistributions] = await Promise.all([
            api.depots.list().catch(() => []),
            api.needs.list().catch(() => []),
            api.inventory.list().catch(() => []),
            api.families.list().catch(() => []),
            api.distributions.list().catch(() => []),
          ]);

          if (summaryList && summaryList.length > 0) {
            const mappedDepots = summaryList.map(sum => mapSummaryToDepot(sum, allNeeds, allInventory));

            set({
              depots: mappedDepots,
              selectedDepotId: mappedDepots.length > 0 ? String(mappedDepots[0].id) : '1',
              isLiveApiConnected: true,
              isLoadingApi: false,
            });
          }

          if (allFamilies && allFamilies.length > 0) {
            set({ families: allFamilies });
          }

          if (allDistributions && allDistributions.length > 0) {
            set({ distributions: allDistributions });
          }

          set({ isLoadingApi: false, isLiveApiConnected: true });
        } catch (err: any) {
          console.warn('[Relief Store] Live sync error:', err?.message);
          set({ isLoadingApi: false, isLiveApiConnected: false });
        }
      },

      receiveCargo: (
        depotId: string | number,
        category: AidCategory,
        itemName: string,
        quantity: number,
        unit: string,
        expiryDate?: string
      ) => {
        const { depots } = get();
        const batchId = `BATCH-${new Date().getFullYear()}-ALG-${Math.floor(1000 + Math.random() * 9000)}`;

        const updatedDepots = depots.map(depot => {
          if (String(depot.id) !== String(depotId)) return depot;

          // Update matching item stock if exists
          const existingItemIndex = depot.items.findIndex(
            i => i.name.toLowerCase() === itemName.toLowerCase() || i.category === category
          );

          let updatedItems = [...depot.items];
          if (existingItemIndex >= 0) {
            const currentItem = updatedItems[existingItemIndex];
            updatedItems[existingItemIndex] = {
              ...currentItem,
              currentStock: currentItem.currentStock + quantity,
            };
          } else {
            updatedItems.push({
              id: `item-${Date.now()}`,
              name: itemName,
              category,
              currentStock: quantity,
              targetNeed: 0,
              unit,
              priority: 'LOW',
              status: 'OPEN',
            });
          }

          // Add new batch entry
          const newBatch: BatchItem = {
            id: batchId,
            depotId: String(depot.id),
            itemName,
            quantity,
            unit,
            expiryDate: expiryDate || '2027-12-31',
            receivedDate: new Date().toISOString().split('T')[0],
            status: 'good',
            batchNumber: batchId,
          };

          const updatedBatches = [newBatch, ...depot.batches];

          return {
            ...depot,
            items: updatedItems,
            batches: updatedBatches,
            lastUpdated: 'الآن',
          };
        });

        set({ depots: updatedDepots });

        return {
          success: true,
          batchId,
          message: `تم تسجيل واستلام الشحنة بنجاح برقم الدفعة ${batchId}`,
        };
      },

      updateDepotItem: (
        depotId: string | number,
        itemId: string,
        currentStock: number,
        targetNeed: number
      ) => {
        const { depots } = get();
        const updatedDepots = depots.map(depot => {
          if (String(depot.id) !== String(depotId)) return depot;

          const updatedItems = depot.items.map(item => {
            if (item.id === itemId) {
              return { ...item, currentStock, targetNeed };
            }
            return item;
          });

          return {
            ...depot,
            items: updatedItems,
            lastUpdated: 'الآن',
          };
        });

        set({ depots: updatedDepots });
      },

      addFamily: (data: CreateFamilyRequest) => {
        const newFamily: FamilyResponse = {
          id: Date.now(),
          aidId: data.aidId || `AID-DZ-${new Date().getFullYear()}-${String(data.id || Date.now()).slice(-4)}`,
          headOfFamilyName: data.headOfFamilyName,
          phone: data.phone,
          numberOfMembers: data.numberOfMembers,
          wilaya: data.wilaya,
          commune: data.commune,
          location: data.location,
          status: data.status || 'AFFECTED_DISPLACED',
          notes: data.notes,
          totalDistributionsReceived: data.totalDistributionsReceived || 0,
          pendingNeedsCount: data.pendingNeedsCount || 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ families: [newFamily, ...state.families] }));

        try {
          api.families.create(data).catch((e) => console.warn('[Live API] Family create error:', e?.message));
        } catch (e) {
          console.warn('[Live API] Family dispatch error:', e);
        }

        return newFamily;
      },

      recordDistribution: (data: CreateDistributionRequest) => {
        const depot = get().getDepot(data.depotId);
        const family = get().families.find(f => f.id === data.familyId);

        const newDist: DistributionResponse = {
          id: Date.now(),
          familyId: data.familyId,
          familyAidId: family?.aidId || `AID-DZ-2026-${String(data.familyId).padStart(4, '0')}`,
          headOfFamilyName: family?.headOfFamilyName || 'مستفيد مسجل',
          depotId: data.depotId,
          depotName: depot?.name || 'مستودع إغاثة',
          category: data.category,
          item: data.item,
          quantity: data.quantity,
          unit: data.unit,
          distributedAt: data.distributedAt || new Date().toISOString(),
          notes: data.notes,
        };

        set((state) => ({
          distributions: [newDist, ...state.distributions],
          families: state.families.map(f => 
            f.id === data.familyId 
              ? { ...f, totalDistributionsReceived: (f.totalDistributionsReceived || 0) + 1 }
              : f
          ),
        }));

        try {
          api.distributions.create({
            familyId: data.familyId,
            depotId: Number(data.depotId) || 1,
            category: data.category,
            item: data.item,
            quantity: data.quantity,
            unit: data.unit,
            notes: data.notes,
          }).catch((e) => console.warn('[Live API] Distribution create error:', e?.message));
        } catch (e) {
          console.warn('[Live API] Distribution dispatch error:', e);
        }

        return newDist;
      },

      resetAllData: () => {
        set({
          depots: [],
          families: [],
          distributions: [],
          selectedDepotId: '1',
        });
      },

      findBestDepotForCargo: (category: AidCategory, quantity: number) => {
        const { depots } = get();
        const results = depots.map(depot => {
          const item = depot.items.find(i => i.category === category);
          const deficit = item ? Math.max(0, item.targetNeed - item.currentStock) : 0;
          return { depot, deficit };
        });

        return results.sort((a, b) => b.deficit - a.deficit);
      },
    }),
    {
      name: 'algeria-bawsala-real-api-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useRelief() {
  return useReliefStore();
}
