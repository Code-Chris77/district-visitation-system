"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const localSchema = z.object({
  name: z.string().min(1, "Local Assembly name is required"),
  code: z.string().optional(),
  address: z.string().optional(),
  meetingTimes: z.string().optional(),
});

export type LocalFormValues = z.infer<typeof localSchema>;

interface LocalFormProps {
  initialData?: Partial<LocalFormValues>;
  onSubmit: (data: LocalFormValues) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export default function LocalForm({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}: LocalFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocalFormValues>({
    resolver: zodResolver(localSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      address: initialData?.address || "",
      meetingTimes: initialData?.meetingTimes || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="name">Assembly Name *</Label>
        <Input id="name" placeholder="e.g. Wioso Assembly" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Assembly Code / Abbreviation</Label>
        <Input id="code" placeholder="e.g. WA-01" {...register("code")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address / Location</Label>
        <Input id="address" placeholder="e.g. Main High Street, Wioso" {...register("address")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="meetingTimes">Service Meeting Times</Label>
        <Input id="meetingTimes" placeholder="e.g. Sundays 9:00 AM" {...register("meetingTimes")} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Assembly"}
        </Button>
      </div>
    </form>
  );
}