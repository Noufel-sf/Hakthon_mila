/**
 * ============================================================================
 * Humanitarian Aid & Disaster Relief Platform API Types (OpenAPI 3.1.0 Contract)
 * ============================================================================
 */

export type AidCategory = 
  | 'FOOD'
  | 'WATER'
  | 'CLOTHES'
  | 'BLANKETS'
  | 'MATTRESSES'
  | 'FURNITURE'
  | 'APPLIANCES'
  | 'MEDICAL'
  | 'HYGIENE'
  | 'OTHER';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DepotStatus = 'ACTIVE' | 'INACTIVE' | 'AT_CAPACITY' | 'TEMPORARILY_CLOSED';

export type InventoryStatus = 'AVAILABLE' | 'RESERVED' | 'DAMAGED' | 'EXPIRED' | 'DISCARDED';

export type NeedStatus = 'OPEN' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CLOSED';

export type FamilyStatus = 'AFFECTED_DISPLACED' | 'SHELTERED' | 'RETURNED' | 'SUPPORTED' | 'INACTIVE';

// Location and Contact DTOs
export interface LocationDTO {
  wilaya: string;
  commune: string;
  address?: string;
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface ContactInfoDTO {
  managerName?: string;
  phone?: string;
  email?: string;
}

// ==========================================
// 1. PUBLIC PORTAL CONTRACTS
// ==========================================

export interface PublicDepotResponse {
  depotId: number | string;
  depotName: string;
  location: LocationDTO;
  status: DepotStatus;
  activeShortageCount: number;
  hasCriticalNeeds: boolean;
}

export interface PublicNeedItemDTO {
  category: AidCategory;
  itemName: string;
  requestedQuantity: number;
  availableQuantity: number;
  shortage: number;
  unit: string;
  priority: Priority;
}

export interface PublicInventorySummaryDTO {
  category: AidCategory;
  totalQuantity: number;
  unit: string;
  stockLevelStatus?: string;
}

export interface PublicDepotDetailResponse {
  depotId: number | string;
  depotName: string;
  description?: string;
  location: LocationDTO;
  status: DepotStatus;
  needs: PublicNeedItemDTO[];
  availableSupplies: PublicInventorySummaryDTO[];
}

export interface PublicShortageDTO {
  depotId: number | string;
  depotName: string;
  depotLocation: LocationDTO;
  category: AidCategory;
  itemName: string;
  shortageQuantity: number;
  unit: string;
  priority: Priority;
}

// ==========================================
// 2. DEPOT CONTRACTS
// ==========================================

export interface DepotSummaryResponse {
  id: number | string;
  name: string;
  location: LocationDTO;
  status: DepotStatus;
  occupancyPercentage: number;
  activeShortagesCount: number;
}

export interface DepotResponse {
  id: number | string;
  name: string;
  description?: string;
  location: LocationDTO;
  totalCapacity: number;
  currentUsage: number;
  occupancyPercentage: number;
  capacityUnit: string;
  status: DepotStatus;
  contactInfo?: ContactInfoDTO;
  activeNeedsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepotRequest {
  name: string;
  description?: string;
  location: LocationDTO;
  totalCapacity?: number;
  capacityUnit?: string;
  status?: DepotStatus;
  contactInfo?: ContactInfoDTO;
}

export interface UpdateDepotRequest {
  name?: string;
  description?: string;
  location?: LocationDTO;
  totalCapacity?: number;
  currentUsage?: number;
  capacityUnit?: string;
  status?: DepotStatus;
  contactInfo?: ContactInfoDTO;
}

// ==========================================
// 3. INVENTORY & BATCH CONTRACTS
// ==========================================

export interface InventoryResponse {
  id: number | string;
  depotId: number | string;
  depotName?: string;
  googleMapsUrl?: string;
  category: AidCategory;
  itemName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  expirationDate?: string;
  receivedDate?: string;
  daysUntilExpiration?: number;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
  status: InventoryStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryRequest {
  depotId: number | string;
  category: AidCategory;
  itemName: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  expirationDate?: string;
  receivedDate?: string;
  status?: InventoryStatus;
  notes?: string;
}

export interface UpdateInventoryRequest {
  quantity?: number;
  unit?: string;
  status?: InventoryStatus;
  expirationDate?: string;
  batchNumber?: string;
  notes?: string | number;
}

// ==========================================
// 4. AID NEEDS & SHORTAGES CONTRACTS
// ==========================================

export interface NeedResponse {
  id: number | string;
  depotId: number | string;
  depotName?: string;
  category: AidCategory;
  itemName: string;
  requestedQuantity: number;
  currentAvailableQuantity: number;
  shortage: number;
  unit: string;
  priority: Priority;
  status: NeedStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNeedRequest {
  depotId: number | string;
  category: AidCategory;
  itemName: string;
  requestedQuantity: number;
  currentAvailableQuantity?: number;
  unit: string;
  priority: Priority;
  notes?: string;
}

export interface UpdateNeedRequest {
  requestedQuantity?: number;
  currentAvailableQuantity?: number;
  unit?: string;
  priority?: Priority;
  status?: NeedStatus;
  notes?: string | number;
}

// ==========================================
// 5. AID DISTRIBUTIONS CONTRACTS
// ==========================================

export interface DistributionResponse {
  id: number | string;
  familyId: number;
  familyAidId?: string;
  headOfFamilyName?: string;
  depotId: number | string;
  depotName?: string;
  category: AidCategory;
  item: string;
  quantity: number;
  unit: string;
  distributedAt: string;
  notes?: string;
}

export interface CreateDistributionRequest {
  familyId: number;
  depotId: number | string;
  category: AidCategory;
  item: string;
  quantity: number;
  unit: string;
  distributedAt?: string;
  notes?: string;
}

// ==========================================
// 6. FAMILIES CONTRACTS
// ==========================================

export interface FamilyResponse {
  id: number;
  aidId?: string;
  headOfFamilyName: string;
  phone?: string;
  numberOfMembers: number;
  wilaya: string;
  commune: string;
  location: string;
  status: FamilyStatus;
  notes?: string | number;
  totalDistributionsReceived?: number;
  pendingNeedsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFamilyRequest {
  id: number;
  aidId?: string;
  headOfFamilyName: string;
  phone?: string;
  numberOfMembers: number;
  wilaya: string;
  commune: string;
  location: string;
  status?: FamilyStatus;
  notes?: string | number;
  totalDistributionsReceived?: number;
  pendingNeedsCount?: number;
}

export interface UpdateFamilyRequest {
  aidId?: string;
  headOfFamilyName?: string;
  phone?: string;
  numberOfMembers?: number;
  wilaya?: string;
  commune?: string;
  location?: string;
  status?: FamilyStatus;
  notes?: string | number;
  totalDistributionsReceived?: number;
  pendingNeedsCount?: number;
}

// ==========================================
// 7. CITIES & CATEGORIES CONTRACTS
// ==========================================

export interface CityResponse {
  id: number;
  name: string;
  nameArabic?: string;
  wilaya: string;
  wilayaCode?: number;
  postalCode?: number;
  latitude?: number;
  longitude?: number;
  activeDepotsCount?: number;
}

export interface CategoryResponse {
  category: AidCategory;
  label: string;
  description?: string;
  commonUnits: string[];
  requiresExpirationDate: boolean;
}

// ==========================================
// FRONTEND ADAPTIVE TYPES & HELPERS
// ==========================================

export interface DepotItem {
  id: string;
  name: string;
  nameFr?: string;
  category: AidCategory;
  currentStock: number;
  targetNeed: number;
  unit: string;
  priority: Priority;
  status?: NeedStatus;
  notes?: string;
}

export interface BatchItem {
  id: string;
  depotId: string;
  itemId?: string;
  itemName: string;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date YYYY-MM-DD
  receivedDate: string;
  status: 'good' | 'expiring_soon' | 'expired';
  batchNumber?: string;
  notes?: string;
}

export interface Depot {
  id: string;
  code: string;
  name: string;
  description?: string;
  wilaya: string;
  municipality: string;
  address: string;
  googleMapsUrl: string;
  phone: string;
  manager: string;
  status: DepotStatus | 'active' | 'urgent' | 'saturated';
  totalCapacityPercent: number;
  lastUpdated: string;
  location?: LocationDTO;
  contactInfo?: ContactInfoDTO;
  occupancyPercentage?: number;
  items: DepotItem[];
  batches: BatchItem[];
}

export interface ConvoyCargoInput {
  category: AidCategory;
  itemName: string;
  quantity: number;
  unit?: string;
  hasExpiry?: boolean;
  expiryDate?: string;
}
