export interface UpdateResponse<T> {
  success: boolean;
  insertedCount: number;
  updatedCount: number;
  errors: [];
  data: T[];
}
