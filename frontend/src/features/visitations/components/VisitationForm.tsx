"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MemberService } from "@/features/members/services/member.service";
import { Member } from "@/features/members/types";

const visitationSchema = z.object({
  memberId: z.string().min(1, "Please select a member"),
  visitorName: z.string().optional(),
  purpose: z.string().min(1, "Purpose of visit is required"),
  notes: z.string().optional(),
  visitDate: z.string().min(1, "Visit date is required"),
  status: z.enum(["COMPLETED", "PENDING", "CANCELLED"]),
  followUpRequired: z.boolean().optional(),
});

export type VisitationFormValues = z.infer<typeof visitationSchema>;

interface VisitationFormProps {
  initialData?: Partial<VisitationFormValues>;
  onSubmit: (data: VisitationFormValues) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export default function VisitationForm({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}: VisitationFormProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [fetchingMembers, setFetchingMembers] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VisitationFormValues>({
    resolver: zodResolver(visitationSchema),
    defaultValues: {
      memberId: initialData?.memberId || "",
      visitorName: initialData?.visitorName || "",
      purpose: initialData?.purpose || "Routine Pastoral Care",
      notes: initialData?.notes || "",
      visitDate: initialData?.visitDate || new Date().toISOString().split("T")[0],
      status: initialData?.status || "COMPLETED",
      followUpRequired: initialData?.followUpRequired || false,
    },
  });

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await MemberService.getAll();
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members:", err);
      } finally {
        setFetchingMembers(false);
      }
    }
    loadMembers();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="memberId">Select Member *</Label>
        <Controller
          name="memberId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder={fetchingMembers ? "Loading members..." : "Select member to visit"} />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} {m.phone ? `(${m.phone})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.memberId && (
          <p className="text-xs text-destructive">{errors.memberId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose of Visit *</Label>
          <Input id="purpose" placeholder="e.g. Sick Bay / Care Visit" {...register("purpose")} />
          {errors.purpose && (
            <p className="text-xs text-destructive">{errors.purpose.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visitorName">Visited By (Pastor / Shepherd)</Label>
          <Input id="visitorName" placeholder="e.g. Pastor John" {...register("visitorName")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="visitDate">Date of Visit *</Label>
          <Input id="visitDate" type="date" {...register("visitDate")} />
          {errors.visitDate && (
            <p className="text-xs text-destructive">{errors.visitDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending Follow-up</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Visitation Notes / Prayer Requests</Label>
        <textarea
          id="notes"
          rows={3}
          className="w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter observation notes, family requests, or prayer needs..."
          {...register("notes")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Logging Visit..." : "Save Visitation"}
        </Button>
      </div>
    </form>
  );
}