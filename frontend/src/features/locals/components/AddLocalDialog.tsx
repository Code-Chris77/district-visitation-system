"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import LocalForm, { LocalFormValues } from "./LocalForm";
import { LocalService } from "../services/local.service";
import { toast } from "sonner";

interface AddLocalDialogProps {
  reload: () => Promise<void>;
}

export default function AddLocalDialog({ reload }: AddLocalDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: LocalFormValues) => {
    try {
      setLoading(true);
      await LocalService.create(data);
      toast.success("Local Assembly added successfully!");
      await reload();
      setOpen(false);
    } catch (error) {
      console.error("Failed to add local assembly:", error);
      toast.error("Failed to add local assembly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} /> Add Local Assembly
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Local Assembly</DialogTitle>
        </DialogHeader>
        <LocalForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}