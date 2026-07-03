"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/common/field";
import { createProdi, updateProdi } from "../actions";
import { prodiSchema, type ProdiInput } from "../schemas";
import type { Prodi } from "@/types/database.types";

export function ProdiForm({ initial, onDone }: { initial?: Prodi; onDone: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProdiInput>({
    resolver: zodResolver(prodiSchema),
    defaultValues: { name: initial?.name ?? "", kode_prodi: initial?.kode_prodi ?? "" },
  });

  const onSubmit = async (values: ProdiInput) => {
    setPending(true);
    const result = initial
      ? await updateProdi(initial.id, values)
      : await createProdi(values);
    setPending(false);
    if (result.ok) {
      toast.success(result.message);
      onDone();
      router.refresh();
    } else {
      if (result.fieldErrors) {
        for (const [key, msgs] of Object.entries(result.fieldErrors)) {
          setError(key as keyof ProdiInput, { message: msgs?.[0] });
        }
      }
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field id="name" label="Nama Program Studi" error={errors.name?.message}>
        <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
      </Field>
      <Field id="kode_prodi" label="Kode Prodi" error={errors.kode_prodi?.message}>
        <Input
          id="kode_prodi"
          aria-invalid={!!errors.kode_prodi}
          {...register("kode_prodi")}
        />
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
