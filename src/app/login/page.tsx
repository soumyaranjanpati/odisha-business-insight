import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginRedirectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const r = params.redirect ? `?redirect=${encodeURIComponent(params.redirect)}` : "";
  redirect(`/auth/login${r}`);
}
