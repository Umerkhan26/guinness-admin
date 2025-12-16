import { ApiError, request } from './httpClient';

export interface RewardRecord {
  _id: string;
  business: string | { _id: string; name: string } | null;
  rewardName: string;
  pointsRequired: number;
  rewardType: string;
  image: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetRewardsSuccessResponse {
  success: true;
  message: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: RewardRecord[];
}

export interface GetRewardsErrorResponse {
  success: false;
  message: string;
}

export type GetRewardsResponse = GetRewardsSuccessResponse | GetRewardsErrorResponse;

export interface GetRewardsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  rewardType?: string;
  isActive?: boolean;
  minPoints?: number;
  maxPoints?: number;
  expiryBefore?: string;
  expiryAfter?: string;
}

export const getRewards = async (
  params: GetRewardsParams = {},
): Promise<GetRewardsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.search) searchParams.set('search', params.search.trim());
  if (params.rewardType) searchParams.set('rewardType', params.rewardType);
  if (params.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
  if (params.minPoints !== undefined) searchParams.set('minPoints', String(params.minPoints));
  if (params.maxPoints !== undefined) searchParams.set('maxPoints', String(params.maxPoints));
  if (params.expiryBefore) searchParams.set('expiryBefore', params.expiryBefore);
  if (params.expiryAfter) searchParams.set('expiryAfter', params.expiryAfter);

  const path = searchParams.toString()
    ? `/getAllRewards?${searchParams.toString()}`
    : '/getAllRewards';

  try {
    return await request<GetRewardsSuccessResponse, GetRewardsErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetRewardsErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch rewards.'
        : 'Unable to fetch rewards.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface CreateRewardRequest {
  rewardName: string;
  business: string;
  pointsRequired: number;
  rewardType: string;
  image: File;
}

export interface CreateRewardSuccessResponse {
  success: true;
  message: string;
  data?: RewardRecord;
}

export interface CreateRewardErrorResponse {
  success: false;
  message: string;
}

export type CreateRewardResponse =
  | CreateRewardSuccessResponse
  | CreateRewardErrorResponse;

export const createReward = async (
  payload: CreateRewardRequest,
): Promise<CreateRewardResponse> => {
  const formData = new FormData();
  formData.append('rewardName', payload.rewardName.trim());
  formData.append('business', payload.business.trim());
  formData.append('pointsRequired', String(payload.pointsRequired));
  formData.append('rewardType', payload.rewardType.trim());
  formData.append('image', payload.image);

  try {
    const response = await request<CreateRewardSuccessResponse, CreateRewardErrorResponse>(
      '/createReward',
      {
        method: 'POST',
        body: formData,
      },
    );
    
    // Check if response has success field and it's false
    if ('success' in response && !response.success) {
      return response as unknown as CreateRewardErrorResponse;
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      // Try to parse the error data
      let errorData: CreateRewardErrorResponse | { message?: string } = { message: 'Unknown error' };
      
      try {
        // If error.data is already an object, use it
        if (typeof error.data === 'object' && error.data !== null) {
          errorData = error.data as CreateRewardErrorResponse | { message?: string };
        } else if (typeof error.data === 'string') {
          // Try to parse if it's a JSON string
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

export interface UpdateRewardRequest {
  rewardName?: string;
  business?: string;
  pointsRequired?: number;
  rewardType?: string;
  image?: File;
  isActive?: boolean;
}

export type UpdateRewardResponse = CreateRewardResponse;

export const updateReward = async (
  rewardId: string,
  payload: UpdateRewardRequest,
): Promise<UpdateRewardResponse> => {
  if (!rewardId) {
    return { success: false, message: 'Reward ID is required for update.' };
  }

  const formData = new FormData();
  
  // Always append required fields
  formData.append('rewardName', (payload.rewardName || '').trim());
  formData.append('business', (payload.business || '').trim());
  formData.append('pointsRequired', String(payload.pointsRequired || 0));
  formData.append('rewardType', (payload.rewardType || '').trim());
  
  // Optional fields
  if (payload.image) {
    formData.append('image', payload.image);
  }
  if (payload.isActive != null) {
    formData.append('isActive', String(payload.isActive));
  }

  try {
    // Make the HTTP request - this will show in network tab
    const response = await request<CreateRewardSuccessResponse, CreateRewardErrorResponse>(
      `/updateReward/${rewardId}`,
      {
        method: 'PUT',
        body: formData,
      },
    );
    
    // Check if response has success field
    if (typeof response === 'object' && response !== null) {
      if ('success' in response) {
        if (response.success) {
          return response as CreateRewardSuccessResponse;
        } else {
          return response as unknown as CreateRewardErrorResponse;
        }
      }
    }
    
    // If response structure is unexpected, return error
    return { success: false, message: 'Unexpected response format from server.' };
  } catch (error) {
    if (error instanceof ApiError) {
      let errorData: CreateRewardErrorResponse | { message?: string } = { message: 'Unknown error' };
      
      try {
        if (typeof error.data === 'object' && error.data !== null) {
          errorData = error.data as CreateRewardErrorResponse | { message?: string };
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

export interface UpdateRewardStatusRequest {
  isActive: boolean;
}

export type UpdateRewardStatusResponse = CreateRewardResponse;

export const updateRewardStatus = async (
  rewardId: string,
  payload: UpdateRewardStatusRequest,
): Promise<UpdateRewardStatusResponse> => {
  if (!rewardId) {
    return { success: false, message: 'Reward ID is required for status update.' };
  }

  try {
    const response = await request<CreateRewardSuccessResponse, CreateRewardErrorResponse>(
      `/updateRewardStatus/${rewardId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
    
    if (typeof response === 'object' && response !== null) {
      if ('success' in response) {
        if (response.success) {
          return response as CreateRewardSuccessResponse;
        } else {
          return response as unknown as CreateRewardErrorResponse;
        }
      }
    }
    
    return { success: false, message: 'Unexpected response format from server.' };
  } catch (error) {
    if (error instanceof ApiError) {
      let errorData: CreateRewardErrorResponse | { message?: string } = { message: 'Unknown error' };
      
      try {
        if (typeof error.data === 'object' && error.data !== null) {
          errorData = error.data as CreateRewardErrorResponse | { message?: string };
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

export interface DeleteRewardResponse {
  success: boolean;
  message: string;
}

export const deleteReward = async (rewardId: string): Promise<DeleteRewardResponse> => {
  if (!rewardId) {
    return { success: false, message: 'Reward ID is required for deletion.' };
  }

  try {
    const response = await request<{ success: true; message: string }, { success: false; message: string }>(
      `/deleteReward/${rewardId}`,
      {
        method: 'DELETE',
      },
    );
    
    if (typeof response === 'object' && response !== null) {
      if ('success' in response) {
        return response as DeleteRewardResponse;
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

