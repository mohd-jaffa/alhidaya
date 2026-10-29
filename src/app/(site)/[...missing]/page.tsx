import { notFound } from "next/navigation";

/** Any address the site does not have: the not-found sign, inside the site's frame (plan §6.10). */
export default function Missing() {
  notFound();
}
