import { USER_ROLE } from "@/contains/role";
import type { DrawerItem, UserRole } from "@/types";

// Sidebar structure per PRD §2 — General / Tracking / Management.
// Labels and grouping are deliberate, mirroring the owner's own naming; do not relabel.
export const drawerItems = (role: UserRole): DrawerItem[] => {
  const items: DrawerItem[] = [
    { title: "Dashboard", path: "/dashboard", group: "General" },
    { title: "Category", path: "/dashboard/category", group: "General" },
    { title: "Inventory / Product", path: "/dashboard/inventory", group: "General" },

    { title: "Order", path: "/dashboard/order", group: "Tracking" },
    { title: "Sales tracking", path: "/dashboard/sales", group: "Tracking" },
    { title: "Low Stock Quantity", path: "/dashboard/low-stock", group: "Tracking" },
    { title: "Inventory Activity", path: "/dashboard/activity", group: "Tracking" },

    { title: "Settings", path: "/dashboard/settings", group: "Management" },
  ];

  // User Management: hidden for staff, visible for admin/superAdmin
  if (role === USER_ROLE.ADMIN || role === USER_ROLE.SUPER_ADMIN) {
    items.push({
      title: "User Management",
      path: "/dashboard/users",
      group: "Management",
    });
  }

  return items;
};
