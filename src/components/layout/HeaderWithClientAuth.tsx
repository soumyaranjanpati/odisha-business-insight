"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header, type NavAuth } from "./Header";
import { HeaderSkeleton } from "./HeaderSkeleton";
import type { UserRole } from "@/types";

const EMPTY_AUTH: NavAuth = { user: null, profile: null };

/**
 * Client-side auth for the header so the root layout can stay cacheable.
 * Brief skeleton while session loads; nav updates on login/logout.
 */
export function HeaderWithClientAuth() {
  const [auth, setAuth] = useState<NavAuth>(EMPTY_AUTH);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuth(EMPTY_AUTH);
        setLoading(false);
        return;
      }

      const { data: profileRow } = await supabase
        .from("user_profiles")
        .select("id, role_id, display_name, is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileRow || profileRow.is_active === false) {
        setAuth({ user: { id: user.id, email: user.email ?? undefined }, profile: null });
        setLoading(false);
        return;
      }

      let roleName: UserRole = "public";
      if (profileRow.role_id) {
        const { data: roleRow } = await supabase
          .from("roles")
          .select("name")
          .eq("id", profileRow.role_id)
          .maybeSingle();
        const raw = roleRow?.name ?? "public";
        roleName = raw === "subscriber" ? "public" : (raw as UserRole);
      }

      setAuth({
        user: { id: user.id, email: user.email ?? undefined },
        profile: {
          id: profileRow.id,
          roleName,
          display_name: profileRow.display_name ?? null,
        },
      });
      setLoading(false);
    }

    void loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <HeaderSkeleton />;
  return <Header auth={auth} />;
}
