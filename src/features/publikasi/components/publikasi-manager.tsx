"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import {
  KontribSection,
  type KontribActions,
} from "@/features/kegiatan/components/kontrib-section";
import type { KontribItem, Option } from "@/features/kegiatan/components/kontrib-panel";
import { PublikasiForm } from "./publikasi-form";
import { deletePublikasi } from "../actions";
import type { PublikasiRow } from "../data";
import type { ListMeta } from "@/types/api";
import type { Publikasi } from "@/types/database.types";

function ketua(row: PublikasiRow): string {
  const kd = row.dosen.find((d) => d.peran === "ketua")?.dosen?.name;
  const km = row.mahasiswa.find((m) => m.peran === "ketua")?.mahasiswa?.name;
  return kd ?? km ?? "-";
}

export function PublikasiManager({
  rows,
  meta,
  isAdmin,
  dosenOptions,
  mahasiswaOptions,
  kontribActions,
}: {
  rows: PublikasiRow[];
  meta: ListMeta;
  isAdmin: boolean;
  dosenOptions: { nip: string; name: string }[];
  mahasiswaOptions: { nim: number; name: string }[];
  kontribActions: KontribActions;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Publikasi | null>(null);
  const [creating, setCreating] = useState(false);
  const [managingId, setManagingId] = useState<number | null>(null);

  const dosenOpts: Option[] = dosenOptions.map((d) => ({ value: d.nip, label: d.name }));
  const mhsOpts: Option[] = mahasiswaOptions.map((m) => ({ value: m.nim, label: m.name }));

  const managingRow = rows.find((r) => r.id === managingId) ?? null;
  const managingDosen: KontribItem[] = (managingRow?.dosen ?? []).map((d) => ({
    id: d.id,
    peran: d.peran,
    name: d.dosen?.name ?? "-",
  }));
  const managingMhs: KontribItem[] = (managingRow?.mahasiswa ?? []).map((m) => ({
    id: m.id,
    peran: m.peran,
    name: m.mahasiswa?.name ?? "-",
  }));

  const columns: Column<PublikasiRow>[] = [
    { key: "judul", header: "Judul", sortable: true },
    { key: "ketua", header: "Ketua", cell: ketua },
    { key: "tahun", header: "Tahun", sortable: true, className: "w-20" },
    { key: "doi", header: "DOI", cell: (r) => r.doi ?? "-" },
    {
      key: "kontrib",
      header: "Kontributor",
      className: "w-28",
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Users className="size-3.5" />
          <span className="tabular">{r.dosen.length + r.mahasiswa.length}</span>
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
            aria-label={`Kelola kontributor ${row.judul}`}
            title="Kelola kontributor"
            onClick={() => setManagingId(row.id)}
          >
            <Users className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            aria-label={`Ubah ${row.judul}`}
            title="Ubah data"
            onClick={() => setEditing(row)}
          >
            <Pencil className="size-4" />
          </Button>
          {isAdmin && (
            <DeleteButton onDelete={() => deletePublikasi(row.id)} itemLabel={row.judul} />
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
        onRowClick={(r) => router.push(`/publikasi/${r.id}`)}
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

      <Modal
        open={managingId !== null}
        onClose={() => setManagingId(null)}
        title="Kelola Kontributor"
        description={managingRow?.judul ?? "Tambahkan dosen atau mahasiswa sebagai kontributor."}
        className="max-w-3xl"
      >
        {managingId !== null && (
          <KontribSection
            kegiatanId={managingId}
            dosenItems={managingDosen}
            mahasiswaItems={managingMhs}
            dosenOptions={dosenOpts}
            mahasiswaOptions={mhsOpts}
            isAdmin={isAdmin}
            actions={kontribActions}
            className="grid grid-cols-1 gap-4"
          />
        )}
      </Modal>
    </>
  );
}
