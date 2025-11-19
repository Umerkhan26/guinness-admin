import { ApiError, request } from './httpClient';

export interface RedeemUser {
  _id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface RedeemBusiness {
  _id: string;
  name: string;
}

export interface RedeemReward {
  _id: string;
  business: RedeemBusiness;
  rewardName: string;
  pointsRequired: number;
  rewardType: string;
}

export interface RedeemRecord {
  _id: string;
  user: RedeemUser;
  reward: RedeemReward;
  business: string;
  pointsUsed: number;
  status: string;
  redeemCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetRedeemsSuccessResponse {
  success: true;
  message: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: RedeemRecord[];
}

export interface GetRedeemsErrorResponse {
  success: false;
  message: string;
}

export type GetRedeemsResponse = GetRedeemsSuccessResponse | GetRedeemsErrorResponse;

export interface GetRedeemsParams {
  page?: number;
  limit?: number;
}

export const getRedeems = async (
  params: GetRedeemsParams = {},
): Promise<GetRedeemsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));

  const path = searchParams.toString()
    ? `/geAllRedeems?${searchParams.toString()}`
    : '/geAllRedeems';

  try {
    return await request<GetRedeemsSuccessResponse, GetRedeemsErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetRedeemsErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch redeems.'
        : 'Unable to fetch redeems.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface UpdateRedeemStatusRequest {
  redeemId: string;
  status: 'pending' | 'delivered';
}

export interface UpdateRedeemStatusSuccessResponse {
  success: true;
  message: string;
  data?: RedeemRecord;
}

export interface UpdateRedeemStatusErrorResponse {
  success: false;
  message: string;
}

export type UpdateRedeemStatusResponse =
  | UpdateRedeemStatusSuccessResponse
  | UpdateRedeemStatusErrorResponse;

export const updateRedeemStatus = async (
  payload: UpdateRedeemStatusRequest,
): Promise<UpdateRedeemStatusResponse> => {
  if (!payload.redeemId || !payload.status) {
    return { success: false, message: 'Redeem ID and status are required.' };
  }

  if (!['pending', 'delivered'].includes(payload.status)) {
    return { success: false, message: 'Invalid status value.' };
  }

  try {
    return await request<UpdateRedeemStatusSuccessResponse, UpdateRedeemStatusErrorResponse>(
      '/update-status',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redeemId: payload.redeemId,
          status: payload.status,
        }),
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as UpdateRedeemStatusErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? `Server error (${error.status})`
        : `Server error (${error.status})`;
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

