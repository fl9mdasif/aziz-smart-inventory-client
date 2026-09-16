"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { useCreateStaffMutation } from "@/redux/api/userApi";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateStaffDialog() {
  const currentUser = useCurrentUser();
  const isSuperAdmin = currentUser?.role === "superAdmin";
  const [open, setOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");

  const [createStaff, { isLoading }] = useCreateStaffMutation();

  const reset = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setContactNumber("");
    setRole("staff");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStaff({ username, email, password, contactNumber, role }).unwrap();
      toast.success("Account created");
      setOpen(false);
      reset();
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't create account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        New Staff
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-username">Username</Label>
            <Input id="staff-username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-email">Email</Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-password">Password</Label>
            <Input
              id="staff-password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-contact">Contact number</Label>
            <Input
              id="staff-contact"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "staff" | "admin")}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                {/* Promoting straight to admin is superAdmin-only, enforced server-side too */}
                <SelectItem value="admin" disabled={!isSuperAdmin}>
                  Admin{!isSuperAdmin ? " (superAdmin only)" : ""}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
