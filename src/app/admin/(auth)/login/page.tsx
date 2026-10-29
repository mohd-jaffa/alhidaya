import type { Metadata } from "next";

import { ADMIN_TEXT } from "@/constants/admin-messages";
import { SignInScreen } from "@/features/auth/components/SignInScreen";
import { adminReturnPath } from "@/lib/auth/next";

export const metadata: Metadata = { title: ADMIN_TEXT.signInTitle };

/** Signing in (plan §26.4), then on to where the admin was headed. */
export default async function SignIn({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  return <SignInScreen next={adminReturnPath((await searchParams).next)} />;
}
