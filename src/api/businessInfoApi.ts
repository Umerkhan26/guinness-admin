import { ApiError, request } from './httpClient';

export interface SummaryStat {
  label: string;
  value: number;
  _id: string;
}

export interface GrandPrize {
  title: string;
  description: string;
  drawDate: string;
  entryRule: string;
}

export interface EarnPerPurchase {
  productName: string;
  size: string;
  points: number;
  entries: number;
  bonusTip: string;
  _id: string;
}

export interface BusinessInfoRecord {
  _id: string;
  business: string;
  title: string;
  summaryStats: SummaryStat[];
  grandPrize: GrandPrize;
  earnPerPurchase: EarnPerPurchase[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBusinessInfoSuccessResponse {
  success: true;
  message: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: BusinessInfoRecord[];
}

export interface GetBusinessInfoErrorResponse {
  success: false;
  message: string;
}

export type GetBusinessInfoResponse = GetBusinessInfoSuccessResponse | GetBusinessInfoErrorResponse;

export interface GetBusinessInfoParams {
  page?: number;
  limit?: number;
}

export const getBusinessInfo = async (
  params: GetBusinessInfoParams = {},
): Promise<GetBusinessInfoResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));

  const path = searchParams.toString()
    ? `/get-all-business-details?${searchParams.toString()}`
    : '/get-all-business-details';

  try {
    return await request<GetBusinessInfoSuccessResponse, GetBusinessInfoErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetBusinessInfoErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch business info.'
        : 'Unable to fetch business info.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface CreateBusinessInfoRequest {
  business: string;
  title: string;
  summaryStats: Array<{ label: string; value: number }>;
  grandPrize: {
    title: string;
    description: string;
    drawDate: string;
    entryRule: string;
  };
  earnPerPurchase: Array<{
    productName: string;
    size: string;
    points: number;
    entries: number;
    bonusTip: string;
  }>;
  isActive: boolean;
}

export interface CreateBusinessInfoSuccessResponse {
  success: true;
  message: string;
  data?: BusinessInfoRecord;
}

export interface CreateBusinessInfoErrorResponse {
  success: false;
  message: string;
}

export type CreateBusinessInfoResponse =
  | CreateBusinessInfoSuccessResponse
  | CreateBusinessInfoErrorResponse;

export const createBusinessInfo = async (
  payload: CreateBusinessInfoRequest,
): Promise<CreateBusinessInfoResponse> => {
  try {
    const response = await request<
      CreateBusinessInfoSuccessResponse,
      CreateBusinessInfoErrorResponse
    >('/create-business-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if ('success' in response && !response.success) {
      return response as unknown as CreateBusinessInfoErrorResponse;
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      let errorData: CreateBusinessInfoErrorResponse | { message?: string } = {
        message: 'Unknown error',
      };

      try {
        if (typeof error.data === 'object' && error.data !== null) {
          errorData = error.data as CreateBusinessInfoErrorResponse | { message?: string };
        } else if (typeof error.data === 'string') {
          try {
            errorData = JSON.parse(error.data);
          } catch {
            errorData = { message: error.data };
          }
        }
      } catch {
        // Silently handle parse errors
      }

      const message =
        typeof errorData === 'object' && errorData && 'message' in errorData
          ? errorData.message ?? `Server error (${error.status})`
          : `Server error (${error.status})`;
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface DeleteBusinessInfoResponse {
  success: boolean;
  message: string;
}

export const deleteBusinessInfo = async (businessInfoId: string): Promise<DeleteBusinessInfoResponse> => {
  if (!businessInfoId) {
    return { success: false, message: 'Business info ID is required for deletion.' };
  }

  try {
    const response = await request<{ success: true; message: string }, { success: false; message: string }>(
      `/delete-business-details/${businessInfoId}`,
      {
        method: 'DELETE',
      },
    );
    
    if (typeof response === 'object' && response !== null) {
      if ('success' in response) {
        return response as DeleteBusinessInfoResponse;
      }
    }
    
    return { success: false, message: 'Unexpected response format from server.' };
  } catch (error) {
    if (error instanceof ApiError) {
      let errorData: { message?: string } = { message: 'Unknown error' };
      
      try {
        if (typeof error.data === 'object' && error.data !== null) {
          errorData = error.data as { message?: string };
        } else if (typeof error.data === 'string') {
          try {
            errorData = JSON.parse(error.data);
          } catch {
            errorData = { message: error.data };
          }
        }
      } catch {
        // Silently handle parse errors
      }
      
      const message = typeof errorData === 'object' && errorData && 'message' in errorData
        ? errorData.message ?? `Server error (${error.status})`
        : `Server error (${error.status})`;
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface UpdateBusinessInfoRequest {
  business?: string;
  title?: string;
  summaryStats?: Array<{ label: string; value: number }>;
  grandPrize?: {
    title?: string;
    description?: string;
    drawDate?: string;
    entryRule?: string;
  };
  earnPerPurchase?: Array<{
    productName: string;
    size: string;
    points: number;
    entries: number;
    bonusTip: string;
  }>;
  isActive?: boolean;
}

export interface UpdateBusinessInfoSuccessResponse {
  success: true;
  message: string;
  data?: BusinessInfoRecord;
}

export interface UpdateBusinessInfoErrorResponse {
  success: false;
  message: string;
}

export type UpdateBusinessInfoResponse =
  | UpdateBusinessInfoSuccessResponse
  | UpdateBusinessInfoErrorResponse;

export const updateBusinessInfo = async (
  businessInfoId: string,
  payload: UpdateBusinessInfoRequest,
): Promise<UpdateBusinessInfoResponse> => {
  if (!businessInfoId) {
    return { success: false, message: 'Business info ID is required for update.' };
  }

  try {
    const response = await request<
      UpdateBusinessInfoSuccessResponse,
      UpdateBusinessInfoErrorResponse
    >(`/update-business-details/${businessInfoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if ('success' in response && !response.success) {
      return response as unknown as UpdateBusinessInfoErrorResponse;
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      let errorData: UpdateBusinessInfoErrorResponse | { message?: string } = {
        message: 'Unknown error',
      };

      try {
        if (typeof error.data === 'object' && error.data !== null) {
          errorData = error.data as UpdateBusinessInfoErrorResponse | { message?: string };
        } else if (typeof error.data === 'string') {
          try {
            errorData = JSON.parse(error.data);
          } catch {
            errorData = { message: error.data };
          }
        }
      } catch {
        // Silently handle parse errors
      }

      const message =
        typeof errorData === 'object' && errorData && 'message' in errorData
          ? errorData.message ?? `Server error (${error.status})`
          : `Server error (${error.status})`;
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

