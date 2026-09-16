"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { SidebarNav } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    }
  }, [user, router]);

  // Still resolving the token from localStorage — render nothing rather than
  // flashing the dashboard shell before we know whether the user is logged in.
  if (user === undefined || user === null) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <SidebarNav
          role={user.role}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
        />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header username={user.username} role={user.role} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
