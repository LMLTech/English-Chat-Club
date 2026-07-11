// Định dạng chuẩn xác với class ApiResponse<T> của Backend
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

// Định dạng chuẩn xác với class PageResponse<T> của Spring Data JPA
export interface PageResponse<T> {
  totalElements: number;
  totalPages: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}