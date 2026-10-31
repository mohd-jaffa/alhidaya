import Image from "next/image";

import colour from "@/assets/brand/logo.svg";
import navy from "@/assets/brand/logo-navy.svg";
import white from "@/assets/brand/logo-white.svg";
import { UI_TEXT } from "@/constants/messages";

/**
 * The company's logo (plan R2.2): in its colours on light ground, in white on
 * navy, in navy on the leaf green (the footer, D122). Served as a file, cached
 * once for the whole site, never resized by the server (plan §22.3).
 */
export function Logo({
  variant = "colour",
  priority = false,
  className,
}: {
  variant?: "colour" | "white" | "navy";
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={{ colour, white, navy }[variant]}
      alt={UI_TEXT.siteName}
      unoptimized
      priority={priority}
      className={className}
    />
  );
}
