"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import {
  KontribPanel,
  type KontribItem,
  type Option,
} from "@/features/kegiatan/components/kontrib-panel";
import { canEditKegiatan } from "@/features/kegiatan/access";
import { PrestasiForm } from "./prestasi-form";
import {
  addPrestasiMahasiswa,
  deletePrestasi,
  removePrestasiMahasiswa,
} from "../actions";
import type { PrestasiRow } from "../data";
import type { ListMeta } from "@/types/api";
import type { Prestasi } from "@/types/database.types";

export function PrestasiManager({
  rows,
  meta,
  isAdmin,
  myProdiId,
  mahasiswaOptions,
}: {
  rows: PrestasiRow[];
  meta: ListMeta;
  isAdmin: boolean;
  /** Current user's prodi (null for admin); gates the per-row "Ubah" button. */
  myProdiId: number | null;
  mahasiswaOptions: { nim: number; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Prestasi | null>(null);
  const [creating, setCreating] = useState(false);
  const [managingId, setManagingId] = useState<number | null>(null);

  const mhsOpts: Option[] = mahasiswaOptions.map((m) => ({ value: m.nim, label: m.name }));
  const managingRow = rows.find((r) => r.id === managingId) ?? null;
  const managingItems: KontribItem[] = (managingRow?.mahasiswa ?? []).map((m) => ({
    id: m.id,
    peran: m.peran,
    name: m.nama ?? "-",
  }));

  const columns: Column<PrestasiRow>[] = [
    {
      key: "nama_lomba",
      header: "Nama Lomba",
      sortable: true,
      cell: (r) => r.nama_lomba ?? "-",
    },
    { key: "juara", header: "Juara", sortable: true, cell: (r) => r.juara ?? "-" },
    {
      key: "kontrib",
      header: "Mahasiswa",
      className: "w-28",
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Users className="size-3.5" />
          <span className="tabular">{r.mahasiswa.length}</span>
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-32 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={`Kelola kontributor ${row.nama_lomba ?? "prestasi"}`}
            title="Kelola kontributor"
            onClick={() => setManagingId(row.id)}
          >
            <Users className="size-4" />
          </Button>
          {canEditKegiatan(isAdmin, myProdiId, row.ketua_prodi_id) && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Ubah prestasi"
              title="Ubah data"
              onClick={() => setEditing(row)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {isAdmin && (
            <DeleteButton
              onDelete={() => deletePrestasi(row.id)}
              itemLabel={row.nama_lomba ?? "prestasi"}
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
        searchPlaceholder="Cari lomba / juara…"
        onRowClick={(r) => router.push(`/prestasi/${r.id}`)}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Tambah Prestasi"
        description="Isi data prestasi, lalu tambahkan mahasiswa kontributornya."
      >
        <PrestasiForm
          onDone={() => setCreating(false)}
          onCreated={(id) => setManagingId(id)}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Ubah Prestasi">
        {editing && <PrestasiForm initial={editing} onDone={() => setEditing(null)} />}
      </Modal>

      <Modal
        open={managingId !== null}
        onClose={() => setManagingId(null)}
        title="Kelola Kontributor"
        description={managingRow?.nama_lomba ?? "Tambahkan mahasiswa sebagai kontributor."}
      >
        {managingId !== null && (
          <KontribPanel
            title="Mahasiswa"
            idField="nim_mahasiswa"
            items={managingItems}
            options={mhsOpts}
            isAdmin={isAdmin}
            onAdd={(input) => addPrestasiMahasiswa(managingId, input)}
            onRemove={removePrestasiMahasiswa}
          />
        )}
      </Modal>
    </>
  );
}
