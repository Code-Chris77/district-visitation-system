import api from "@/lib/axios";

export const MemberService = {
  async getAll() {
    const res = await api.get("/members");
    return res.data;
  },

  async getOne(id: string) {
    const res = await api.get(`/members/${id}`);
    return res.data;
  },

  async create(data: any) {
    const res = await api.post("/members", data);
    return res.data;
  },

  async update(id: string, data: any) {
    const res = await api.patch(`/members/${id}`, data);
    return res.data;
  },

  async remove(id: string) {
    await api.delete(`/members/${id}`);
  },
};