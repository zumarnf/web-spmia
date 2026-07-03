"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import { PublikasiForm } from "./publikasi-form";
import { deletePublikasi } from "../actions";
import type { ListMeta } from "@/types/api";
import type { Publikasi } from "@/types/database.types";

export function PublikasiManager({
  rows,
  meta,
  isAdmin,
}: {
  rows: Publikasi[];
  meta: ListMeta;
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState<Publikasi | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: Column<Publikasi>[] = [
    { key: "judul", header: "Judul", sortable: true },
    { key: "tahun", header: "Tahun", sortable: true, className: "w-24" },
    {
      key: "doi",
      header: "DOI",
      cell: (r) => r.doi ?? "-",
    },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Ubah ${row.judul}`}
            onClick={() => setEditing(row)}
          >
            <Pencil className="size-4" />
          </Button>
          {isAdmin && (
            <DeleteButton
              onDelete={() => deletePublikasi(row.id)}
              itemLabel={row.judul}
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
        rowKey={(r) => r.id}
        searchPlaceholder="Cari judul / DOI…"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />
      <Modal open={creating} onClose={() => setCreating(false)} title="Tambah Publikasi">
        <PublikasiForm onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Ubah Publikasi">
        {editing && <PublikasiForm initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
