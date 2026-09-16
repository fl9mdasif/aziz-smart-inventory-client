"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TUser } from "@/types";
import { useGetAllUsersQuery, useDeactivateUserMutation } from "@/redux/api/userApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { CreateStaffDialog } from "@/components/dashboard/CreateStaffDialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function UsersPage() {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const isPrivileged = currentUser?.role === "admin" || currentUser?.role === "superAdmin";

  // Hidden from staff's nav (drawerItems.ts), but the URL is still reachable
  // directly — PRD §2.8 says this entire page is admin/superAdmin only.
  useEffect(() => {
    if (currentUser && !isPrivileged) {
      router.replace("/dashboard");
    }
  }, [currentUser, isPrivileged, router]);

  const { data: userList, isLoading, isError } = useGetAllUsersQuery(undefined, {
    skip: !isPrivileged,
  });
  const [deactivateUser] = useDeactivateUserMutation();

  if (!isPrivileged) return null;

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateUser(id).unwrap();
      toast.success("Account deactivated");
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't deactivate account");
    }
  };

  const columns: DataTableColumn<TUser>[] = [
    { header: "Username", cell: (u) => <span className="font-medium">{u.username}</span> },
    { header: "Email", cell: (u) => u.email },
    { header: "Contact", cell: (u) => u.contactNumber },
    {
      header: "Role",
      cell: (u) => (
        <Badge variant="outline" className="capitalize">
          {u.role}
        </Badge>
      ),
    },
    {
      header: "Active",
      cell: (u) => {
        const isSelf = u._id === currentUser?._id;
        return (
          <Switch
            checked={!u.isBlocked}
            disabled={u.isBlocked || isSelf}
            onCheckedChange={() => !u.isBlocked && handleDeactivate(u._id as string)}
          />
        );
      },
      className: "w-24",
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Staff and admin accounts"
        action={<CreateStaffDialog />}
      />
      <DataTable
        columns={columns}
        data={userList?.items}
        isLoading={isLoading}
        isError={isError}
        rowKey={(u) => u._id as string}
        emptyMessage="No accounts yet."
      />
    </div>
  );
}
