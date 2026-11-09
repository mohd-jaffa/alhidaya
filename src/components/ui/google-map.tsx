import { UI_TEXT } from "@/constants/messages";
import { googleSatelliteEmbed } from "@/lib/contact";

/** Google's own attribution stays visible inside the stable, lazy satellite frame (D179). */
export function GoogleMap({ query, pin }: { query: string; pin: { lat: number; lon: number } | null }) {
  return (
    <div className="relative aspect-[3/2] min-h-map-min w-full min-w-0 overflow-hidden rounded-card bg-mist shadow-map">
      <iframe
        title={UI_TEXT.satelliteMap}
        src={googleSatelliteEmbed(query, pin)}
        width="600"
        height="400"
        className="absolute inset-0 size-full border-0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
