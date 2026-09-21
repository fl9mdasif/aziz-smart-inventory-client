"use client";

import { useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Camera, KeyRound, Loader2, Pencil } from "lucide-react";
import { useGetMeQuery, useUpdateProfileMutation, useChangePasswordMutation } from "@/redux/api/authApi";
import { compressImage } from "@/services/ImageUploader";
import { authKey } from "@/contains/authKey";
import { getFromLocalStorage } from "@/utils/local-storage";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const { data: me, isLoading: meLoading } = useGetMeQuery();

  return (
    <div>
      <PageHeader title="Settings" description="Your profile and password" />
      <div className="max-w-2xl space-y-6">
        {meLoading ? (
          <Card>
            <CardContent className="space-y-4 p-6">
              <Skeleton className="mx-auto size-20 rounded-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        ) : (
          <PersonalInfoCard
            username={me?.username ?? ""}
            email={me?.email ?? ""}
            contactNumber={me?.contactNumber ?? ""}
            profilePicture={me?.profilePicture}
          />
        )}
        <PasswordSecurityCard />
      </div>
    </div>
  );
}

// ── Avatar (independent instant-save action — the edit icon IS the affordance) ──
function AvatarUpload({ profilePicture, username }: { profilePicture?: string; username: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(profilePicture);
  const [uploading, setUploading] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();
  const initials = username?.slice(0, 2).toUpperCase() || "??";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const compressed = await compressImage(file, 100 * 1024);
      const compressedFile = new File([compressed], `avatar-${Date.now()}.jpg`, { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", compressedFile);

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { Authorization: getFromLocalStorage(authKey) ?? "" },
      });
      if (!uploadRes.data.success) throw new Error("Upload failed");
      const url = uploadRes.data.url as string;

      await updateProfile({ profilePicture: url }).unwrap();
      setPreview(url);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Couldn't update profile picture");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative mx-auto size-20">
      <Avatar className="size-20">
        {preview ? <AvatarImage src={preview} alt={username} /> : null}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Change profile picture"
        className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background transition-transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ── Personal information (read-only display, toggled into an editable form) ──
function PersonalInfoCard({
  username,
  email,
  contactNumber,
  profilePicture,
}: {
  username: string;
  email: string;
  contactNumber: string;
  profilePicture?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username, email, contactNumber });
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const startEdit = () => {
    setForm({ username, email, contactNumber });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form).unwrap();
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't update profile");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Personal Information</CardTitle>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        <AvatarUpload profilePicture={profilePicture} username={username} />

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settings-username">Username</Label>
              <Input
                id="settings-username"
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-contact">Contact number</Label>
              <Input
                id="settings-contact"
                value={form.contactNumber}
                onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <InfoRow label="Username" value={username} />
            <InfoRow label="Email" value={email} />
            <InfoRow label="Contact number" value={contactNumber || "—"} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// ── Password & Security (change-password form lives in a popup dialog) ──
function PasswordSecurityCard() {
  const [open, setOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await changePassword({ oldPassword, newPassword }).unwrap();
      toast.success("Password changed");
      setOpen(false);
    } catch (err) {
      toast.error((err as { data?: string })?.data || "Couldn't change password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Password &amp; Security</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">••••••••••</p>
              </div>
            </div>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              Change password
            </DialogTrigger>
          </div>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                You&apos;ll need your current password to set a new one.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Change password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
