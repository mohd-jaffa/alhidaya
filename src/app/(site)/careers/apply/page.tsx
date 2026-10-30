import type { Metadata } from "next";

import { getApplyMetadata } from "@/features/careers/api";
import { ApplyPage } from "@/features/careers/components/ApplyPage";

export function generateMetadata(): Promise<Metadata> {
  return getApplyMetadata(null);
}

/** The general application (plan Q7): for no one job. */
export default function GeneralApplication() {
  return <ApplyPage job={null} />;
}
