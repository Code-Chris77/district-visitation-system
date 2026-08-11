import api from "@/lib/axios";
import { Member, CreateMemberDto, UpdateMemberDto } from "../types";

export const MemberService = {
  getAll: async (): Promise<Member[]> => {
    const response = await api.get<Member[]>("/members");
    return response.data;
  },

  getById: async (id: string): Promise<Member> => {
    const response = await api.get<Member>(`/members/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<Member> => {
    const response = await api.post<Member>("/members", data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<Member> => {
    const response = await api.patch<Member>(`/members/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/members/${id}`);
  },
};