import api from "@/lib/axios";
import { Visitation, CreateVisitationDto, UpdateVisitationDto } from "../types/visitation.types";

export const VisitationService = {
  getAll: async (): Promise<Visitation[]> => {
    const response = await api.get<Visitation[]>("/visitations");
    return response.data;
  },

  getById: async (id: string): Promise<Visitation> => {
    const response = await api.get<Visitation>(`/visitations/${id}`);
    return response.data;
  },

  create: async (data: CreateVisitationDto): Promise<Visitation> => {
    const response = await api.post<Visitation>("/visitations", data);
    return response.data;
  },

  update: async (id: string, data: UpdateVisitationDto): Promise<Visitation> => {
    const response = await api.patch<Visitation>(`/visitations/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/visitations/${id}`);
  },
};