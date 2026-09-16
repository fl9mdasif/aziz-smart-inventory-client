"use client";

import { ReactNode } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { UserRole } from "@/types";

/**
 * UX polish only, not a security boundary — the server enforces the real
 * permission check on every mutating route. This just keeps staff from
 * seeing controls that would 403 anyway.
 */
export function RoleGate({ allow, children }: { allow: UserRole[]; children: ReactNode }) {
  const user = useCurrentUser();
  if (!user || !allow.includes(user.role)) return null;
  return <>{children}</>;
}
