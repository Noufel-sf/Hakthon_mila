/**
 * ============================================================================
 * Humanitarian Aid & Disaster Relief Platform API Client (Axios)
 * OpenAPI 3.1.0 Contract Integration
 * Server: http://localhost:8081
 * ============================================================================
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
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

/**
 * Configured Axios Instance for the Humanitarian Aid Backend
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor for unified logging and error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn(`[Relief API ${error.response.status}] ${error.config?.url}:`, error.response.data);
    } else if (error.request) {
      console.warn(`[Relief API Network Error] Backend not reachable at ${API_BASE_URL}`);
    } else {
      console.warn('[Relief API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Typed API service mapping all OpenAPI 3.1.0 endpoints
 */
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
      const response: AxiosResponse<PublicDepotResponse[]> = await apiClient.get('/api/v1/public/depots', {
        params: wilaya ? { wilaya } : undefined,
      });
      return response.data;
    },

    /**
     * Get depot public details, needs, and available supplies
     * GET /api/v1/public/depots/{id}
     */
    getDepotDetails: async (id: number | string): Promise<PublicDepotDetailResponse> => {
      const response: AxiosResponse<PublicDepotDetailResponse> = await apiClient.get(`/api/v1/public/depots/${id}`);
      return response.data;
    },

    /**
     * Get critical shortages across all depots
     * GET /api/v1/public/shortages?wilaya={wilaya}
     */
    getShortages: async (wilaya?: string): Promise<PublicShortageDTO[]> => {
      const response: AxiosResponse<PublicShortageDTO[]> = await apiClient.get('/api/v1/public/shortages', {
        params: wilaya ? { wilaya } : undefined,
      });
      return response.data;
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
      const response: AxiosResponse<DepotSummaryResponse[]> = await apiClient.get('/api/v1/depots', {
        params: wilaya ? { wilaya } : undefined,
      });
      return response.data;
    },

    /**
     * Get depot by ID
     * GET /api/v1/depots/{id}
     */
    getById: async (id: number | string): Promise<DepotResponse> => {
      const response: AxiosResponse<DepotResponse> = await apiClient.get(`/api/v1/depots/${id}`);
      return response.data;
    },

    /**
     * Create a new depot
     * POST /api/v1/depots
     */
    create: async (data: CreateDepotRequest): Promise<DepotResponse> => {
      const response: AxiosResponse<DepotResponse> = await apiClient.post('/api/v1/depots', data);
      return response.data;
    },

    /**
     * Update depot details
     * PUT /api/v1/depots/{id}
     */
    update: async (id: number | string, data: UpdateDepotRequest): Promise<DepotResponse> => {
      const response: AxiosResponse<DepotResponse> = await apiClient.put(`/api/v1/depots/${id}`, data);
      return response.data;
    },

    /**
     * Delete depot
     * DELETE /api/v1/depots/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      await apiClient.delete(`/api/v1/depots/${id}`);
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
      const response: AxiosResponse<InventoryResponse[]> = await apiClient.get('/api/v1/inventory', {
        params,
      });
      return response.data;
    },

    /**
     * Get items expiring soon (FIFO)
     * GET /api/v1/inventory/expiring?daysAhead={days}
     */
    getExpiring: async (daysAhead: number = 30): Promise<InventoryResponse[]> => {
      const response: AxiosResponse<InventoryResponse[]> = await apiClient.get('/api/v1/inventory/expiring', {
        params: { daysAhead },
      });
      return response.data;
    },

    /**
     * Get inventory item by ID
     * GET /api/v1/inventory/{id}
     */
    getById: async (id: number | string): Promise<InventoryResponse> => {
      const response: AxiosResponse<InventoryResponse> = await apiClient.get(`/api/v1/inventory/${id}`);
      return response.data;
    },

    /**
     * Add inventory item (Cargo intake)
     * POST /api/v1/inventory
     */
    add: async (data: CreateInventoryRequest): Promise<InventoryResponse> => {
      const response: AxiosResponse<InventoryResponse> = await apiClient.post('/api/v1/inventory', data);
      return response.data;
    },

    /**
     * Update inventory record
     * PUT /api/v1/inventory/{id}
     */
    update: async (id: number | string, data: UpdateInventoryRequest): Promise<InventoryResponse> => {
      const response: AxiosResponse<InventoryResponse> = await apiClient.put(`/api/v1/inventory/${id}`, data);
      return response.data;
    },

    /**
     * Delete inventory item
     * DELETE /api/v1/inventory/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      await apiClient.delete(`/api/v1/inventory/${id}`);
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
      const response: AxiosResponse<NeedResponse[]> = await apiClient.get('/api/v1/needs', {
        params,
      });
      return response.data;
    },

    /**
     * Get aid need by ID
     * GET /api/v1/needs/{id}
     */
    getById: async (id: number | string): Promise<NeedResponse> => {
      const response: AxiosResponse<NeedResponse> = await apiClient.get(`/api/v1/needs/${id}`);
      return response.data;
    },

    /**
     * Create an aid need
     * POST /api/v1/needs
     */
    create: async (data: CreateNeedRequest): Promise<NeedResponse> => {
      const response: AxiosResponse<NeedResponse> = await apiClient.post('/api/v1/needs', data);
      return response.data;
    },

    /**
     * Update an aid need
     * PUT /api/v1/needs/{id}
     */
    update: async (id: number | string, data: UpdateNeedRequest): Promise<NeedResponse> => {
      const response: AxiosResponse<NeedResponse> = await apiClient.put(`/api/v1/needs/${id}`, data);
      return response.data;
    },

    /**
     * Delete an aid need
     * DELETE /api/v1/needs/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      await apiClient.delete(`/api/v1/needs/${id}`);
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
      const response: AxiosResponse<DistributionResponse[]> = await apiClient.get('/api/v1/distributions', {
        params,
      });
      return response.data;
    },

    /**
     * Record an aid distribution
     * POST /api/v1/distributions
     */
    create: async (data: CreateDistributionRequest): Promise<DistributionResponse> => {
      const response: AxiosResponse<DistributionResponse> = await apiClient.post('/api/v1/distributions', data);
      return response.data;
    },

    /**
     * Get distribution by ID
     * GET /api/v1/distributions/{id}
     */
    getById: async (id: number | string): Promise<DistributionResponse> => {
      const response: AxiosResponse<DistributionResponse> = await apiClient.get(`/api/v1/distributions/${id}`);
      return response.data;
    },

    /**
     * Delete distribution record
     * DELETE /api/v1/distributions/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      await apiClient.delete(`/api/v1/distributions/${id}`);
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
      const response: AxiosResponse<FamilyResponse[]> = await apiClient.get('/api/v1/families', {
        params,
      });
      return response.data;
    },

    /**
     * Create family record
     * POST /api/v1/families
     */
    create: async (data: CreateFamilyRequest): Promise<FamilyResponse> => {
      const response: AxiosResponse<FamilyResponse> = await apiClient.post('/api/v1/families', data);
      return response.data;
    },

    /**
     * Get family by ID
     * GET /api/v1/families/{id}
     */
    getById: async (id: number | string): Promise<FamilyResponse> => {
      const response: AxiosResponse<FamilyResponse> = await apiClient.get(`/api/v1/families/${id}`);
      return response.data;
    },

    /**
     * Update family record
     * PUT /api/v1/families/{id}
     */
    update: async (id: number | string, data: UpdateFamilyRequest): Promise<FamilyResponse> => {
      const response: AxiosResponse<FamilyResponse> = await apiClient.put(`/api/v1/families/${id}`, data);
      return response.data;
    },

    /**
     * Delete family record
     * DELETE /api/v1/families/{id}
     */
    delete: async (id: number | string): Promise<void> => {
      await apiClient.delete(`/api/v1/families/${id}`);
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
      const response: AxiosResponse<CityResponse[]> = await apiClient.get('/api/v1/cities', {
        params: query ? { query } : undefined,
      });
      return response.data;
    },
  },

  categories: {
    /**
     * List all aid categories
     * GET /api/v1/categories
     */
    list: async (): Promise<CategoryResponse[]> => {
      const response: AxiosResponse<CategoryResponse[]> = await apiClient.get('/api/v1/categories');
      return response.data;
    },
  },
};

export default api;
