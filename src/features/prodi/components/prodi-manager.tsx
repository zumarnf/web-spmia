"use client";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import { ProdiForm } from "./prodi-form";
import { deleteProdi } from "../actions";
import type { ListMeta } from "@/types/api";
import type { Prodi } from "@/types/database.types";

export function ProdiManager({
  rows,
  meta,
  isAdmin,
}: {
  rows: Prodi[];
  meta: ListMeta;
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState<Prodi | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: Column<Prodi>[] = [
    { key: "kode_prodi", header: "Kode", sortable: true, className: "font-mono" },
    { key: "name", header: "Nama Program Studi", sortable: true },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Ubah ${row.name}`}
            onClick={() => setEditing(row)}
          >
            <Pencil className="size-4" />
          </Button>
          {isAdmin && (
            <DeleteButton onDelete={() => deleteProdi(row.id)} itemLabel={row.name} />
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
        searchPlaceholder="Cari prodi…"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Tambah Program Studi"
      >
        <ProdiForm onDone={() => setCreating(false)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Ubah Program Studi">
        {editing && <ProdiForm initial={editing} onDone={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
