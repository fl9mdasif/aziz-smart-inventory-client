"use client";

import { useEffect, useState } from "react";
import { getUserInfo } from "@/services/auth.services";
import { TJwtPayload } from "@/redux/api/authApi";

/**
 * Decodes the stored JWT client-side. Returns `undefined` until mounted (SSR
 * has no localStorage, so this avoids a hydration mismatch), then the decoded
 * payload or `null` if no one is logged in.
 */
export function useCurrentUser(): TJwtPayload | null | undefined {
  const [user, setUser] = useState<TJwtPayload | null | undefined>(undefined);

  useEffect(() => {
    // Mount-only read of a browser-only API (localStorage) — the recommended
    // escape hatch for this exact case, not the "derive state from props"
    // anti-pattern the set-state-in-effect rule targets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getUserInfo() ?? null);
  }, []);

  return user;
}
