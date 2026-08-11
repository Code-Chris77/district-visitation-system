export type UserRole = "ADMIN" | "PASTOR" | "DECAN";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  locId?: string | null; // Linked LOC for Decans
  locName?: string | null;
}

export interface MemberRecord {
  id: string;
  name: string; // Required by SRD 3.1
  phone: string; // Required by SRD 3.1
  latitude?: number | null; // Required by SRD 3.1
  longitude?: number | null; // Required by SRD 3.1
  locId: string; // Required by SRD 2.3 / 3.2
  locName?: string;
  decanId?: string; // Decan who registered the member
  createdAt?: string;
}

export interface LocAssembly {
  id: string;
  name: string; // e.g., "LOC 01 - Akroma"
  code: string;
  decansCount: number; // Max 3 Decans per SRD 2.3
  membersCount: number;
}