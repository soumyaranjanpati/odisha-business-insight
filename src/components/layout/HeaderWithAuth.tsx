import { getProfile, getUser } from "@/lib/auth";
import { Header } from "./Header";
import type { NavAuth } from "./Header";

export async function HeaderWithAuth() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);
  const auth: NavAuth = {
    user: user ? { id: user.id, email: user.email ?? undefined } : null,
    profile: profile
      ? {
          id: profile.id,
          roleName: profile.roleName,
          display_name: profile.display_name ?? null,
        }
      : null,
  };
  return <Header auth={auth} />;
}
