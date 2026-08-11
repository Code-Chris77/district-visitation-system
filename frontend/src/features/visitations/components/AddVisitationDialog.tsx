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
import VisitationForm, { VisitationFormValues } from "./VisitationForm";
import { VisitationService } from "../services/visitation.service";
import { toast } from "sonner";

interface AddVisitationDialogProps {
  reload: () => Promise<void>;
}

export default function AddVisitationDialog({ reload }: AddVisitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: VisitationFormValues) => {
    try {
      setLoading(true);
      await VisitationService.create(data);
      toast.success("Visitation logged successfully!");
      await reload();
      setOpen(false);
    } catch (error) {
      console.error("Failed to log visitation:", error);
      toast.error("Failed to log visitation record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} /> Log New Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Log Pastoral Visitation</DialogTitle>
        </DialogHeader>
        <VisitationForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}