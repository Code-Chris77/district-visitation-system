"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LocalForm, { LocalFormValues } from "./LocalForm";
import { LocalService, LocalAssembly } from "../services/local.service";
import { toast } from "sonner";

interface EditLocalDialogProps {
  local: LocalAssembly | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reload: () => Promise<void>;
}

export default function EditLocalDialog({
  local,
  open,
  onOpenChange,
  reload,
}: EditLocalDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: LocalFormValues) => {
    if (!local) return;
    try {
      setLoading(true);
      await LocalService.update(local.id, data);
      toast.success("Local Assembly updated successfully!");
      await reload();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update local assembly:", error);
      toast.error("Failed to update local assembly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Local Assembly</DialogTitle>
        </DialogHeader>
        {local && (
          <LocalForm
            initialData={{
              name: local.name,
              code: local.code || "",
              address: local.address || "",
              meetingTimes: local.meetingTimes || "",
            }}
            onSubmit={handleSubmit}
            loading={loading}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}