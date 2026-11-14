"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

/**
 * Goes to another page and says so while the new page is on its way (D204): a button that started the move can stay
 * busy until the page is there, instead of looking idle between the answer and the arrival.
 */
export function useNavigation() {
  const router = useRouter();
  const [navigating, start] = useTransition();
  const replace = useCallback((href: string) => start(() => router.replace(href)), [router]);
  return { replace, navigating };
}
