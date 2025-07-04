// API Error types
export interface ApiErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: string[] | string | undefined;
}

export interface ApiError {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
  };
  message?: string;
}
