import {
  LayoutDashboard,
  Tags,
  Package,
  ShoppingCart,
  LineChart,
  AlertTriangle,
  Activity,
  Users,
  Settings,
} from "lucide-react";
import { USER_ROLE } from "@/contains/role";
import type { DrawerItem, UserRole } from "@/types";

// Sidebar structure per PRD §2 — General / Tracking / Management.
// Labels and grouping are deliberate, mirroring the owner's own naming; do not relabel.
export const drawerItems = (role: UserRole): DrawerItem[] => {
  const items: DrawerItem[] = [
    { title: "Dashboard", path: "/dashboard", group: "General", icon: LayoutDashboard },
    { title: "Category", path: "/dashboard/category", group: "General", icon: Tags },
    { title: "Inventory / Product", path: "/dashboard/inventory", group: "General", icon: Package },

    { title: "Order", path: "/dashboard/order", group: "Tracking", icon: ShoppingCart },
    { title: "Sales tracking", path: "/dashboard/sales", group: "Tracking", icon: LineChart },
    { title: "Low Stock Quantity", path: "/dashboard/low-stock", group: "Tracking", icon: AlertTriangle },
    { title: "Inventory Activity", path: "/dashboard/activity", group: "Tracking", icon: Activity },

    { title: "Settings", path: "/dashboard/settings", group: "Management", icon: Settings },
  ];

  // User Management: hidden for staff, visible for admin/superAdmin
  if (role === USER_ROLE.ADMIN || role === USER_ROLE.SUPER_ADMIN) {
    items.push({
      title: "User Management",
      path: "/dashboard/users",
      group: "Management",
      icon: Users,
    });
  }

  return items;
};
