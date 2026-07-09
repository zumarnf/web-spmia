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
import { DOSEN_STATUS } from "@/config/constants";
import { z } from "zod";
import { createDosen, updateDosen } from "../actions";
import { dosenSchema, type DosenInput } from "../schemas";
import type { Dosen } from "@/types/database.types";

type DosenOutput = z.output<typeof dosenSchema>;

type ProdiOption = { id: number; name: string };

export function DosenForm({
  initial,
  prodiOptions,
  lockedProdiId = null,
  onDone,
}: {
  initial?: Dosen;
  prodiOptions: ProdiOption[];
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
  } = useForm<DosenInput, unknown, DosenOutput>({
    resolver: zodResolver(dosenSchema),
    defaultValues: initial
      ? {
          nip: initial.nip,
          nidn: initial.nidn,
          name: initial.name,
          id_prodi: initial.id_prodi,
          status: initial.status ?? "Aktif",
          gelar_depan: initial.gelar_depan ?? "",
          gelar_belakang: initial.gelar_belakang ?? "",
          pendidikan: initial.pendidikan ?? "",
          kode_dosen: initial.kode_dosen ?? "",
        }
      : { status: "Aktif", ...(locked ? { id_prodi: lockedProdiId } : {}) },
  });

  const onSubmit = async (values: DosenOutput) => {
    setPending(true);
    const result = initial
      ? await updateDosen(initial.nip, values)
      : await createDosen(values);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      onDone();
      router.refresh();
    } else {
      if (result.fieldErrors)
        for (const [k, m] of Object.entries(result.fieldErrors))
          setError(k as keyof DosenInput, { message: m?.[0] });
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="nip" label="NIP" error={errors.nip?.message}>
          <Input
            id="nip"
            inputMode="numeric"
            disabled={!!initial}
            aria-invalid={!!errors.nip}
            {...register("nip")}
          />
        </Field>
        <Field id="nidn" label="NIDN" error={errors.nidn?.message}>
          <Input id="nidn" aria-invalid={!!errors.nidn} {...register("nidn")} />
        </Field>
      </div>
      <Field id="name" label="Nama Lengkap" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="gelar_depan" label="Gelar Depan" error={errors.gelar_depan?.message}>
          <Input id="gelar_depan" {...register("gelar_depan")} />
        </Field>
        <Field
          id="gelar_belakang"
          label="Gelar Belakang"
          error={errors.gelar_belakang?.message}
        >
          <Input id="gelar_belakang" {...register("gelar_belakang")} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="id_prodi" label="Program Studi" error={errors.id_prodi?.message}>
          <Select
            id="id_prodi"
            aria-invalid={!!errors.id_prodi}
            {...register("id_prodi")}
          >
            {!locked && <option value="">Pilih prodi…</option>}
            {prodiChoices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="status" label="Status" error={errors.status?.message}>
          <Select id="status" {...register("status")}>
            {DOSEN_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="pendidikan" label="Pendidikan" error={errors.pendidikan?.message}>
          <Input id="pendidikan" {...register("pendidikan")} />
        </Field>
        <Field id="kode_dosen" label="Kode Dosen" error={errors.kode_dosen?.message}>
          <Input id="kode_dosen" {...register("kode_dosen")} />
        </Field>
      </div>
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
