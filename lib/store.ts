import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Depot, AidCategory, ZoneType, BatchItem } from './types';
import { INITIAL_DEPOTS } from './seed-data';

export function getZoneForCategory(category: AidCategory): ZoneType {
  switch (category) {
    case 'food':
    case 'medical':
      return 'Zone A';
    case 'bedding':
    case 'hygiene':
      return 'Zone B';
    case 'appliances':
      return 'Zone C';
    case 'furniture':
      return 'Zone D';
    default:
      return 'Zone A';
  }
}

export interface ReliefState {
  depots: Depot[];
  selectedDepotId: string;
  setSelectedDepotId: (id: string) => void;
  getDepot: (id: string) => Depot | undefined;
  receiveCargo: (
    depotId: string, 
    category: AidCategory, 
    itemName: string, 
    quantity: number, 
    unit: string, 
    expiryDate?: string
  ) => { success: boolean; zone: ZoneType; message: string };
  updateDepotItem: (
    depotId: string, 
    itemId: string, 
    currentStock: number, 
    targetNeed: number
  ) => void;
  resetAllData: () => void;
  getZoneForCategory: (category: AidCategory) => ZoneType;
  findBestDepotForCargo: (category: AidCategory, quantity: number) => { depot: Depot; deficit: number }[];
}

export const useReliefStore = create<ReliefState>()(
  persist(
    (set, get) => ({
      depots: INITIAL_DEPOTS,
      selectedDepotId: 'jijel-01',

      setSelectedDepotId: (id: string) => set({ selectedDepotId: id }),

      getDepot: (id: string) => {
        return get().depots.find(d => d.id === id);
      },

      receiveCargo: (
        depotId: string,
        category: AidCategory,
        itemName: string,
        quantity: number,
        unit: string,
        expiryDate?: string
      ) => {
        const assignedZone = getZoneForCategory(category);
        const { depots } = get();

        const updatedDepots = depots.map(depot => {
          if (depot.id !== depotId) return depot;

          // Check if item exists in depot
          const existingItemIndex = depot.items.findIndex(
            i => i.name.toLowerCase().includes(itemName.toLowerCase()) || 
                 itemName.toLowerCase().includes(i.name.toLowerCase()) ||
                 i.category === category
          );

          let updatedItems = [...depot.items];
          if (existingItemIndex >= 0) {
            const item = updatedItems[existingItemIndex];
            updatedItems[existingItemIndex] = {
              ...item,
              currentStock: item.currentStock + quantity,
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
              priority: 'moderate',
            });
          }

          // Add batch if expiry date is present
          let updatedBatches = [...depot.batches];
          if (expiryDate) {
            const expDate = new Date(expiryDate);
            const now = new Date();
            const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const status: BatchItem['status'] = diffDays <= 5 ? 'expiring_soon' : diffDays <= 0 ? 'expired' : 'good';

            updatedBatches.unshift({
              id: `batch-${Date.now()}`,
              depotId,
              itemId: existingItemIndex >= 0 ? updatedItems[existingItemIndex].id : `item-${Date.now()}`,
              itemName,
              quantity,
              unit,
              expiryDate,
              receivedDate: new Date().toISOString().split('T')[0],
              zone: assignedZone,
              status,
            });
          }

          // Update zone capacity usage
          const updatedZones = depot.zones.map(z => {
            if (z.id === assignedZone) {
              return { ...z, currentUnits: Math.min(z.maxCapacity, z.currentUnits + quantity) };
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
          message: `تم توجيه وتفريغ الشحنة بنجاح في ${assignedZone}`,
        };
      },

      updateDepotItem: (
        depotId: string,
        itemId: string,
        currentStock: number,
        targetNeed: number
      ) => {
        const { depots } = get();
        const updatedDepots = depots.map(d => {
          if (d.id !== depotId) return d;
          return {
            ...d,
            items: d.items.map(i => (i.id === itemId ? { ...i, currentStock, targetNeed } : i)),
            lastUpdated: 'الآن',
          };
        });
        set({ depots: updatedDepots });
      },

      resetAllData: () => {
        set({ depots: INITIAL_DEPOTS });
      },

      getZoneForCategory,

      findBestDepotForCargo: (category: AidCategory, quantity: number) => {
        const { depots } = get();
        const ranked = depots.map(depot => {
          const categoryItems = depot.items.filter(i => i.category === category);
          let totalDeficit = 0;
          categoryItems.forEach(item => {
            const def = item.targetNeed - item.currentStock;
            if (def > 0) totalDeficit += def;
          });
          return {
            depot,
            deficit: totalDeficit,
          };
        });

        return ranked.sort((a, b) => b.deficit - a.deficit);
      },
    }),
    {
      name: 'ighatha_zustand_store_v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Alias hook for convenience and backwards-compatibility
export const useRelief = useReliefStore;
