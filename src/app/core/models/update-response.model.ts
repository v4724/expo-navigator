export interface UpdateResponse<T> {
  success: boolean;
  insertedCount: number;
  updatedCount: number;
  errors: string[];
  data: T[];
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
