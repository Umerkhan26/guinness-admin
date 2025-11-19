import { ApiError, request } from './httpClient';

export interface EarnPoints {
  type: string;
  value: number;
}

export interface BusinessRecord {
  _id: string;
  name: string;
  description?: string;
  earnPoints?: EarnPoints;
  method?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetBusinessesSuccessResponse {
  success: true;
  message: string;
  pagination: BusinessPagination;
  data: BusinessRecord[];
}

export interface GetBusinessesErrorResponse {
  success: false;
  message: string;
}

export type GetBusinessesResponse = GetBusinessesSuccessResponse | GetBusinessesErrorResponse;

export interface GetBusinessesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
  earnPoints: {
    type: string;
    value: number;
  };
  method: string;
  isActive: boolean;
}

export interface CreateBusinessSuccessResponse {
  success: true;
  message: string;
  data?: BusinessRecord;
}

export interface CreateBusinessErrorResponse {
  success: false;
  message: string;
}

export type CreateBusinessResponse =
  | CreateBusinessSuccessResponse
  | CreateBusinessErrorResponse;

export const getBusinesses = async (
  params: GetBusinessesParams = {},
): Promise<GetBusinessesResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search.trim());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const path = searchParams.toString()
    ? `/getAllBusinesses?${searchParams.toString()}`
    : '/getAllBusinesses';

  try {
    return await request<GetBusinessesSuccessResponse, GetBusinessesErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetBusinessesErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch businesses.'
        : 'Unable to fetch businesses.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export const createBusiness = async (
  payload: CreateBusinessRequest,
): Promise<CreateBusinessResponse> => {
  try {
    return await request<CreateBusinessSuccessResponse, CreateBusinessErrorResponse>(
      '/createBusiness',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as CreateBusinessErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to create business.'
        : 'Unable to create business.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
  earnPoints?: {
    type: string;
    value: number;
  };
  method?: string;
  isActive?: boolean;
}

export type UpdateBusinessResponse = CreateBusinessResponse;

export const updateBusiness = async (
  id: string,
  payload: UpdateBusinessRequest,
): Promise<UpdateBusinessResponse> => {
  try {
    return await request<CreateBusinessSuccessResponse, CreateBusinessErrorResponse>(
      `/updateBusiness/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as CreateBusinessErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to update business.'
        : 'Unable to update business.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export const deleteBusiness = async (id: string): Promise<CreateBusinessResponse> => {
  try {
    return await request<CreateBusinessSuccessResponse, CreateBusinessErrorResponse>(
      `/deleteBusiness/${id}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as CreateBusinessErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to delete business.'
        : 'Unable to delete business.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

