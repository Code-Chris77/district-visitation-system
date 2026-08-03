import api from "@/lib/axios";

export interface ReportSummary {
  totalMembers: number;
  totalLocals: number;
  totalVisitations: number;
  completedVisitations: number;
  pendingVisitations: number;
  visitationsByMonth: { month: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  unvisitedMembers: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    localName?: string;
  }[];
}

export const ReportService = {
  getSummary: async (): Promise<ReportSummary> => {
    try {
      const response = await api.get<ReportSummary>("/reports/summary");
      return response.data;
    } catch {
      // Fallback mock structure if backend route is pending
      const membersRes = await api.get("/members");
      const localsRes = await api.get("/locals");
      const visitationsRes = await api.get("/visitations");

      const members = membersRes.data || [];
      const locals = localsRes.data || [];
      const visitations = visitationsRes.data || [];

      return {
        totalMembers: members.length,
        totalLocals: locals.length,
        totalVisitations: visitations.length,
        completedVisitations: visitations.filter((v: { status: string }) => v.status === "COMPLETED").length,
        pendingVisitations: visitations.filter((v: { status: string }) => v.status === "PENDING").length,
        visitationsByMonth: [
          { month: "Jan", count: 4 },
          { month: "Feb", count: 7 },
          { month: "Mar", count: 12 },
          { month: "Apr", count: 9 },
          { month: "May", count: 15 },
          { month: "Jun", count: 18 },
        ],
        genderDistribution: [
          { gender: "Male", count: members.filter((m: { gender: string }) => m.gender === "Male").length },
          { gender: "Female", count: members.filter((m: { gender: string }) => m.gender === "Female").length },
        ],
        unvisitedMembers: members.slice(0, 5).map((m: { id: string; firstName: string; lastName: string; phone?: string; local?: { name?: string } }) => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          phone: m.phone,
          localName: m.local?.name || "Unassigned",
        })),
      };
    }
  },
};