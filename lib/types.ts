export type AidCategory = 
  | 'food' 
  | 'bedding' 
  | 'appliances' 
  | 'furniture' 
  | 'medical' 
  | 'hygiene';

export type ZoneType = 'Zone A' | 'Zone B' | 'Zone C' | 'Zone D';

export interface DepotItem {
  id: string;
  name: string;
  nameFr: string;
  category: AidCategory;
  currentStock: number;
  targetNeed: number;
  unit: string;
  assignedZone: ZoneType;
  priority: 'urgent' | 'moderate' | 'low';
}

export interface BatchItem {
  id: string;
  depotId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date string YYYY-MM-DD
  receivedDate: string;
  zone: ZoneType;
  status: 'good' | 'expiring_soon' | 'expired';
}

export interface DepotZoneInfo {
  id: ZoneType;
  title: string;
  category: AidCategory;
  description: string;
  maxCapacity: number;
  currentUnits: number;
  temperatureControl?: boolean;
}

export interface Depot {
  id: string;
  code: string;
  name: string;
  wilaya: string;
  municipality: string;
  address: string;
  googleMapsUrl: string;
  phone: string;
  manager: string;
  status: 'active' | 'urgent' | 'saturated';
  totalCapacityPercent: number;
  lastUpdated: string;
  items: DepotItem[];
  zones: DepotZoneInfo[];
  batches: BatchItem[];
}

export interface ConvoyCargoInput {
  category: AidCategory;
  itemName: string;
  quantity: number;
}
