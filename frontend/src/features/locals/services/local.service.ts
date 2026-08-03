import api from "@/lib/axios";

export interface LocalAssembly {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  meetingTimes?: string | null;
  _count?: {
    members?: number;
  };
}

export interface CreateLocalDto {
  name: string;
  code?: string;
  address?: string;
  meetingTimes?: string;
}

export interface UpdateLocalDto extends Partial<CreateLocalDto> {}

export const LocalService = {
  getAll: async (): Promise<LocalAssembly[]> => {
    const response = await api.get<LocalAssembly[]>("/locals");
    return response.data;
  },

  getById: async (id: string): Promise<LocalAssembly> => {
    const response = await api.get<LocalAssembly>(`/locals/${id}`);
    return response.data;
  },

  create: async (data: CreateLocalDto): Promise<LocalAssembly> => {
    const response = await api.post<LocalAssembly>("/locals", data);
    return response.data;
  },

  update: async (id: string, data: UpdateLocalDto): Promise<LocalAssembly> => {
    const response = await api.patch<LocalAssembly>(`/locals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/locals/${id}`);
  },
};