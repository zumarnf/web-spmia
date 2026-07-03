// Shared API/contract shapes (docs/03-SDD §3.4).

export type ListMeta = {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
};

export type ListResult<T> = {
  data: T[];
  meta: ListMeta;
};

export type ListParams = {
  page?: number;
  perPage?: number;
  search?: string;
  field?: string;
  value?: string;
  sort?: string;
  order?: "asc" | "desc";
};

export type ActionResult<T = unknown> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
