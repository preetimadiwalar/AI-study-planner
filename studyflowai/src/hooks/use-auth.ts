import { useEffect, useState } from "react";
import type { Session, User as SupaUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

function toAuthUser(u: SupaUser | null | undefined): AuthUser | null {
  if (!u) return null;
  return {
    id: u.id,
    name: (u.user_metadata?.name as string | undefined) ?? u.email?.split("@")[0] ?? "User",
    email: u.email ?? "",
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

/**
 * Auth state hook. Returns:
 *   undefined -> still loading initial session
 *   null      -> not signed in
 *   AuthUser  -> signed in
 */
export function useAuth(): AuthUser | null | undefined {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    // 1. Subscribe FIRST (per Supabase guidance) so we never miss an event.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (!mounted) return;
      setUser(toAuthUser(session?.user));
    });

    // 2. Then read existing session.
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(toAuthUser(data.session?.user));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return user;
}
