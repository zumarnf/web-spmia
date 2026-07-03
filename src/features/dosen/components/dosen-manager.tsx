"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  DataTable,
  type Column,
  type FilterOption,
} from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import { DosenForm } from "./dosen-form";
import { deleteDosen } from "../actions";
import type { DosenRow } from "../data";
import type { ListMeta } from "@/types/api";
import type { Dosen } from "@/types/database.types";

export function DosenManager({
  rows,
  meta,
  isAdmin,
  prodiOptions,
}: {
  rows: DosenRow[];
  meta: ListMeta;
  isAdmin: boolean;
  prodiOptions: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Dosen | null>(null);
  const [creating, setCreating] = useState(false);

  const filters: FilterOption[] = [
    {
      field: "id_prodi",
      label: "Prodi",
      options: prodiOptions.map((p) => ({ value: String(p.id), label: p.name })),
    },
  ];

  const columns: Column<DosenRow>[] = [
    { key: "nip", header: "NIP", sortable: true, className: "font-mono" },
    {
      key: "name",
      header: "Nama",
      sortable: true,
      cell: (r) => (
        <span>
          {r.gelar_depan ? `${r.gelar_depan} ` : ""}
          {r.name}
          {r.gelar_belakang ? `, ${r.gelar_belakang}` : ""}
        </span>
      ),
    },
    { key: "nidn", header: "NIDN", sortable: true, className: "font-mono" },
    { key: "prodi", header: "Prodi", cell: (r) => r.prodi?.name ?? "-" },
    {
      key: "status",
      header: "Status",
      cell: (r) =>
        r.status ? (
          <Badge variant={r.status === "Aktif" ? "success" : "neutral"}>{r.status}</Badge>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Ubah ${row.name}`}
            onClick={() => setEditing(row)}
          >
            <Pencil className="size-4" />
          </Button>
          {isAdmin && (
            <DeleteButton onDelete={() => deleteDosen(row.nip)} itemLabel={row.name} />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={rows}
        meta={meta}
        columns={columns}
        rowKey={(r) => r.nip}
        searchPlaceholder="Cari nama / NIDN / kode…"
        filters={filters}
        onRowClick={(r) => router.push(`/dosen/${r.nip}`)}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />
      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah Dosen">
        <DosenForm prodiOptions={prodiOptions} onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Ubah Dosen">
        {editing && (
          <DosenForm
            initial={editing}
            prodiOptions={prodiOptions}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}
