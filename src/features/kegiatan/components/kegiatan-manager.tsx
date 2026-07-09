"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  DataTable,
  type Column,
  type FilterOption,
} from "@/components/data-table/data-table";
import { DeleteButton } from "@/components/common/delete-button";
import { KegiatanForm } from "./kegiatan-form";
import { KontribSection, type KontribActions } from "./kontrib-section";
import { canEditKegiatan } from "../access";
import type { KontribItem, Option } from "./kontrib-panel";
import type { KegiatanRow } from "../data";
import type { ActionResult } from "@/types/api";
import type { Penelitian } from "@/types/database.types";

type Props = {
  rows: KegiatanRow[];
  meta: import("@/types/api").ListMeta;
  isAdmin: boolean;
  /** Current user's prodi (null for admin); gates the per-row "Ubah" button. */
  myProdiId: number | null;
  basePath: string;
  dosenOptions: { nip: string; name: string }[];
  mahasiswaOptions: { nim: number; name: string }[];
  kontribActions: KontribActions;
  onCreate: (input: unknown) => Promise<ActionResult<{ id: number }>>;
  onUpdate: (id: number, input: unknown) => Promise<ActionResult<null>>;
  onDelete: (id: number) => Promise<ActionResult<null>>;
};

function ketua(row: KegiatanRow): string {
  return row.ketua_nama ?? "-";
}

function kontribCount(row: KegiatanRow): number {
  return row.dosen.length + row.mahasiswa.length;
}

export function KegiatanManager({
  rows,
  meta,
  isAdmin,
  myProdiId,
  basePath,
  dosenOptions,
  mahasiswaOptions,
  kontribActions,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Penelitian | null>(null);
  const [creating, setCreating] = useState(false);
  // Id of the kegiatan whose contributors are being managed in the modal.
  const [managingId, setManagingId] = useState<number | null>(null);

  const dosenOpts: Option[] = dosenOptions.map((d) => ({ value: d.nip, label: d.name }));
  const mhsOpts: Option[] = mahasiswaOptions.map((m) => ({ value: m.nim, label: m.name }));

  const managingRow = rows.find((r) => r.id === managingId) ?? null;
  const managingDosen: KontribItem[] = (managingRow?.dosen ?? []).map((d) => ({
    id: d.id,
    peran: d.peran,
    name: d.nama ?? "-",
  }));
  const managingMhs: KontribItem[] = (managingRow?.mahasiswa ?? []).map((m) => ({
    id: m.id,
    peran: m.peran,
    name: m.nama ?? "-",
  }));

  const filters: FilterOption[] = [
    {
      field: "sumber_dana",
      label: "Sumber Dana",
      options: [
        { value: "Internal", label: "Internal" },
        { value: "Eksternal", label: "Eksternal" },
      ],
    },
  ];

  const columns: Column<KegiatanRow>[] = [
    { key: "judul", header: "Judul", sortable: true },
    { key: "ketua", header: "Ketua", cell: ketua },
    { key: "tahun", header: "Tahun", sortable: true, className: "w-20" },
    {
      key: "sumber_dana",
      header: "Sumber",
      cell: (r) =>
        r.sumber_dana ? <Badge variant="secondary">{r.sumber_dana}</Badge> : "-",
    },
    {
      key: "kontrib",
      header: "Kontributor",
      className: "w-28",
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Users className="size-3.5" />
          <span className="tabular">{kontribCount(r)}</span>
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
          {canEditKegiatan(isAdmin, myProdiId, row.ketua_prodi_id) && (
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
          )}
          {isAdmin && (
            <DeleteButton onDelete={() => onDelete(row.id)} itemLabel={row.judul} />
          )}
        </div>
      ),
    },
  ];

  // After creating, jump straight into managing contributors for the new record.
  const handleCreate = async (input: unknown) => {
    const result = await onCreate(input);
    if (result.ok && result.data) {
      setCreating(false);
      router.refresh();
      setManagingId(result.data.id);
    }
    return result;
  };

  return (
    <>
      <DataTable
        rows={rows}
        meta={meta}
        columns={columns}
        rowKey={(r) => r.id}
        searchPlaceholder="Cari judul / no SK / bidang…"
        filters={filters}
        onRowClick={(r) => router.push(`${basePath}/${r.id}`)}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" /> Tambah
          </Button>
        }
      />

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Tambah Kegiatan"
        description="Isi data kegiatan, lalu tambahkan kontributornya pada langkah berikutnya."
        className="max-w-2xl"
      >
        <KegiatanForm
          onCreate={handleCreate}
          onUpdate={onUpdate}
          onDone={() => setCreating(false)}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Ubah Kegiatan"
        className="max-w-2xl"
      >
        {editing && (
          <KegiatanForm
            initial={editing}
            onCreate={onCreate}
            onUpdate={onUpdate}
            onDone={() => setEditing(null)}
          />
        )}
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
