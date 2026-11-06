import Image from "next/image";

import care from "@/assets/brand/illustrations/footer-care.webp";

/** The static care illustration; extra tool drawings are omitted under D166. */
export function FooterArtwork() {
  return (
    <div aria-hidden className="footer-art">
      <Image src={care} alt="" unoptimized loading="lazy" className="footer-art-care" />
    </div>
  );
}
