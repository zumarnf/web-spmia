"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/common/field";
import { z } from "zod";
import { createPublikasi, updatePublikasi } from "../actions";
import { publikasiSchema, type PublikasiInput } from "../schemas";
import type { Publikasi } from "@/types/database.types";

type PublikasiOutput = z.output<typeof publikasiSchema>;

export function PublikasiForm({
  initial,
  onDone,
}: {
  initial?: Publikasi;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PublikasiInput, unknown, PublikasiOutput>({
    resolver: zodResolver(publikasiSchema),
    defaultValues: initial
      ? {
          judul: initial.judul,
          tahun: initial.tahun ?? undefined,
          doi: initial.doi ?? "",
          url: initial.url ?? "",
        }
      : undefined,
  });

  const onSubmit = async (values: PublikasiOutput) => {
    setPending(true);
    const result = initial
      ? await updatePublikasi(initial.id, values)
      : await createPublikasi(values);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      onDone();
      router.refresh();
    } else {
      if (result.fieldErrors)
        for (const [k, m] of Object.entries(result.fieldErrors))
          setError(k as keyof PublikasiInput, { message: m?.[0] });
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field id="judul" label="Judul Publikasi" error={errors.judul?.message}>
        <Input id="judul" aria-invalid={!!errors.judul} {...register("judul")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="tahun" label="Tahun" error={errors.tahun?.message}>
          <Input id="tahun" inputMode="numeric" {...register("tahun")} />
        </Field>
        <Field id="doi" label="DOI" error={errors.doi?.message}>
          <Input id="doi" {...register("doi")} />
        </Field>
      </div>
      <Field id="url" label="URL" error={errors.url?.message}>
        <Input id="url" {...register("url")} />
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
