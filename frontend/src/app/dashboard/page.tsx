import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Users,
  CalendarCheck,
  Clock3,
  Building2,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={0}
          icon={Users}
        />

        <StatsCard
          title="Visits Today"
          value={0}
          icon={CalendarCheck}
        />

        <StatsCard
          title="Pending Visits"
          value={0}
          icon={Clock3}
        />

        <StatsCard
          title="Locals"
          value={11}
          icon={Building2}
        />
      </div>
    </DashboardLayout>
  );
}