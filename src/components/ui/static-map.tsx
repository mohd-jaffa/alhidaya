import { MAP } from "@/assets/brand/map";
import { UI_TEXT } from "@/constants/messages";

/** Where a place falls on the map, as shares of its width and height; null when it is off the map. */
export function mapPosition(lat: number, lon: number): { x: number; y: number } | null {
  const { north, south, west, east } = MAP.bounds;
  if (lat > north || lat < south || lon < west || lon > east) return null;
  return { x: (lon - west) / (east - west), y: (north - lat) / (north - south) };
}

const percent = (share: number) => `${(share * 100).toFixed(2)}%`;

/** Each road class, from the quietest: drawn at a fixed width on screen whatever the map's size. */
const ROADS = [
  { roads: MAP.roads.lane, className: "stroke-ground", width: 3 },
  { roads: MAP.roads.street, className: "stroke-ground", width: 6 },
  { roads: MAP.roads.main, className: "stroke-rule", width: 12 },
  { roads: MAP.roads.main, className: "stroke-ground", width: 9 },
] as const;

/**
 * The streets around the office (plan §30.6, D34): an authored drawing from
 * OpenStreetMap data, with no map script, tiles or cookies. Asmakh Mall is
 * the landmark; the office is a navy station once its spot is set (D74).
 * Words are laid over the drawing as text, so they stay legible at any size.
 */
export function StaticMap({ pin, office }: { pin: { lat: number; lon: number } | null; office: string }) {
  const at = pin ? mapPosition(pin.lat, pin.lon) : null;
  const { landmark } = MAP;
  return (
    <figure className="grid gap-2">
      <div
        role="img"
        aria-label={at ? UI_TEXT.mapWithOffice(office) : UI_TEXT.mapLabel}
        className="relative aspect-[3/2] overflow-hidden rounded-card bg-mist"
      >
        <svg
          viewBox={`0 0 ${MAP.width} ${MAP.height}`}
          className="absolute inset-0 size-full"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {ROADS.map(({ roads, className, width }, index) => (
            <g key={index} className={className} strokeWidth={width}>
              {roads.map((road, roadIndex) => (
                <path key={roadIndex} d={road} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          ))}
          <path
            d={landmark.outline}
            className="fill-leaf/25 stroke-leaf"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div aria-hidden="true">
          {MAP.labels.map((label) => (
            <span
              key={label.name}
              className="absolute hidden rounded-tag bg-mist/85 px-1 text-small whitespace-nowrap text-ink-2 sm:block"
              style={{
                left: percent(label.x / MAP.width),
                top: percent(label.y / MAP.height),
                transform: `translate(-50%, -50%) rotate(${label.angle}deg)`,
              }}
            >
              {label.name}
            </span>
          ))}
          <span
            className="absolute -translate-x-1/2 -translate-y-1/2 text-small font-semibold text-navy"
            style={{ left: percent(landmark.x / MAP.width), top: percent(landmark.y / MAP.height) }}
          >
            {landmark.name}
          </span>
          {/* Places sit where they are on the ground, so they are placed by left and top in either direction. */}
          {at ? (
            <>
              <span
                className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-forest ring-4 ring-ground shadow-float"
                style={{ left: percent(at.x), top: percent(at.y) }}
              />
              <span
                className="absolute -translate-y-1/2 rounded-pill bg-ground px-3 py-1 text-small font-medium whitespace-nowrap text-navy shadow-float"
                style={{ left: `calc(${percent(at.x)} + 1.125rem)`, top: percent(at.y) }}
              >
                {office}
              </span>
            </>
          ) : null}
        </div>
      </div>
      <figcaption className="text-small text-ink-2">
        <a
          href="https://www.openstreetmap.org/copyright"
          className="underline decoration-transparent underline-offset-4 hover:decoration-current"
        >
          {UI_TEXT.mapAttribution}
        </a>
      </figcaption>
    </figure>
  );
}
