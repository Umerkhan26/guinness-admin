import { ApiError, request } from './httpClient';

export interface ReceiptBusiness {
  _id: string;
  businessInfo?: {
    businessName?: string;
    businessType?: string;
  };
}

export interface ExtractedDataItem {
  name: string;
  quantity: number;
}

export interface ReceiptMeta {
  category?: string;
  extractedData?: ExtractedDataItem[];
  totalAmount?: number;
  caseQuantity?: number;
  imageUrl?: string;
  [key: string]: any;
}

export interface ReceiptRecord {
  _id: string;
  business: string | ReceiptBusiness | null;
  type: string;
  value: string;
  points: number;
  isActive: boolean;
  status: string;
  meta?: ReceiptMeta;
  createdAt: string;
  updatedAt: string;
}

export interface GetReceiptsSuccessResponse {
  success: true;
  data: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    data: ReceiptRecord[];
  };
}

export interface GetReceiptsErrorResponse {
  success: false;
  message: string;
}

export type GetReceiptsResponse = GetReceiptsSuccessResponse | GetReceiptsErrorResponse;

export interface GetReceiptsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  caseType?: string | string[];
}

export const getUploadedReceipts = async (
  params: GetReceiptsParams = {},
): Promise<GetReceiptsResponse> => {
  const searchParams = new URLSearchParams();

  if (params.page != null) searchParams.set('page', String(params.page));
  if (params.limit != null) searchParams.set('limit', String(params.limit));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  
  // Handle caseType filter - can be string or array
  if (params.caseType) {
    if (Array.isArray(params.caseType)) {
      searchParams.set('caseType', params.caseType.join(','));
    } else {
      searchParams.set('caseType', params.caseType);
    }
  }

  const path = searchParams.toString()
    ? `/uploaded-receipts?${searchParams.toString()}`
    : '/uploaded-receipts';

  try {
    return await request<GetReceiptsSuccessResponse, GetReceiptsErrorResponse>(path, {
      method: 'GET',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const data = error.data as GetReceiptsErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to fetch uploaded receipts.'
        : 'Unable to fetch uploaded receipts.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

export interface UpdateReceiptStatusRequest {
  sessionId: string;
  status: 'approved' | 'pending' | 'rejected';
  adminNotes?: string;
}

export interface UpdateReceiptStatusSuccessResponse {
  success: true;
  message: string;
  session?: ReceiptRecord;
}

export interface UpdateReceiptStatusErrorResponse {
  success: false;
  message: string;
}

export type UpdateReceiptStatusResponse = 
  | UpdateReceiptStatusSuccessResponse 
  | UpdateReceiptStatusErrorResponse;

export const updateReceiptStatus = async (
  payload: UpdateReceiptStatusRequest,
): Promise<UpdateReceiptStatusResponse> => {
  if (!payload.sessionId || !payload.status) {
    return { success: false, message: 'Session ID and status are required.' };
  }

  if (!['approved', 'pending', 'rejected'].includes(payload.status)) {
    return { success: false, message: 'Invalid status value.' };
  }

  try {
    return await request<UpdateReceiptStatusSuccessResponse, UpdateReceiptStatusErrorResponse>(
      '/update-receipt-status',
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
      const data = error.data as UpdateReceiptStatusErrorResponse | { message?: string };
      const message = typeof data === 'object' && data && 'message' in data
        ? data.message ?? 'Unable to update receipt status.'
        : 'Unable to update receipt status.';
      return { success: false, message };
    }

    return { success: false, message: 'Unable to reach the server. Please try again.' };
  }
};

