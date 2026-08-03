"use client";

import { useMemo, useState } from "react";
import { MemberService } from "@/features/members/services/member.service";

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  local?: {
    name?: string;
  } | null;
  localId?: string | null;
}

interface Props {
  members: Member[];
  reload: () => Promise<void>;
}

export default function MemberTable({ members, reload }: Props) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const name = `${member.firstName} ${member.lastName}`.toLowerCase();

      return (
        name.includes(search.toLowerCase()) ||
        (member.phone ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (member.local?.name ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    });
  }, [members, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      setDeletingId(id);
      await MemberService.delete(id);
      await reload();
    } catch (error) {
      console.error("Failed to delete member:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input Bar */}
      <div className="mb-4">
        <input
          className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b bg-gray-50 text-gray-700">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Local Assembly</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No members found.
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50/50">
                  {/* Name + Avatar + Phone */}
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
                        {member.firstName.charAt(0)}
                        {member.lastName.charAt(0)}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {member.phone || "No phone"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="p-3 text-gray-600">{member.email || "—"}</td>

                  {/* Local Assembly */}
                  <td className="p-3 text-gray-600">
                    {member.local?.name || member.localId || "—"}
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(member.id)}
                        disabled={deletingId === member.id}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deletingId === member.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}