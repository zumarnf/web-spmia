"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Field } from "@/components/common/field";
import { DataTable, type Column } from "@/components/data-table/data-table";
import { updateProfile } from "../actions";
import type { ProfileRow } from "../data";
import type { ListMeta } from "@/types/api";

export function ProfilesManager({
  rows,
  meta,
  prodiOptions,
}: {
  rows: ProfileRow[];
  meta: ListMeta;
  prodiOptions: { id: number; name: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProfileRow | null>(null);
  const [role, setRole] = useState("prodi");
  const [idProdi, setIdProdi] = useState("");
  const [pending, startTransition] = useTransition();

  const openEdit = (row: ProfileRow) => {
    setEditing(row);
    setRole(row.role);
    setIdProdi(row.id_prodi != null ? String(row.id_prodi) : "");
  };

  const submit = () => {
    if (!editing) return;
    startTransition(async () => {
      const result = await updateProfile(editing.id, { role, id_prodi: idProdi });
      if (result.ok) {
        toast.success(result.message);
        setEditing(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  const columns: Column<ProfileRow>[] = [
    { key: "name", header: "Nama", sortable: true },
    { key: "username", header: "Username", sortable: true },
    {
      key: "role",
      header: "Role",
      sortable: true,
      className: "w-24",
      cell: (r) => (
        <Badge variant={r.role === "admin" ? "primary" : "secondary"}>{r.role}</Badge>
      ),
    },
    { key: "prodi", header: "Program Studi", cell: (r) => r.prodi?.name ?? "-" },
    {
      key: "actions",
      header: "",
      className: "w-16 text-right",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Ubah ${row.name}`}
          title="Ubah role / prodi"
          onClick={() => openEdit(row)}
        >
          <Pencil className="size-4" />
        </Button>
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
        searchPlaceholder="Cari nama / username…"
      />
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Ubah Pengguna"
        description={editing?.username}
      >
        <div className="flex flex-col gap-4">
          <Field id="role" label="Role">
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="prodi">prodi</option>
              <option value="admin">admin</option>
            </Select>
          </Field>
          <Field id="id_prodi" label="Program Studi">
            <Select
              id="id_prodi"
              value={idProdi}
              onChange={(e) => setIdProdi(e.target.value)}
            >
              <option value="">— Tanpa prodi —</option>
              {prodiOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(null)} disabled={pending}>
              Batal
            </Button>
            <Button onClick={submit} disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
