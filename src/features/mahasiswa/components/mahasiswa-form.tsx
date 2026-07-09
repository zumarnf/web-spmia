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
import { z } from "zod";
import { createMahasiswa, updateMahasiswa } from "../actions";
import { mahasiswaSchema, type MahasiswaInput } from "../schemas";
import type { Mahasiswa } from "@/types/database.types";

type MahasiswaOutput = z.output<typeof mahasiswaSchema>;

export function MahasiswaForm({
  initial,
  prodiOptions,
  lockedProdiId = null,
  onDone,
}: {
  initial?: Mahasiswa;
  prodiOptions: { id: number; name: string }[];
  /** When set (non-admin), the prodi is fixed to this id and cannot be changed. */
  lockedProdiId?: number | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const locked = lockedProdiId != null;
  const prodiChoices = locked
    ? prodiOptions.filter((p) => p.id === lockedProdiId)
    : prodiOptions;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<MahasiswaInput, unknown, MahasiswaOutput>({
    resolver: zodResolver(mahasiswaSchema),
    defaultValues: initial
      ? { ...initial }
      : locked
        ? { id_prodi: lockedProdiId }
        : undefined,
  });

  const onSubmit = async (values: MahasiswaOutput) => {
    setPending(true);
    const result = initial
      ? await updateMahasiswa(initial.nim, values)
      : await createMahasiswa(values);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      onDone();
      router.refresh();
    } else {
      if (result.fieldErrors)
        for (const [k, m] of Object.entries(result.fieldErrors))
          setError(k as keyof MahasiswaInput, { message: m?.[0] });
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="nim" label="NIM" error={errors.nim?.message}>
          <Input
            id="nim"
            inputMode="numeric"
            disabled={!!initial}
            aria-invalid={!!errors.nim}
            {...register("nim")}
          />
        </Field>
        <Field id="angkatan" label="Angkatan" error={errors.angkatan?.message}>
          <Input
            id="angkatan"
            inputMode="numeric"
            aria-invalid={!!errors.angkatan}
            {...register("angkatan")}
          />
        </Field>
      </div>
      <Field id="name" label="Nama Lengkap" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field id="id_prodi" label="Program Studi" error={errors.id_prodi?.message}>
        <Select id="id_prodi" aria-invalid={!!errors.id_prodi} {...register("id_prodi")}>
          {!locked && <option value="">Pilih prodi…</option>}
          {prodiChoices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
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
