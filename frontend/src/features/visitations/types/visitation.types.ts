import { Member } from "@/features/members/types";

export type VisitStatus = "COMPLETED" | "PENDING" | "CANCELLED";

export interface Visitation {
  id: string;
  memberId: string;
  member?: Member;
  visitorName?: string | null;
  purpose: string;
  notes?: string | null;
  visitDate: string;
  status: VisitStatus;
  followUpRequired?: boolean;
  followUpDate?: string | null;
  createdAt?: string;
}

export interface CreateVisitationDto {
  memberId: string;
  visitorName?: string;
  purpose: string;
  notes?: string;
  visitDate: string;
  status?: VisitStatus;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface UpdateVisitationDto extends Partial<CreateVisitationDto> {}