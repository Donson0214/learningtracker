type PaginationOptions = {
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
};

type PaginationInput = {
  page?: unknown;
  pageSize?: unknown;
  limit?: unknown;
};

export type PaginationParams = {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
};

const toNumber = (value: unknown, fallback: number) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export const parsePagination = (
  input: PaginationInput,
  options: PaginationOptions = {}
): PaginationParams => {
  const page = clamp(toNumber(input.page, options.page ?? 1), 1, 1_000_000);
  const pageSizeInput = input.pageSize ?? input.limit;
  const pageSize = clamp(
    toNumber(pageSizeInput, options.pageSize ?? 20),
    1,
    options.maxPageSize ?? 100
  );
  const skip = (page - 1) * pageSize;
  return {
    page,
    pageSize,
    skip,
    take: pageSize,
  };
};

export const buildPaginationResponse = <T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    items,
    page,
    pageSize,
    total,
    totalPages,
  };
};
