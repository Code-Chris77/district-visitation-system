"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MemberForm, { MemberFormValues } from "./MemberForm";
import { MemberService } from "../services/member.service";
import { Member } from "../types";
import { toast } from "sonner";

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reload: () => Promise<void>;
}

export default function EditMemberDialog({
  member,
  open,
  onOpenChange,
  reload,
}: EditMemberDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: MemberFormValues) => {
    if (!member) return;
    try {
      setLoading(true);

      // Payload matching backend UpdateMemberDto
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      };

      // Map landmark/area input to 'address' field expected by NestJS backend
      if (data.areaLandmark) {
        payload.address = data.areaLandmark;
      }

      if (data.localId) {
        payload.localId = data.localId;
      }

      if (data.latitude !== undefined) {
        payload.latitude = Number(data.latitude);
      }

      if (data.longitude !== undefined) {
        payload.longitude = Number(data.longitude);
      }

      await MemberService.update(member.id, payload);
      toast.success("Member record updated successfully!");
      await reload();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update member:", error?.response?.data || error);
      const apiMessage = error?.response?.data?.message;
      const displayMsg = Array.isArray(apiMessage)
        ? apiMessage.join(", ")
        : apiMessage || "Failed to update member details.";
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b shrink-0">
          <DialogTitle className="text-xl font-bold">Edit Member Record</DialogTitle>
        </DialogHeader>
        {member && (
          <MemberForm
            initialData={{
              firstName: member.firstName,
              lastName: member.lastName,
              phone: member.phone || "",
              localId: member.localId || member.local?.id || "",
              areaLandmark: member.address || member.areaLandmark || "",
              latitude: member.latitude || undefined,
              longitude: member.longitude || undefined,
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