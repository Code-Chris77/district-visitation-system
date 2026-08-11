"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MemberService } from "@/features/members/services/member.service";
import { Member } from "@/features/members/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail, MapPin, Briefcase, Calendar, Navigation, HeartHandshake } from "lucide-react";

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      try {
        const data = await MemberService.getById(id);
        setMember(data);
      } catch (err) {
        console.error("Failed to fetch member details", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadMember();
  }, [id]);

  if (loading) return <DashboardLayout><div className="p-8 text-center text-gray-500">Loading member profile...</div></DashboardLayout>;
  if (!member) return <DashboardLayout><div className="p-8 text-center text-red-500">Member profile not found.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft size={16} /> Back to Directory
        </Button>

        {/* Profile Card Header */}
        <div className="rounded-xl border bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-md">
              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span>{member.gender || "Gender unspecified"}</span> • 
                <span className="font-semibold text-blue-600">{member.local?.name || "Unassigned Assembly"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(member.address || "Kumasi")}`, "_blank")}
              className="flex-1 md:flex-none items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              <Navigation size={16} /> Directions
            </Button>
          </div>
        </div>

        {/* Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-white p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-gray-900 border-b pb-3 text-sm">Personal & Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={16} className="text-gray-400" />
                <span className="font-medium">{member.phone || "No phone on record"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail size={16} className="text-gray-400" />
                <span>{member.email || "No email address"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Briefcase size={16} className="text-gray-400" />
                <span>{member.occupation || "Occupation unspecified"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={16} className="text-gray-400" />
                <span>{member.address || "Address pending GPS capture"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-gray-900 border-b pb-3 text-sm">Pastoral Care & History</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <HeartHandshake size={16} className="text-gray-400" />
                <span>Recent Prayer Requests: <strong className="text-gray-900">Family Peace & Health</strong></span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                <span>Next Follow-up Date: <strong className="text-blue-600">Scheduled for Next Week</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}