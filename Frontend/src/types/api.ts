export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  error?: ApiError | null;
  meta?: Pagination | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
