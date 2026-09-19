import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Depot, 
  AidCategory, 
  ZoneType, 
  BatchItem, 
  FamilyResponse, 
  DistributionResponse, 
  CreateFamilyRequest, 
  CreateDistributionRequest 
} from './types';
import { INITIAL_DEPOTS, INITIAL_FAMILIES, INITIAL_DISTRIBUTIONS } from './seed-data';

export function getZoneForCategory(category: AidCategory | string): ZoneType {
  const norm = String(category).toUpperCase();
  switch (norm) {
    case 'FOOD':
    case 'WATER':
    case 'MEDICAL':
      return 'Zone A';
    case 'MATTRESSES':
    case 'BLANKETS':
    case 'CLOTHES':
    case 'HYGIENE':
    case 'BEDDING':
      return 'Zone B';
    case 'APPLIANCES':
    case 'OTHER':
      return 'Zone C';
    case 'FURNITURE':
      return 'Zone D';
    default:
      return 'Zone A';
  }
}

export interface ReliefState {
  depots: Depot[];
  families: FamilyResponse[];
  distributions: DistributionResponse[];
  selectedDepotId: string;
  setSelectedDepotId: (id: string) => void;
  getDepot: (id: string | number) => Depot | undefined;
  receiveCargo: (
    depotId: string | number, 
    category: AidCategory, 
    itemName: string, 
    quantity: number, 
    unit: string, 
    expiryDate?: string
  ) => { success: boolean; zone: ZoneType; message: string; batchId: string };
  updateDepotItem: (
    depotId: string | number, 
    itemId: string, 
    currentStock: number, 
    targetNeed: number
  ) => void;
  addFamily: (family: CreateFamilyRequest) => FamilyResponse;
  recordDistribution: (dist: CreateDistributionRequest) => DistributionResponse;
  resetAllData: () => void;
  getZoneForCategory: (category: AidCategory | string) => ZoneType;
  findBestDepotForCargo: (category: AidCategory, quantity: number) => { depot: Depot; deficit: number }[];
}

export const useReliefStore = create<ReliefState>()(
  persist(
    (set, get) => ({
      depots: INITIAL_DEPOTS,
      families: INITIAL_FAMILIES,
      distributions: INITIAL_DISTRIBUTIONS,
      selectedDepotId: 'jijel-01',

      setSelectedDepotId: (id: string) => set({ selectedDepotId: String(id) }),

      getDepot: (id: string | number) => {
        return get().depots.find(d => String(d.id) === String(id));
      },

      receiveCargo: (
        depotId: string | number,
        category: AidCategory,
        itemName: string,
        quantity: number,
        unit: string,
        expiryDate?: string
      ) => {
        const assignedZone = getZoneForCategory(category);
        const { depots } = get();
        const batchId = `BATCH-${new Date().getFullYear()}-ALG-${Math.floor(1000 + Math.random() * 9000)}`;

        const updatedDepots = depots.map(depot => {
          if (String(depot.id) !== String(depotId)) return depot;

          // Check if item exists in depot
          const existingItemIndex = depot.items.findIndex(
            i => i.name.toLowerCase().includes(itemName.toLowerCase()) || 
                 itemName.toLowerCase().includes(i.name.toLowerCase()) ||
                 i.category === category
          );

          let updatedItems = [...depot.items];
          if (existingItemIndex >= 0) {
            const item = updatedItems[existingItemIndex];
            const newStock = item.currentStock + quantity;
            updatedItems[existingItemIndex] = {
              ...item,
              currentStock: newStock,
              status: newStock >= item.targetNeed ? 'FULFILLED' : 'PARTIALLY_FULFILLED',
            };
          } else {
            updatedItems.push({
              id: `item-${Date.now()}`,
              name: itemName,
              nameFr: itemName,
              category,
              currentStock: quantity,
              targetNeed: quantity * 2,
              unit,
              assignedZone,
              priority: 'MEDIUM',
              status: 'OPEN',
            });
          }

          // Add to batches if has expiry or perishable
          let updatedBatches = [...depot.batches];
          if (expiryDate) {
            const expDate = new Date(expiryDate);
            const now = new Date();
            const daysDiff = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
            
            updatedBatches.push({
              id: batchId,
              depotId: String(depot.id),
              itemName,
              quantity,
              unit,
              expiryDate,
              receivedDate: new Date().toISOString().split('T')[0],
              zone: assignedZone,
              status: daysDiff <= 7 ? 'expiring_soon' : 'good',
              batchNumber: batchId,
            });
          }

          // Update zone occupancy
          const updatedZones = depot.zones.map(z => {
            if (z.id === assignedZone) {
              return {
                ...z,
                currentUnits: Math.min(z.maxCapacity, z.currentUnits + quantity),
              };
            }
            return z;
          });

          return {
            ...depot,
            items: updatedItems,
            batches: updatedBatches,
            zones: updatedZones,
            lastUpdated: 'الآن',
          };
        });

        set({ depots: updatedDepots });

        return {
          success: true,
          zone: assignedZone,
          batchId,
          message: `تم توجيه وتفريغ الشحنة في ${assignedZone} بنجاح وحفظ بيانات الدفعة (${batchId})!`,
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
              return {
                ...item,
                currentStock,
                targetNeed,
                status: (currentStock >= targetNeed ? 'FULFILLED' : 'OPEN') as any,
              };
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
          id: data.id,
          aidId: data.aidId || `AID-DZ-${new Date().getFullYear()}-${String(data.id).padStart(4, '0')}`,
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

        // Increment family distributions
        set((state) => ({
          distributions: [newDist, ...state.distributions],
          families: state.families.map(f => 
            f.id === data.familyId 
              ? { ...f, totalDistributionsReceived: (f.totalDistributionsReceived || 0) + 1 }
              : f
          ),
        }));

        return newDist;
      },

      resetAllData: () => {
        set({
          depots: INITIAL_DEPOTS,
          families: INITIAL_FAMILIES,
          distributions: INITIAL_DISTRIBUTIONS,
          selectedDepotId: 'jijel-01',
        });
      },

      getZoneForCategory,

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
      name: 'algeria-disaster-relief-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useRelief() {
  return useReliefStore();
}
