/**
 * ============================================================================
 * Humanitarian Aid & Disaster Relief Platform API Client
 * OpenAPI 3.1.0 Contract Integration
 * Server: http://localhost:8081
 * ============================================================================
 */

import {
  PublicDepotResponse,
  PublicDepotDetailResponse,
  PublicShortageDTO,
  DepotSummaryResponse,
  DepotResponse,
  CreateDepotRequest,
  UpdateDepotRequest,
  InventoryResponse,
  CreateInventoryRequest,
  UpdateInventoryRequest,
  NeedResponse,
  CreateNeedRequest,
  UpdateNeedRequest,
  DistributionResponse,
  CreateDistributionRequest,
  FamilyResponse,
  CreateFamilyRequest,
  UpdateFamilyRequest,
  CityResponse,
  CategoryResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`API error (${res.status} ${res.statusText}): ${errorText}`);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json();
  } catch (err) {
    console.warn(`[Relief API] Request to ${endpoint} failed:`, err);
    throw err;
  }
}

export const api = {
  // ==========================================
  // 1. PUBLIC PORTAL ENDPOINTS
  // ==========================================
  public: {
    /**
     * List all active aid depots for citizens
     * GET /api/v1/public/depots?wilaya={wilaya}
     */
    getDepots: async (wilaya?: string): Promise<PublicDepotResponse[]> => {
      const query = wilaya ? `?wilaya=${encodeURIComponent(wilaya)}` : '';
      return fetcher<PublicDepotResponse[]>(`/api/v1/public/depots${query}`);
    },

    /**
     * Get depot public details, needs, and available supplies
     * GET /api/v1/public/depots/{id}
     */
    getDepotDetails: async (id: number | string): Promise<PublicDepotDetailResponse> => {
      return fetcher<PublicDepotDetailResponse>(`/api/v1/public/depots/${id}`);
    },

    /**
     * Get critical shortages across all depots
     * GET /api/v1/public/shortages?wilaya={wilaya}
     */
    getShortages: async (wilaya?: string): Promise<PublicShortageDTO[]> => {
      const query = wilaya ? `?wilaya=${encodeURIComponent(wilaya)}` : '';
      return fetcher<PublicShortageDTO[]>(`/api/v1/public/shortages${query}`);
    },
  },

  // ==========================================
  // 2. DEPOTS (CRUD)
  // ==========================================
  depots: {
    /**
     * List all depots
     * GET /api/v1/depots?wilaya={wilaya}
     */
    list: async (wilaya?: string): Promise<DepotSummaryResponse[]> => {
      const query = wilaya ? `?wilaya=${encodeURIComponent(wilaya)}` : '';
      return fetcher<DepotSummaryResponse[]>(`/api/v1/depots${query}`);
    },

    /**
     * Get depot by ID
     * GET /api/v1/depots/{id}
     */
    getById: async (id: number | string): Promise<DepotResponse> => {
      return fetcher<DepotResponse>(`/api/v1/depots/${id}`);
    },

    /**
     * Create a new depot
     * POST /api/v1/depots
     */
    create: async (data: CreateDepotRequest): Promise<DepotResponse> => {
      return fetcher<DepotResponse>('/api/v1/depots', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Update depot details
     * PUT /api/v1/depots/{id}
     */
    update: async (id: number | string, data: UpdateDepotRequest): Promise<DepotResponse> => {
      return fetcher<DepotResponse>(`/api/v1/depots/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete depot
     * DELETE /api/v1/depots/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      return fetcher<void>(`/api/v1/depots/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // 3. INVENTORY & EXPIRATION TRACKING
  // ==========================================
  inventory: {
    /**
     * List inventory supplies
     * GET /api/v1/inventory?depotId={id}&category={cat}
     */
    list: async (params?: { depotId?: number | string; category?: string }): Promise<InventoryResponse[]> => {
      const searchParams = new URLSearchParams();
      if (params?.depotId) searchParams.set('depotId', String(params.depotId));
      if (params?.category) searchParams.set('category', params.category);
      const q = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetcher<InventoryResponse[]>(`/api/v1/inventory${q}`);
    },

    /**
     * Get items expiring soon (FIFO)
     * GET /api/v1/inventory/expiring?daysAhead={days}
     */
    getExpiring: async (daysAhead: number = 30): Promise<InventoryResponse[]> => {
      return fetcher<InventoryResponse[]>(`/api/v1/inventory/expiring?daysAhead=${daysAhead}`);
    },

    /**
     * Get inventory item by ID
     * GET /api/v1/inventory/{id}
     */
    getById: async (id: number | string): Promise<InventoryResponse> => {
      return fetcher<InventoryResponse>(`/api/v1/inventory/${id}`);
    },

    /**
     * Add inventory item (Cargo intake)
     * POST /api/v1/inventory
     */
    add: async (data: CreateInventoryRequest): Promise<InventoryResponse> => {
      return fetcher<InventoryResponse>('/api/v1/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Update inventory record
     * PUT /api/v1/inventory/{id}
     */
    update: async (id: number | string, data: UpdateInventoryRequest): Promise<InventoryResponse> => {
      return fetcher<InventoryResponse>(`/api/v1/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete inventory item
     * DELETE /api/v1/inventory/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      return fetcher<void>(`/api/v1/inventory/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // 4. AID NEEDS & SHORTAGES
  // ==========================================
  needs: {
    /**
     * List aid needs
     * GET /api/v1/needs?depotId={id}&priority={priority}
     */
    list: async (params?: { depotId?: number | string; priority?: string }): Promise<NeedResponse[]> => {
      const searchParams = new URLSearchParams();
      if (params?.depotId) searchParams.set('depotId', String(params.depotId));
      if (params?.priority) searchParams.set('priority', params.priority);
      const q = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetcher<NeedResponse[]>(`/api/v1/needs${q}`);
    },

    /**
     * Get aid need by ID
     * GET /api/v1/needs/{id}
     */
    getById: async (id: number | string): Promise<NeedResponse> => {
      return fetcher<NeedResponse>(`/api/v1/needs/${id}`);
    },

    /**
     * Create an aid need
     * POST /api/v1/needs
     */
    create: async (data: CreateNeedRequest): Promise<NeedResponse> => {
      return fetcher<NeedResponse>('/api/v1/needs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Update an aid need
     * PUT /api/v1/needs/{id}
     */
    update: async (id: number | string, data: UpdateNeedRequest): Promise<NeedResponse> => {
      return fetcher<NeedResponse>(`/api/v1/needs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete an aid need
     * DELETE /api/v1/needs/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      return fetcher<void>(`/api/v1/needs/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // 5. AID DISTRIBUTIONS
  // ==========================================
  distributions: {
    /**
     * List distributions
     * GET /api/v1/distributions?familyId={familyId}&depotId={depotId}
     */
    list: async (params?: { familyId?: number; depotId?: number | string }): Promise<DistributionResponse[]> => {
      const searchParams = new URLSearchParams();
      if (params?.familyId) searchParams.set('familyId', String(params.familyId));
      if (params?.depotId) searchParams.set('depotId', String(params.depotId));
      const q = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetcher<DistributionResponse[]>(`/api/v1/distributions${q}`);
    },

    /**
     * Record an aid distribution
     * POST /api/v1/distributions
     */
    create: async (data: CreateDistributionRequest): Promise<DistributionResponse> => {
      return fetcher<DistributionResponse>('/api/v1/distributions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get distribution by ID
     * GET /api/v1/distributions/{id}
     */
    getById: async (id: number | string): Promise<DistributionResponse> => {
      return fetcher<DistributionResponse>(`/api/v1/distributions/${id}`);
    },

    /**
     * Delete distribution record
     * DELETE /api/v1/distributions/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      return fetcher<void>(`/api/v1/distributions/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // 6. FAMILIES
  // ==========================================
  families: {
    /**
     * List all families
     * GET /api/v1/families?wilaya={w}&commune={c}&status={s}
     */
    list: async (params?: { wilaya?: string; commune?: string; status?: string }): Promise<FamilyResponse[]> => {
      const searchParams = new URLSearchParams();
      if (params?.wilaya) searchParams.set('wilaya', params.wilaya);
      if (params?.commune) searchParams.set('commune', params.commune);
      if (params?.status) searchParams.set('status', params.status);
      const q = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetcher<FamilyResponse[]>(`/api/v1/families${q}`);
    },

    /**
     * Create family record
     * POST /api/v1/families
     */
    create: async (data: CreateFamilyRequest): Promise<FamilyResponse> => {
      return fetcher<FamilyResponse>('/api/v1/families', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    /**
     * Get family by ID
     * GET /api/v1/families/{id}
     */
    getById: async (id: number | string): Promise<FamilyResponse> => {
      return fetcher<FamilyResponse>(`/api/v1/families/${id}`);
    },

    /**
     * Update family record
     * PUT /api/v1/families/{id}
     */
    update: async (id: number | string, data: UpdateFamilyRequest): Promise<FamilyResponse> => {
      return fetcher<FamilyResponse>(`/api/v1/families/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    /**
     * Delete family record
     * DELETE /api/v1/families/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      return fetcher<void>(`/api/v1/families/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // ==========================================
  // 7. CITIES & CATEGORIES
  // ==========================================
  cities: {
    /**
     * Search cities and communes
     * GET /api/v1/cities?query={query}
     */
    search: async (query?: string): Promise<CityResponse[]> => {
      const q = query ? `?query=${encodeURIComponent(query)}` : '';
      return fetcher<CityResponse[]>(`/api/v1/cities${q}`);
    },
  },

  categories: {
    /**
     * List all aid categories
     * GET /api/v1/categories
     */
    list: async (): Promise<CategoryResponse[]> => {
      return fetcher<CategoryResponse[]>('/api/v1/categories');
    },
  },
};
