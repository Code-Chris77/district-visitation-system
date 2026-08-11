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
import MemberForm, { MemberFormValues } from "@/features/members/components/MemberForm";
import { MemberService } from "@/features/members/services/member.service";
import { toast } from "sonner";

interface AddMemberDialogProps {
  reload: () => Promise<void>;
}

export default function AddMemberDialog({ reload }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: MemberFormValues) => {
    try {
      setLoading(true);

      const payload: {
        firstName: string;
        lastName: string;
        phone: string;
        address?: string;
        localId?: string;
        latitude?: number;
        longitude?: number;
      } = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      if (data.areaLandmark) payload.address = data.areaLandmark;
      if (data.localId) payload.localId = data.localId;
      if (data.latitude !== undefined) payload.latitude = Number(data.latitude);
      if (data.longitude !== undefined) payload.longitude = Number(data.longitude);

      await MemberService.create(payload);
      toast.success("Member registered successfully!");
      await reload();
      setOpen(false);
    } catch (error: unknown) {
        console.error("Failed to add member:", error);
        const apiMessage = (() => {
          if (typeof error === "object" && error !== null) {
            const e = error as Record<string, unknown>;
            const response = e.response;
            if (typeof response === "object" && response !== null) {
              const resp = response as Record<string, unknown>;
              const data = resp.data;
              if (typeof data === "object" && data !== null) {
                const d = data as Record<string, unknown>;
                const message = d.message;
                if (typeof message === "string" || Array.isArray(message)) return message;
              }
            }
            const message = e.message;
            if (typeof message === "string") return message;
          }
          return undefined;
        })();
        const displayMsg = Array.isArray(apiMessage)
          ? apiMessage.join(", ")
          : apiMessage || "Failed to register member.";
        toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus size={16} /> Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b shrink-0">
          <DialogTitle className="text-xl font-bold">Add New Member</DialogTitle>
        </DialogHeader>
        <MemberForm
          onSubmit={handleSubmit}
          loading={loading}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}