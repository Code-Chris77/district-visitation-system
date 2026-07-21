"use client";

import { useEffect, useState } from "react";
import { MemberService } from "../services/member.service";

export function useMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMembers() {
    try {
      const data = await MemberService.getAll();
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  return {
    members,
    loading,
    reload: loadMembers,
  };
}