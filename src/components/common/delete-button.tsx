"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ActionResult } from "@/types/api";

type DeleteButtonProps = {
  onDelete: () => Promise<ActionResult<unknown>>;
  itemLabel: string;
};

/** Admin-only delete with a confirmation dialog (FR-UX-05). */
export function DeleteButton({ onDelete, itemLabel }: DeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const confirm = () => {
    startTransition(async () => {
      const result = await onDelete();
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Hapus ${itemLabel}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <Trash2 className="size-4 text-danger" />
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hapus data?"
        description={`Tindakan ini permanen. Yakin menghapus ${itemLabel}?`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Batal
          </Button>
          <Button variant="danger" onClick={confirm} disabled={pending}>
            {pending ? "Menghapus…" : "Hapus"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
