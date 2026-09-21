"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { toast } from "sonner";
import { drawerItems } from "@/utils/drawerItems";
import { UserRole, DrawerItem } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { removeUser } from "@/services/auth.services";
import { useLogoutMutation } from "@/redux/api/authApi";

const GROUPS: DrawerItem["group"][] = ["General", "Tracking", "Management"];

export function SidebarNav({
  role,
  collapsed = false,
  onToggleCollapsed,
}: {
  role: UserRole;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = drawerItems(role);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // server logout is best-effort; always clear the client-side token
    }
    removeUser();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <nav
      className={cn(
        "flex h-full flex-col gap-6 overflow-y-auto border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between px-1">
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">Aziz Brothers</p>
            <p className="text-xs text-sidebar-foreground/60">Smart Inventory</p>
          </div>
        )}
        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </Button>
        )}
      </div>

      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group}>
            {!collapsed && (
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/50">
                {group}
              </p>
            )}
            <div className="space-y-0.5">
              {groupItems.map((item) => {
                const isActive =
                  pathname === item.path || pathname?.startsWith(item.path + "/");
                const link = (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                );

                if (!collapsed) return link;

                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger render={<div />}>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-auto border-t border-sidebar-border pt-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger render={<div />}>
              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="flex w-full items-center justify-center rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="size-4 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Log out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Log out</span>
          </button>
        )}
      </div>
    </nav>
  );
}
