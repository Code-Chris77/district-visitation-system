"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MapPinned,
  Route,
  FileBarChart,
  Settings,
} from "lucide-react";

const items = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Members", href: "/members", icon: Users },
  { title: "Locals", href: "/locals", icon: MapPinned },
  { title: "Visitations", href: "/visitations", icon: Route },
  { title: "Reports", href: "/reports", icon: FileBarChart },
  { title: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="border-b p-6">
        <h2 className="text-2xl font-bold tracking-tight">
          Shepherd
        </h2>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {items.map(({ title, href, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 transition ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Icon size={20} />
              {title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}