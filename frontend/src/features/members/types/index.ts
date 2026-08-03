export type MemberStatus = "ACTIVE" | "NEEDS_VISIT" | "FOLLOW_UP";
export type GpsStatus = "CAPTURED" | "PENDING";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  gender?: string | null;
  status?: MemberStatus;
  occupation?: string | null;
  address?: string | null;
  areaLandmark?: string | null; // Landmark near home
  householdMembers?: string | null; // Family / Household details
  latitude?: number | null;
  longitude?: number | null;
  gpsStatus?: GpsStatus;
  localId?: string | null;
  local?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
}

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  gender?: string;
  status?: MemberStatus;
  occupation?: string;
  address?: string;
  areaLandmark?: string;
  householdMembers?: string;
  latitude?: number;
  longitude?: number;
  localId?: string;
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {}