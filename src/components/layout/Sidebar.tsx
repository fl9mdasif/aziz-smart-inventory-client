"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { drawerItems } from "@/utils/drawerItems";
import { UserRole, DrawerItem } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const items = drawerItems(role);

  return (
    <nav
      className={cn(
        "flex h-full flex-col gap-6 overflow-y-auto border-r bg-background p-3 transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between px-1">
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold">Aziz Brothers</p>
            <p className="text-xs text-muted-foreground">Smart Inventory</p>
          </div>
        )}
        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
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
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
                        ? "bg-foreground text-background"
                        : "text-foreground/80 hover:bg-muted",
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
    </nav>
  );
}
