import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h1 className="text-xl font-semibold">
        District Visitation System
      </h1>

      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={16}
          />

          <Input className="pl-9" placeholder="Search..." />
        </div>

        <Bell size={22} />

        <Avatar>
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}