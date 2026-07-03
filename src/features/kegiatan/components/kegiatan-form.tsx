"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/common/field";
import { SUMBER_DANA } from "@/config/constants";
import { z } from "zod";
import { kegiatanSchema, type KegiatanInput } from "../schemas";
import type { ActionResult } from "@/types/api";
import type { Penelitian } from "@/types/database.types";

type KegiatanOutput = z.output<typeof kegiatanSchema>;

type Props = {
  initial?: Penelitian;
  onCreate: (input: unknown) => Promise<ActionResult<{ id: number }>>;
  onUpdate: (id: number, input: unknown) => Promise<ActionResult<null>>;
  onDone: () => void;
};

export function KegiatanForm({ initial, onCreate, onUpdate, onDone }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<KegiatanInput, unknown, KegiatanOutput>({
    resolver: zodResolver(kegiatanSchema),
    defaultValues: initial
      ? {
          judul: initial.judul,
          no_sk: initial.no_sk ?? "",
          no_kontrak: initial.no_kontrak ?? "",
          skema: initial.skema ?? "",
          tahun: initial.tahun ?? undefined,
          bidang: initial.bidang ?? "",
          dana: initial.dana ?? undefined,
          sumber_dana: initial.sumber_dana ?? undefined,
          laporan_akhir: initial.laporan_akhir ?? "",
        }
      : undefined,
  });

  const onSubmit = async (values: KegiatanOutput) => {
    setPending(true);
    const result = initial ? await onUpdate(initial.id, values) : await onCreate(values);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      onDone();
      router.refresh();
    } else {
      if (result.fieldErrors)
        for (const [k, m] of Object.entries(result.fieldErrors))
          setError(k as keyof KegiatanInput, { message: m?.[0] });
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field id="judul" label="Judul" error={errors.judul?.message}>
        <Input id="judul" aria-invalid={!!errors.judul} {...register("judul")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="no_sk" label="No. SK" error={errors.no_sk?.message}>
          <Input id="no_sk" {...register("no_sk")} />
        </Field>
        <Field id="no_kontrak" label="No. Kontrak" error={errors.no_kontrak?.message}>
          <Input id="no_kontrak" {...register("no_kontrak")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="skema" label="Skema" error={errors.skema?.message}>
          <Input id="skema" {...register("skema")} />
        </Field>
        <Field id="bidang" label="Bidang" error={errors.bidang?.message}>
          <Input id="bidang" {...register("bidang")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field id="tahun" label="Tahun" error={errors.tahun?.message}>
          <Input id="tahun" inputMode="numeric" {...register("tahun")} />
        </Field>
        <Field id="dana" label="Dana (Rp)" error={errors.dana?.message}>
          <Input id="dana" inputMode="numeric" {...register("dana")} />
        </Field>
        <Field id="sumber_dana" label="Sumber Dana" error={errors.sumber_dana?.message}>
          <Select id="sumber_dana" {...register("sumber_dana")}>
            <option value="">-</option>
            {SUMBER_DANA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        id="laporan_akhir"
        label="Laporan Akhir (URL)"
        error={errors.laporan_akhir?.message}
      >
        <Input id="laporan_akhir" {...register("laporan_akhir")} />
      </Field>
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
          Batal
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}
