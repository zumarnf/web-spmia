"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActionResult } from "@/types/api";

export type KontribItem = { id: number; peran: string; name: string };
export type Option = { value: string | number; label: string };

type Props = {
  title: string;
  idField: "nip_dosen" | "nim_mahasiswa";
  items: KontribItem[];
  options: Option[];
  isAdmin: boolean;
  /** True when the kegiatan already has a ketua in ANY panel (dosen or mahasiswa). */
  ketuaTaken?: boolean;
  onAdd: (input: unknown) => Promise<ActionResult<null>>;
  onRemove: (pivotId: number) => Promise<ActionResult<null>>;
};

export function KontribPanel({
  title,
  idField,
  items,
  options,
  isAdmin,
  ketuaTaken = false,
  onAdd,
  onRemove,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState("");
  const [peran, setPeran] = useState("anggota");

  // Lock the "ketua" option when this panel — or the sibling panel — already has one.
  const lockKetua = ketuaTaken || items.some((it) => it.peran === "ketua");

  const add = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await onAdd({ [idField]: selected, peran });
      if (result.ok) {
        toast.success(result.message);
        setSelected("");
        setPeran("anggota");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const remove = (pivotId: number) => {
    startTransition(async () => {
      const result = await onRemove(pivotId);
      if (result.ok) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {items.length === 0 && (
            <li className="rounded-[var(--radius-sm)] border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
              Belum ada kontributor.
            </li>
          )}
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-border bg-surface-2 px-3 py-2.5 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-xs font-semibold uppercase text-muted">
                  {it.name.trim().charAt(0) || "?"}
                </span>
                <span className="min-w-0 break-words font-medium">{it.name}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant={it.peran === "ketua" ? "primary" : "neutral"}>
                  {it.peran}
                </Badge>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label={`Hapus ${it.name}`}
                    disabled={pending}
                    onClick={() => remove(it.id)}
                  >
                    <Trash2 className="size-4 text-danger" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Select
            className="h-9 flex-1 min-w-40"
            aria-label={`Pilih ${title}`}
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Pilih…</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select
            className="h-9 w-32"
            aria-label="Peran"
            value={peran}
            onChange={(e) => setPeran(e.target.value)}
          >
            <option value="anggota">Anggota</option>
            <option value="ketua" disabled={lockKetua}>
              Ketua{lockKetua ? " (sudah ada)" : ""}
            </option>
          </Select>
          <Button size="sm" onClick={add} disabled={pending || !selected}>
            <Plus className="size-4" /> Tambah
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
