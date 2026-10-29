import Image from "next/image";

import colour from "@/assets/brand/logo.svg";
import white from "@/assets/brand/logo-white.svg";
import { UI_TEXT } from "@/constants/messages";

/**
 * The company's logo (plan R2.2): in its colours on light ground, in white on
 * navy. Served as a file, cached once for the whole site, never resized by
 * the server (plan §22.3).
 */
export function Logo({
  variant = "colour",
  priority = false,
  className,
}: {
  variant?: "colour" | "white";
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={variant === "white" ? white : colour}
      alt={UI_TEXT.siteName}
      unoptimized
      priority={priority}
      className={className}
    />
  );
}
