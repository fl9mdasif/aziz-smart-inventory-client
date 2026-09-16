"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/types";
import { SidebarNav } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { removeUser } from "@/services/auth.services";
import { useLogoutMutation } from "@/redux/api/authApi";

export function Header({
  username,
  role,
}: {
  username: string;
  role: UserRole;
}) {
  const router = useRouter();
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

  const initials = username?.slice(0, 2).toUpperCase() || "??";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav role={role} />
        </SheetContent>
      </Sheet>

      <div className="hidden md:block" />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="flex items-center gap-2 px-2" />}
        >
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm sm:inline">{username}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="capitalize">{role}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
