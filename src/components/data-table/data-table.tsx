"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PER_PAGE_OPTIONS } from "@/config/constants";
import { useDataTableParams } from "@/hooks/useDataTableParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ListMeta } from "@/types/api";

export type Column<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  cell?: (row: T) => ReactNode;
};

export type FilterOption = {
  field: string;
  label: string;
  options: { value: string; label: string }[];
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  meta: ListMeta;
  rowKey: (row: T) => string | number;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onRowClick?: (row: T) => void;
  actions?: ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  meta,
  rowKey,
  searchPlaceholder = "Cari…",
  filters,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const { get, setParams } = useDataTableParams();
  const urlSearch = get("search");
  const [search, setSearch] = useState(urlSearch);
  const debounced = useDebouncedValue(search, 400);

  useEffect(() => {
    if (debounced !== get("search")) setParams({ search: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // Re-sync the input when the URL changes elsewhere (back/forward, reset links).
  // Adjusting state during render (React's recommended pattern) rather than in an
  // effect: it keeps input focus while typing and avoids an extra render pass.
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const currentSort = get("sort");
  const currentOrder = get("order") || "asc";

  const toggleSort = (key: string) => {
    if (currentSort !== key) setParams({ sort: key, order: "asc" });
    else if (currentOrder === "asc") setParams({ sort: key, order: "desc" });
    else setParams({ sort: undefined, order: undefined });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Pencarian"
          />
        </div>
        {filters?.map((f) => (
          <Select
            key={f.field}
            className="w-auto min-w-40"
            aria-label={f.label}
            value={get("field") === f.field ? get("value") : ""}
            onChange={(e) =>
              setParams({
                field: e.target.value ? f.field : undefined,
                value: e.target.value || undefined,
              })
            }
          >
            <option value="">{f.label}: Semua</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        ))}
        <div className="ml-auto flex items-center gap-2">{actions}</div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {col.header}
                    {currentSort === col.key ? (
                      currentOrder === "asc" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )
                    ) : (
                      <ArrowUpDown className="size-3.5 opacity-50" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-12 text-center text-muted"
              >
                Tidak ada data.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell
                      ? col.cell(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <span>
          Total {meta.total} data · Halaman {meta.page} dari {meta.lastPage}
        </span>
        <div className="flex items-center gap-2">
          <Select
            className="h-9 w-auto"
            aria-label="Data per halaman"
            value={String(meta.perPage)}
            onChange={(e) => setParams({ perPage: e.target.value, page: 1 })}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / hal
              </option>
            ))}
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setParams({ page: meta.page - 1 })}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.lastPage}
            onClick={() => setParams({ page: meta.page + 1 })}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    </div>
  );
}
