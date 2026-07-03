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
import { createPrestasi, updatePrestasi } from "../actions";
import { prestasiSchema, type PrestasiInput } from "../schemas";
import type { Prestasi } from "@/types/database.types";

type PrestasiOutput = z.output<typeof prestasiSchema>;

export function PrestasiForm({
  initial,
  onDone,
  onCreated,
}: {
  initial?: Prestasi;
  onDone: () => void;
  onCreated?: (id: number) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrestasiInput, unknown, PrestasiOutput>({
    resolver: zodResolver(prestasiSchema),
    defaultValues: initial
      ? {
          nama_lomba: initial.nama_lomba ?? "",
          juara: initial.juara ?? "",
          url_foto: initial.url_foto ?? "",
          url_sertifikat: initial.url_sertifikat ?? "",
        }
      : undefined,
  });

  const onSubmit = async (values: PrestasiOutput) => {
    setPending(true);
    const result = initial
      ? await updatePrestasi(initial.id, values)
      : await createPrestasi(values);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      if (!initial && result.data) onCreated?.(result.data.id);
      onDone();
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="nama_lomba" label="Nama Lomba" error={errors.nama_lomba?.message}>
          <Input id="nama_lomba" {...register("nama_lomba")} />
        </Field>
        <Field id="juara" label="Juara" error={errors.juara?.message}>
          <Input id="juara" {...register("juara")} />
        </Field>
      </div>
      <Field id="url_foto" label="URL Foto" error={errors.url_foto?.message}>
        <Input id="url_foto" {...register("url_foto")} />
      </Field>
      <Field
        id="url_sertifikat"
        label="URL Sertifikat"
        error={errors.url_sertifikat?.message}
      >
        <Input id="url_sertifikat" {...register("url_sertifikat")} />
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
