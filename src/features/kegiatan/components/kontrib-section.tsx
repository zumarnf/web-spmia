"use client";
import { KontribPanel, type KontribItem, type Option } from "./kontrib-panel";
import type { ActionResult } from "@/types/api";

export type KontribActions = {
  addDosen: (id: number, input: unknown) => Promise<ActionResult<null>>;
  addMahasiswa: (id: number, input: unknown) => Promise<ActionResult<null>>;
  removeDosen: (pivotId: number) => Promise<ActionResult<null>>;
  removeMahasiswa: (pivotId: number) => Promise<ActionResult<null>>;
};

/**
 * The two contributor panels (dosen + mahasiswa) for a single kegiatan.
 * Shared between the detail page and the inline "kelola kontributor" modal so
 * contributors can be managed without leaving the list.
 */
export function KontribSection({
  kegiatanId,
  dosenItems,
  mahasiswaItems,
  dosenOptions,
  mahasiswaOptions,
  isAdmin,
  actions,
  className,
}: {
  kegiatanId: number;
  dosenItems: KontribItem[];
  mahasiswaItems: KontribItem[];
  dosenOptions: Option[];
  mahasiswaOptions: Option[];
  isAdmin: boolean;
  actions: KontribActions;
  className?: string;
}) {
  // A kegiatan may have only one ketua total, across dosen AND mahasiswa.
  const ketuaTaken =
    dosenItems.some((it) => it.peran === "ketua") ||
    mahasiswaItems.some((it) => it.peran === "ketua");

  return (
    <div className={className ?? "grid grid-cols-1 gap-4 md:grid-cols-2"}>
      <KontribPanel
        title="Kontributor Dosen"
        idField="nip_dosen"
        items={dosenItems}
        options={dosenOptions}
        isAdmin={isAdmin}
        ketuaTaken={ketuaTaken}
        onAdd={(input) => actions.addDosen(kegiatanId, input)}
        onRemove={actions.removeDosen}
      />
      <KontribPanel
        title="Kontributor Mahasiswa"
        idField="nim_mahasiswa"
        items={mahasiswaItems}
        options={mahasiswaOptions}
        isAdmin={isAdmin}
        ketuaTaken={ketuaTaken}
        onAdd={(input) => actions.addMahasiswa(kegiatanId, input)}
        onRemove={actions.removeMahasiswa}
      />
    </div>
  );
}
