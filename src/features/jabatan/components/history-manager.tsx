"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/common/field";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import {
  createHistoryJabatan,
  deleteHistoryJabatan,
  updateHistoryJabatan,
} from "../actions";
import type { HistoryRow } from "../data";
import type { ListMeta } from "@/types/api";

export function HistoryManager({
  rows,
  meta,
  isAdmin,
  dosenOptions,
  jabatanOptions,
}: {
  rows: HistoryRow[];
  meta: ListMeta;
  isAdmin: boolean;
  dosenOptions: { nip: string; name: string }[];
  jabatanOptions: { id: number; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  // Id of the row being edited, or null when creating a new one.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nip, setNip] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [pending, startTransition] = useTransition();

  const openCreate = () => {
    setEditingId(null);
    setNip("");
    setJabatan("");
    setOpen(true);
  };

  const openEdit = (row: HistoryRow) => {
    setEditingId(row.id);
    setNip(row.nip_dosen);
    setJabatan(String(row.id_jabatan));
    setOpen(true);
  };

  const submit = () => {
    startTransition(async () => {
      const input = { nip_dosen: nip, id_jabatan: jabatan };
      const result =
        editingId === null
          ? await createHistoryJabatan(input)
          : await updateHistoryJabatan(editingId, input);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const columns: Column<HistoryRow>[] = [
    { key: "dosen", header: "Dosen", cell: (r) => r.dosen?.name ?? "-" },
    { key: "jabatan", header: "Jabatan", cell: (r) => r.jabatan?.jabatan ?? "-" },
    { key: "sub", header: "Sub Jabatan", cell: (r) => r.jabatan?.sub_jabatan ?? "-" },
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ubah riwayat jabatan"
            title="Ubah"
            onClick={() => openEdit(row)}
          >
            <Pencil className="size-4" />
          </Button>
          {isAdmin && (
            <DeleteButton
              onDelete={() => deleteHistoryJabatan(row.id)}
              itemLabel="riwayat jabatan"
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
        searchPlaceholder="Cari…"
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Tambah Riwayat
          </Button>
        }
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId === null ? "Tambah Riwayat Jabatan" : "Ubah Riwayat Jabatan"}
      >
        <div className="flex flex-col gap-4">
          <Field id="nip_dosen" label="Dosen">
            <Select id="nip_dosen" value={nip} onChange={(e) => setNip(e.target.value)}>
              <option value="">Pilih dosen…</option>
              {dosenOptions.map((d) => (
                <option key={d.nip} value={d.nip}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="id_jabatan" label="Jabatan">
            <Select
              id="id_jabatan"
              value={jabatan}
              onChange={(e) => setJabatan(e.target.value)}
            >
              <option value="">Pilih jabatan…</option>
              {jabatanOptions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Batal
            </Button>
            <Button onClick={submit} disabled={pending || !nip || !jabatan}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
