export class ApiError<T = unknown> extends Error {
  status: number;
  data: T;

  constructor(status: number, data: T, message?: string) {
    super(message ?? 'API request failed');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl || typeof envUrl !== 'string') {
    throw new Error('VITE_API_BASE_URL is not defined. Please set it in your environment configuration.');
  }
  return envUrl;
};

const buildUrl = (path: string) => {
  const baseUrl = resolveBaseUrl().replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

const normalizeHeaders = (headers?: HeadersInit, body?: BodyInit | null) => {
  const headerEntries = new Headers(headers);
  headerEntries.set('Accept', 'application/json');

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isFormData && !headerEntries.has('Content-Type')) {
    headerEntries.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = window.localStorage?.getItem('authToken');
    if (token && !headerEntries.has('Authorization')) {
      headerEntries.set('Authorization', `Bearer ${token}`);
    }
  }

  return headerEntries;
};

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
}

export const request = async <TResponse, TError = unknown>(
  path: string,
  { headers, body, ...options }: RequestOptions = {},
): Promise<TResponse> => {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: normalizeHeaders(headers, body ?? null),
    body,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType ? contentType.includes('application/json') : false;
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new ApiError<TError>(response.status, payload as TError, (payload as any)?.message);
  }

  return payload as TResponse;
};

export const postJson = <TResponse, TBody extends object, TError = unknown>(
  path: string,
  body: TBody,
  options?: Omit<RequestOptions, 'body' | 'method'>,
) => {
  return request<TResponse, TError>(path, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

