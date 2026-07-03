"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  DataTable,
  type Column,
  type FilterOption,
} from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import { MahasiswaForm } from "./mahasiswa-form";
import { deleteMahasiswa } from "../actions";
import type { MahasiswaRow } from "../data";
import type { ListMeta } from "@/types/api";
import type { Mahasiswa } from "@/types/database.types";

export function MahasiswaManager({
  rows,
  meta,
  isAdmin,
  prodiOptions,
}: {
  rows: MahasiswaRow[];
  meta: ListMeta;
  isAdmin: boolean;
  prodiOptions: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Mahasiswa | null>(null);
  const [creating, setCreating] = useState(false);

  const filters: FilterOption[] = [
    {
      field: "id_prodi",
      label: "Prodi",
      options: prodiOptions.map((p) => ({ value: String(p.id), label: p.name })),
    },
  ];

  const columns: Column<MahasiswaRow>[] = [
    { key: "nim", header: "NIM", sortable: true, className: "font-mono" },
    { key: "name", header: "Nama", sortable: true },
    { key: "angkatan", header: "Angkatan", sortable: true },
    { key: "prodi", header: "Prodi", cell: (r) => r.prodi?.name ?? "-" },
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
            <DeleteButton
              onDelete={() => deleteMahasiswa(row.nim)}
              itemLabel={row.name}
            />
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
        rowKey={(r) => r.nim}
        searchPlaceholder="Cari nama mahasiswa…"
        filters={filters}
        onRowClick={(r) => router.push(`/mahasiswa/${r.nim}`)}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />
      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah Mahasiswa">
        <MahasiswaForm prodiOptions={prodiOptions} onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Ubah Mahasiswa">
        {editing && (
          <MahasiswaForm
            initial={editing}
            prodiOptions={prodiOptions}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}
