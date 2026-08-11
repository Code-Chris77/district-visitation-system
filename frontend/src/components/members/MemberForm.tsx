"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Local,
  LocalService,
} from "@/features/locals/services/local.service";

export interface MemberFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  occupation: string;
  address: string;
  landmark: string;
  localId: string;
}

interface Props {
  loading: boolean;
  onSubmit(data: MemberFormValues): void;
}

export default function MemberForm({
  loading,
  onSubmit,
}: Props) {
  const { register, handleSubmit } =
    useForm<MemberFormValues>();

  const [locals, setLocals] = useState<Local[]>([]);

  useEffect(() => {
    LocalService.getAll().then(setLocals);
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">

        <Input
          placeholder="First Name"
          {...register("firstName")}
        />

        <Input
          placeholder="Last Name"
          {...register("lastName")}
        />

        <Input
          placeholder="Phone"
          {...register("phone")}
        />

        <Input
          placeholder="Gender"
          {...register("gender")}
        />

        <Input
          placeholder="Occupation"
          {...register("occupation")}
        />

        <select
          {...register("localId")}
          className="h-10 rounded-md border px-3"
          defaultValue=""
        >
          <option value="" disabled>
            Select Local
          </option>

          {locals.map((local) => (
            <option
              key={local.id}
              value={local.id}
            >
              {local.name}
            </option>
          ))}
        </select>

      </div>

      <Input
        placeholder="Address"
        {...register("address")}
      />

      <Input
        placeholder="Landmark"
        {...register("landmark")}
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Member"}
      </Button>
    </form>
  );
}