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

// Generic error type for catch blocks
export type CatchError = Error | ApiError | unknown;