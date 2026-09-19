'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Depot, FamilyBeneficiary, AidCategory, ZoneType, BatchItem } from './types';
import { INITIAL_DEPOTS, INITIAL_FAMILIES } from './seed-data';

interface ReliefContextType {
  depots: Depot[];
  families: FamilyBeneficiary[];
  selectedDepotId: string;
  setSelectedDepotId: (id: string) => void;
  getDepot: (id: string) => Depot | undefined;
  getFamily: (idOrNationalId: string) => FamilyBeneficiary | undefined;
  receiveCargo: (
    depotId: string, 
    category: AidCategory, 
    itemName: string, 
    quantity: number, 
    unit: string, 
    expiryDate?: string
  ) => { success: boolean; zone: ZoneType; message: string };
  distributeToFamily: (
    familyId: string,
    depotId: string,
    itemsToDistribute: { itemName: string; category: AidCategory; quantity: number; unit: string }[]
  ) => { success: boolean; message: string };
  registerFamily: (family: Omit<FamilyBeneficiary, 'receivedAids'>) => FamilyBeneficiary;
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

const ReliefContext = createContext<ReliefContextType | null>(null);

const STORAGE_KEY_DEPOTS = 'ighatha_depots_v1';
const STORAGE_KEY_FAMILIES = 'ighatha_families_v1';

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

export function ReliefProvider({ children }: { children: React.ReactNode }) {
  const [depots, setDepots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [families, setFamilies] = useState<FamilyBeneficiary[]>(INITIAL_FAMILIES);
  const [selectedDepotId, setSelectedDepotId] = useState<string>('jijel-01');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedDepots = localStorage.getItem(STORAGE_KEY_DEPOTS);
      const savedFamilies = localStorage.getItem(STORAGE_KEY_FAMILIES);
      if (savedDepots) {
        setDepots(JSON.parse(savedDepots));
      }
      if (savedFamilies) {
        setFamilies(JSON.parse(savedFamilies));
      }
    } catch (e) {
      console.error('Failed to parse saved data', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY_DEPOTS, JSON.stringify(depots));
      localStorage.setItem(STORAGE_KEY_FAMILIES, JSON.stringify(families));
    } catch (e) {
      console.error('Failed to save data', e);
    }
  }, [depots, families, isLoaded]);

  const getDepot = (id: string) => depots.find(d => d.id === id);

  const getFamily = (idOrNationalId: string) => {
    const query = idOrNationalId.trim().toLowerCase();
    return families.find(
      f => f.id.toLowerCase() === query || f.nationalId.toLowerCase() === query
    );
  };

  const receiveCargo = (
    depotId: string,
    category: AidCategory,
    itemName: string,
    quantity: number,
    unit: string,
    expiryDate?: string
  ) => {
    const assignedZone = getZoneForCategory(category);

    setDepots(prevDepots => {
      return prevDepots.map(depot => {
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
    });

    return {
      success: true,
      zone: assignedZone,
      message: `تم توجيه وتفريغ الشحنة بنجاح في ${assignedZone}`,
    };
  };

  const distributeToFamily = (
    familyId: string,
    depotId: string,
    itemsToDistribute: { itemName: string; category: AidCategory; quantity: number; unit: string }[]
  ) => {
    const depot = depots.find(d => d.id === depotId);
    const depotName = depot ? depot.name : 'مستودع الإغاثة';

    // 1. Record aid to the family
    setFamilies(prevFamilies => {
      return prevFamilies.map(fam => {
        if (fam.id !== familyId) return fam;
        const newRecords = itemsToDistribute.map(item => ({
          id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          date: new Date().toLocaleString('ar-DZ'),
          depotName,
          depotId,
        }));
        return {
          ...fam,
          receivedAids: [...newRecords, ...fam.receivedAids],
        };
      });
    });

    // 2. Deduct from depot inventory
    setDepots(prevDepots => {
      return prevDepots.map(d => {
        if (d.id !== depotId) return d;
        const updatedItems = d.items.map(item => {
          const distributed = itemsToDistribute.find(
            dist => dist.itemName.toLowerCase() === item.name.toLowerCase() || dist.category === item.category
          );
          if (distributed) {
            return {
              ...item,
              currentStock: Math.max(0, item.currentStock - distributed.quantity),
            };
          }
          return item;
        });
        return {
          ...d,
          items: updatedItems,
          lastUpdated: 'الآن',
        };
      });
    });

    return {
      success: true,
      message: 'تم تسجيل التوزيع وتحديث بطاقة العائلة ورصيد المستودع بنجاح',
    };
  };

  const registerFamily = (familyData: Omit<FamilyBeneficiary, 'receivedAids'>): FamilyBeneficiary => {
    const newFamily: FamilyBeneficiary = {
      ...familyData,
      receivedAids: [],
    };
    setFamilies(prev => [newFamily, ...prev]);
    return newFamily;
  };

  const updateDepotItem = (
    depotId: string,
    itemId: string,
    currentStock: number,
    targetNeed: number
  ) => {
    setDepots(prev =>
      prev.map(d => {
        if (d.id !== depotId) return d;
        return {
          ...d,
          items: d.items.map(i => (i.id === itemId ? { ...i, currentStock, targetNeed } : i)),
          lastUpdated: 'الآن',
        };
      })
    );
  };

  const resetAllData = () => {
    setDepots(INITIAL_DEPOTS);
    setFamilies(INITIAL_FAMILIES);
    localStorage.removeItem(STORAGE_KEY_DEPOTS);
    localStorage.removeItem(STORAGE_KEY_FAMILIES);
  };

  const findBestDepotForCargo = (category: AidCategory, quantity: number) => {
    // Rank depots by who has the biggest deficit in that category
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
  };

  return (
    <ReliefContext.Provider
      value={{
        depots,
        families,
        selectedDepotId,
        setSelectedDepotId,
        getDepot,
        getFamily,
        receiveCargo,
        distributeToFamily,
        registerFamily,
        updateDepotItem,
        resetAllData,
        getZoneForCategory,
        findBestDepotForCargo,
      }}
    >
      {children}
    </ReliefContext.Provider>
  );
}

export function useRelief() {
  const context = useContext(ReliefContext);
  if (!context) {
    throw new Error('useRelief must be used within a ReliefProvider');
  }
  return context;
}
