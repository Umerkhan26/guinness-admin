import { ApiError, postJson, request } from './httpClient';

export interface LoginRequest {
  email: string;
  password: string;
}

interface UserProfile {
  id: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  businessInfo?: unknown;
  points?: number;
}

export interface LoginSuccessResponse {
  success: true;
  message: string;
  token: string;
  user: UserProfile;
}

export interface LoginErrorResponse {
  success: false;
  message: string;
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

export const loginAdmin = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  try {
    return await postJson<LoginResponse, LoginRequest>('/login', credentials);
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as LoginErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Login failed.'
        : 'Login failed.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try agawain.' };
  }
};

export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: 'consumer' | 'business' | 'admin';
  email?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BusinessInfo {
  businessName?: string;
  approvedByAdmin?: boolean | null;
  [key: string]: unknown;
}

export interface RawUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  age?: number;
  location?: string;
  status?: 'active' | 'blocked';
  businessInfo?: BusinessInfo | null;
  createdAt?: string;
}

export interface GetUsersSuccessResponse {
  success: true;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: RawUser[];
}

export interface GetUsersErrorResponse {
  success: false;
  message: string;
}

export type GetUsersResponse = GetUsersSuccessResponse | GetUsersErrorResponse;

const buildQueryString = (params: GetUsersParams) => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.role) searchParams.set('role', params.role);
  if (params.email) searchParams.set('email', params.email);
  if (typeof params.search === 'string') {
    searchParams.set('search', params.search);
  }
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  return searchParams.toString();
};

export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
  const queryString = buildQueryString(params);
  const path = queryString ? `/getAllUsers?${queryString}` : '/getAllUsers';

  try {
    return await request<GetUsersSuccessResponse, GetUsersErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetUsersErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch users.'
        : 'Unable to fetch users.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface DeleteUserSuccessResponse {
  success: true;
  message: string;
}

export interface DeleteUserErrorResponse {
  success: false;
  message: string;
}

export type DeleteUserResponse = DeleteUserSuccessResponse | DeleteUserErrorResponse;

export const deleteUserById = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    return await request<DeleteUserSuccessResponse, DeleteUserErrorResponse>(
      `/deleteUserById/${userId}`,
      {
        method: 'DELETE',
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as DeleteUserErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to delete user.'
        : 'Unable to delete user.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface UpdateUserStatusRequest {
  userId: string;
  status: 'active' | 'blocked';
}

export interface UpdateUserStatusSuccessResponse {
  success: true;
  message: string;
  data: {
    id: string;
    status: 'active' | 'blocked';
  };
}

export interface UpdateUserStatusErrorResponse {
  success: false;
  message: string;
}

export type UpdateUserStatusResponse =
  | UpdateUserStatusSuccessResponse
  | UpdateUserStatusErrorResponse;

export const updateUserStatus = async (
  payload: UpdateUserStatusRequest,
): Promise<UpdateUserStatusResponse> => {
  try {
    return await request<UpdateUserStatusSuccessResponse, UpdateUserStatusErrorResponse>(
      '/updateUserStatus',
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
      const data = error.data as UpdateUserStatusErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to update status.'
        : 'Unable to update status.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface PendingBusiness {
  _id: string;
  email?: string;
  phone?: string;
  role?: string;
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    registrationNumber?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    taxId?: string;
    bankAccount?: string;
    approvedByAdmin?: boolean | null;
  } | null;
}

export interface GetPendingBusinessesSuccessResponse {
  success: true;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: PendingBusiness[];
}

export interface GetPendingBusinessesErrorResponse {
  success: false;
  message: string;
}

export type GetPendingBusinessesResponse =
  | GetPendingBusinessesSuccessResponse
  | GetPendingBusinessesErrorResponse;

export interface GetPendingBusinessesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getPendingBusinesses = async (
  params: GetPendingBusinessesParams = {},
): Promise<GetPendingBusinessesResponse> => {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search.trim());
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const path = searchParams.toString()
    ? `/pendingBusinessRequests?${searchParams.toString()}`
    : '/pendingBusinessRequests';

  try {
    return await request<GetPendingBusinessesSuccessResponse, GetPendingBusinessesErrorResponse>(
      path,
      { method: 'GET' },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetPendingBusinessesErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch business requests.'
        : 'Unable to fetch business requests.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface BusinessDecisionSuccessResponse {
  success: true;
  message: string;
}

export interface BusinessDecisionErrorResponse {
  success: false;
  message: string;
}

export type BusinessDecisionResponse =
  | BusinessDecisionSuccessResponse
  | BusinessDecisionErrorResponse;

export const approveBusiness = async (userId: string): Promise<BusinessDecisionResponse> => {
  try {
    return await request<BusinessDecisionSuccessResponse, BusinessDecisionErrorResponse>(
      `/approveBusiness/${userId}`,
      { method: 'POST' },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as BusinessDecisionErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to approve business.'
        : 'Unable to approve business.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export const rejectBusiness = async (userId: string): Promise<BusinessDecisionResponse> => {
  try {
    return await request<BusinessDecisionSuccessResponse, BusinessDecisionErrorResponse>(
      `/rejectBusiness/${userId}`,
      { method: 'POST' },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as BusinessDecisionErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to reject business.'
        : 'Unable to reject business.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface UserDetails {
  _id: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  location?: string;
  role: 'consumer' | 'business' | 'admin';
  points?: number;
  businessInfo?: {
    approvedByAdmin?: boolean;
    businessType?: string;
    ownerName?: string;
    address?: string;
    method?: string;
    stats?: {
      casesSold?: number;
      receiptsUploaded?: number;
      roundsSold?: number;
    };
  };
}

export interface GetUserByIdSuccessResponse {
  success: true;
  data: UserDetails;
}

export interface GetUserByIdErrorResponse {
  success: false;
  message: string;
}

export type GetUserByIdResponse = GetUserByIdSuccessResponse | GetUserByIdErrorResponse;

export const getUserById = async (userId: string): Promise<GetUserByIdResponse> => {
  if (!userId) {
    return { success: false, message: 'User ID is required.' };
  }

  try {
    return await request<GetUserByIdSuccessResponse, GetUserByIdErrorResponse>(
      `/getUserById/${userId}`,
      {
        method: 'GET',
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetUserByIdErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch user details.'
        : 'Unable to fetch user details.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

