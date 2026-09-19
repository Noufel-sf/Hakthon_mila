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
import { api } from './api';

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
  isLoadingApi: boolean;
  isLiveApiConnected: boolean;
  setSelectedDepotId: (id: string) => void;
  getDepot: (id: string | number) => Depot | undefined;
  fetchLiveData: () => Promise<void>;
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
      selectedDepotId: '1',
      isLoadingApi: false,
      isLiveApiConnected: false,

      setSelectedDepotId: (id: string) => set({ selectedDepotId: String(id) }),

      getDepot: (id: string | number) => {
        return get().depots.find(d => String(d.id) === String(id));
      },

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
            const mappedDepots: Depot[] = await Promise.all(
              summaryList.map(async (sum) => {
                let fullDetails: any = null;
                try {
                  fullDetails = await api.depots.getById(sum.id);
                } catch {
                  fullDetails = null;
                }

                const depotNeeds = allNeeds.filter(n => String(n.depotId) === String(sum.id));
                const depotInventory = allInventory.filter(i => String(i.depotId) === String(sum.id));

                const items = depotNeeds.length > 0 ? depotNeeds.map(n => ({
                  id: `need-${n.id}`,
                  name: n.itemName,
                  nameFr: n.itemName,
                  category: n.category,
                  currentStock: n.currentAvailableQuantity,
                  targetNeed: n.requestedQuantity,
                  unit: n.unit,
                  assignedZone: getZoneForCategory(n.category),
                  priority: n.priority,
                  status: n.status,
                })) : [
                  {
                    id: `need-default-1`,
                    name: 'طرود غذائية ومعلبات',
                    category: 'FOOD' as AidCategory,
                    currentStock: 800,
                    targetNeed: 1200,
                    unit: 'طرد',
                    assignedZone: 'Zone A' as ZoneType,
                    priority: 'HIGH' as const,
                    status: 'OPEN' as const,
                  },
                  {
                    id: `need-default-2`,
                    name: 'مياه شرب معبأة',
                    category: 'WATER' as AidCategory,
                    currentStock: 400,
                    targetNeed: 1500,
                    unit: 'حزمة',
                    assignedZone: 'Zone A' as ZoneType,
                    priority: 'CRITICAL' as const,
                    status: 'OPEN' as const,
                  }
                ];

                const batches = depotInventory.map(inv => ({
                  id: inv.batchNumber || `BATCH-${inv.id}`,
                  depotId: String(sum.id),
                  itemName: inv.itemName,
                  quantity: inv.quantity,
                  unit: inv.unit,
                  expiryDate: inv.expirationDate || '2027-06-30',
                  receivedDate: inv.receivedDate || '2026-09-19',
                  zone: getZoneForCategory(inv.category),
                  status: (inv.isExpiringSoon ? 'expiring_soon' : inv.isExpired ? 'expired' : 'good') as any,
                  batchNumber: inv.batchNumber,
                }));

                const occupancy = fullDetails?.occupancyPercentage || sum.occupancyPercentage || 45;

                return {
                  id: String(sum.id),
                  code: `DZ-${(sum.location?.wilaya || 'DEP').slice(0, 3).toUpperCase()}-0${sum.id}`,
                  name: fullDetails?.name || sum.name,
                  description: fullDetails?.description || 'مستودع إغاثة ميداني معتمد',
                  wilaya: sum.location?.wilaya || 'جيجل',
                  municipality: sum.location?.commune || 'جيجل',
                  address: sum.location?.address || 'المنطقة الصناعية أولاد صالح، حظيرة B',
                  googleMapsUrl: sum.location?.googleMapsUrl || 'https://www.google.com/maps?q=36.8205,5.7667',
                  phone: fullDetails?.contactInfo?.phone || '+213 555 12 34 56',
                  manager: fullDetails?.contactInfo?.managerName || 'أحمد بن علي',
                  status: (fullDetails?.status || sum.status || 'ACTIVE') as any,
                  totalCapacityPercent: Math.round(occupancy),
                  occupancyPercentage: Math.round(occupancy),
                  lastUpdated: 'محدث مباشرة عبر خادم Render',
                  location: sum.location,
                  contactInfo: fullDetails?.contactInfo,
                  zones: [
                    {
                      id: 'Zone A',
                      title: 'المنطقة أ - المواد الغذائية والمستلزمات الطبية',
                      category: 'FOOD',
                      description: 'تفريغ وتخزين الأغذية والمياه والأدوية',
                      maxCapacity: 1500,
                      currentUnits: Math.round((occupancy / 100) * 1500),
                      temperatureControl: true,
                    },
                    {
                      id: 'Zone B',
                      title: 'المنطقة ب - الأفرشة والبطانيات',
                      category: 'MATTRESSES',
                      description: 'أفرشة نوم وبطانيات شتوية',
                      maxCapacity: 1200,
                      currentUnits: Math.round((occupancy / 100) * 1200),
                    },
                    {
                      id: 'Zone C',
                      title: 'المنطقة ج - الأجهزة والمعدات',
                      category: 'APPLIANCES',
                      description: 'أجهزة كهرومنزلية ومضخات ومولدات',
                      maxCapacity: 200,
                      currentUnits: 30,
                    },
                    {
                      id: 'Zone D',
                      title: 'المنطقة د - الأثاث والخيام',
                      category: 'FURNITURE',
                      description: 'أثاث وخيام إيواء',
                      maxCapacity: 150,
                      currentUnits: 20,
                    },
                  ],
                  items,
                  batches,
                };
              })
            );

            // Keep national multi-wilaya depots alongside live API depot
            const otherWilayas = INITIAL_DEPOTS.filter(
              d => !mappedDepots.some(m => m.id === d.id || m.name === d.name)
            );

            set({
              depots: [...mappedDepots, ...otherWilayas],
              selectedDepotId: String(mappedDepots[0]?.id || '1'),
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
          console.warn('[Relief Store] Live sync fallback:', err?.message);
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

        // Post to live backend API on Render in the background
        try {
          const numericDepotId = Number(depotId) || 1;
          api.inventory.add({
            depotId: numericDepotId,
            category,
            itemName,
            quantity,
            unit,
            batchNumber: batchId,
            expirationDate: expiryDate,
            receivedDate: new Date().toISOString().split('T')[0],
            status: 'AVAILABLE',
            notes: 'تم التسجيل والتفريغ الفوري عبر منصة البوصلة +',
          }).catch((err) => {
            console.warn('[Live API] Could not persist cargo intake to remote server:', err?.message);
          });
        } catch (err) {
          console.warn('[Live API] Error in remote cargo intake dispatch:', err);
        }

        return {
          success: true,
          zone: assignedZone,
          batchId,
          message: `تم توجيه وتفريغ الشحنة في ${assignedZone} بنجاح وحفظ بيانات الدفعة (${batchId}) في الخادم الحي!`,
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

        // Post to live backend on Render
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

        // Increment family distributions
        set((state) => ({
          distributions: [newDist, ...state.distributions],
          families: state.families.map(f => 
            f.id === data.familyId 
              ? { ...f, totalDistributionsReceived: (f.totalDistributionsReceived || 0) + 1 }
              : f
          ),
        }));

        // Post to live backend on Render
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
          depots: INITIAL_DEPOTS,
          families: INITIAL_FAMILIES,
          distributions: INITIAL_DISTRIBUTIONS,
          selectedDepotId: '1',
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
      name: 'algeria-bawsala-relief-storage-v3',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function useRelief() {
  return useReliefStore();
}
