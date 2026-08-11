"use client";

import { Member } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Building2 } from "lucide-react";

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
          {member.firstName.charAt(0)}
          {member.lastName.charAt(0)}
        </div>
        <div>
          <CardTitle className="text-lg">
            {member.firstName} {member.lastName}
          </CardTitle>
          {member.gender && (
            <p className="text-xs text-muted-foreground">{member.gender}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{member.email || "No email provided"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>{member.phone || "No phone provided"}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>{member.local?.name || member.localId || "Unassigned Local"}</span>
        </div>
      </CardContent>
    </Card>
  );
}