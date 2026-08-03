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
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";
import { LocalService, LocalAssembly } from "@/features/locals/services/local.service";

const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  localId: z.string().optional(),
  areaLandmark: z.string().optional(),
  householdMembers: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberFormProps {
  initialData?: Partial<MemberFormValues>;
  onSubmit: (data: MemberFormValues) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

export default function MemberForm({
  initialData,
  onSubmit,
  loading = false,
  onCancel,
}: MemberFormProps) {
  const [locals, setLocals] = useState<LocalAssembly[]>([]);
  const [fetchingLocals, setFetchingLocals] = useState(true);
  const [capturingGps, setCapturingGps] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      phone: initialData?.phone || "",
      localId: initialData?.localId || "",
      areaLandmark: initialData?.areaLandmark || "",
      householdMembers: initialData?.householdMembers || "",
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
    },
  });

  const lat = watch("latitude");
  const lng = watch("longitude");

  useEffect(() => {
    async function loadLocals() {
      try {
        const data = await LocalService.getAll();
        setLocals(data);
      } catch (err) {
        console.error("Failed to load assemblies:", err);
      } finally {
        setFetchingLocals(false);
      }
    }
    loadLocals();
  }, []);

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS Geolocation is not supported by your browser.");
      return;
    }
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude);
        setValue("longitude", position.coords.longitude);
        setCapturingGps(false);
        toast.success("Residence GPS coordinates captured!");
      },
      (error) => {
        setCapturingGps(false);
        toast.error("GPS capture failed: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full max-h-[70vh]">
      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" placeholder="Samuel" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" placeholder="Osei" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" placeholder="0240000000" {...register("phone")} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="localId">Select Local Assembly *</Label>
            <Controller
              name="localId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder={fetchingLocals ? "Loading assemblies..." : "Select local assembly"} />
                  </SelectTrigger>
                  <SelectContent>
                    {locals.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="areaLandmark">Area / Landmark (e.g. Near Buoho Taxi Rank)</Label>
          <Input id="areaLandmark" placeholder="Describe landmark to help pastor locate residence" {...register("areaLandmark")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="householdMembers">Household Members (Spouse / Children)</Label>
          <Input id="householdMembers" placeholder="e.g. Wife: Mary, Children: 3" {...register("householdMembers")} />
        </div>

        {/* GPS Capture Widget */}
        <div className="rounded-lg border bg-blue-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
              <MapPin size={15} className="text-blue-600" />
              <span>Residence GPS Coordinates</span>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={captureCurrentLocation}
              disabled={capturingGps}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-2.5 flex items-center gap-1.5"
            >
              <Navigation size={12} /> {capturingGps ? "Capturing..." : "Capture Device GPS"}
            </Button>
          </div>

          {lat && lng ? (
            <p className="text-xs font-mono text-green-700 bg-green-100 p-2 rounded">
              ✓ Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded border border-amber-200">
              ⚠ GPS not captured yet. Click "Capture Device GPS" while standing at residence.
            </p>
          )}
        </div>
      </div>

      {/* Permanently Pinned Footer with Action Buttons */}
      <div className="border-t pt-3 mt-2 flex justify-end gap-3 bg-white shrink-0">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
          {loading ? "Saving..." : "Save Member Information"}
        </Button>
      </div>
    </form>
  );
}