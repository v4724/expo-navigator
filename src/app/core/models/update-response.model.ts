export interface UpdateResponse<T> {
  success: boolean;
  errors: string[];
  data: T;
}

export interface FetchResponse<T> {
  success: boolean;
  errors: string[];
  data: T;
}

export interface CreateResponse {
  success: boolean;
  errors: string[];
  data: { id: number };
}

export interface Response {
  success: boolean;
  errors: string[];
}
