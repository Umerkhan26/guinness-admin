import { ApiError, request } from './httpClient';

export interface HistoryDetails {
  qrValue?: string;
  createdBy?: string;
  redeemedBy?: string;
  category?: string;
  [key: string]: any;
}

export interface HistoryRecord {
  _id: string;
  user: string | {
    _id: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  session?: string;
  relatedBusiness?: string | {
    _id: string;
    businessInfo?: {
      businessName?: string;
      businessType?: string;
    };
  };
  actionType: string;
  points: number;
  details: HistoryDetails | string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetHistorySuccessResponse {
  success: true;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: HistoryRecord[];
  };
}

export interface GetHistoryErrorResponse {
  success: false;
  message: string;
}

export type GetHistoryResponse = GetHistorySuccessResponse | GetHistoryErrorResponse;

export interface GetHistoryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  actionType?: string | string[];
  search?: string;
}

export const getHistory = async (
  params: GetHistoryParams = {},
): Promise<GetHistoryResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.search) searchParams.set('search', params.search);
  
  // Handle actionType - can be string or array
  if (params.actionType) {
    if (Array.isArray(params.actionType)) {
      searchParams.set('actionType', params.actionType.join(','));
    } else {
      searchParams.set('actionType', params.actionType);
    }
  }

  const path = searchParams.toString()
    ? `/getAllUserHistory?${searchParams.toString()}`
    : '/getAllUserHistory';

  try {
    return await request<GetHistorySuccessResponse, GetHistoryErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetHistoryErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch history.'
        : 'Unable to fetch history.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface GetHistoryByBusinessIdParams extends GetHistoryParams {
  businessId: string;
}

export const getHistoryByBusinessId = async (
  params: GetHistoryByBusinessIdParams,
): Promise<GetHistoryResponse> => {
  if (!params.businessId) {
    return { success: false, message: 'Business ID is required.' };
  }

  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const path = searchParams.toString()
    ? `/getUserHistoryByBusinessId/${params.businessId}?${searchParams.toString()}`
    : `/getUserHistoryByBusinessId/${params.businessId}`;

  try {
    return await request<GetHistorySuccessResponse, GetHistoryErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetHistoryErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch business history.'
        : 'Unable to fetch business history.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

