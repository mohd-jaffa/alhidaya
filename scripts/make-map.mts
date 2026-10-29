// Makes the static map of the streets around the office (plan §30.6, D34):
//
//   npx tsx scripts/make-map.mts
//
// Reads the streets and Asmakh Mall from OpenStreetMap (Overpass API) and
// writes src/assets/brand/map.ts: the roads as SVG paths on a 900 × 600 m
// frame centred on the mall, the mall's outline, and where the busiest named
// roads are labelled. No map script, tiles or cookies reach the visitor.
// OpenStreetMap data is © OpenStreetMap contributors, under the ODbL: the
// page credits it beside the map.
import { writeFileSync } from "node:fs";

const OVERPASS = "https://overpass-api.de/api/interpreter";
const MALL = { lat: 25.2826741, lon: 51.4959155, way: 158426146 };

/** The frame: 900 m across and 600 m down, 3:2, undistorted at this latitude. */
const WIDTH = 900;
const HEIGHT = 600;
const METRES_PER_DEGREE_LAT = 110_750;
const METRES_PER_DEGREE_LON = 111_320 * Math.cos((MALL.lat * Math.PI) / 180);
const bounds = {
  north: MALL.lat + HEIGHT / 2 / METRES_PER_DEGREE_LAT,
  south: MALL.lat - HEIGHT / 2 / METRES_PER_DEGREE_LAT,
  west: MALL.lon - WIDTH / 2 / METRES_PER_DEGREE_LON,
  east: MALL.lon + WIDTH / 2 / METRES_PER_DEGREE_LON,
};

/** Each road class the map draws, from the widest; footways, steps and parking aisles are left out. */
const CLASSES = {
  main: ["motorway", "trunk", "primary", "secondary", "motorway_link", "trunk_link", "primary_link", "secondary_link"],
  street: ["tertiary", "tertiary_link", "unclassified"],
  lane: ["residential", "living_street"],
} as const;
type RoadClass = keyof typeof CLASSES;

interface Way {
  type: "way";
  id: number;
  tags?: Record<string, string>;
  geometry: { lat: number; lon: number }[];
}

const pad = 0.002;
const query = `[out:json][timeout:60];
(
  way["highway"](${bounds.south - pad},${bounds.west - pad},${bounds.north + pad},${bounds.east + pad});
  way(${MALL.way});
);
out geom;`;

const response = await fetch(OVERPASS, {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "alhidaya-site-build/1.0" },
  body: new URLSearchParams({ data: query }),
});
if (!response.ok) throw new Error(`Overpass answered ${response.status}; try again in a minute.`);
const ways = ((await response.json()) as { elements: Way[] }).elements;

const round = (value: number) => Math.round(value * 10) / 10;
const x = (lon: number) => round(((lon - bounds.west) / (bounds.east - bounds.west)) * WIDTH);
const y = (lat: number) => round(((bounds.north - lat) / (bounds.north - bounds.south)) * HEIGHT);
const path = (points: { lat: number; lon: number }[]) =>
  points.map((point, index) => `${index === 0 ? "M" : "L"}${x(point.lon)} ${y(point.lat)}`).join("");

const classOf = (highway: string): RoadClass | null =>
  (Object.keys(CLASSES) as RoadClass[]).find((name) => (CLASSES[name] as readonly string[]).includes(highway)) ?? null;

const roads: Record<RoadClass, string[]> = { main: [], street: [], lane: [] };
const lengths = new Map<string, { metres: number; longest: { lat: number; lon: number }[] }>();
for (const way of ways) {
  const highway = way.tags?.highway;
  const roadClass = highway ? classOf(highway) : null;
  if (!roadClass) continue;
  roads[roadClass].push(path(way.geometry));

  // The named main roads and streets are labelled where their longest piece runs inside the frame.
  const name = way.tags?.["name:en"] ?? way.tags?.name;
  if (!name || roadClass === "lane" || /[^\x20-\x7e]/.test(name)) continue;
  const inside = way.geometry.filter(
    (p) => p.lat < bounds.north && p.lat > bounds.south && p.lon > bounds.west && p.lon < bounds.east,
  );
  const metres = inside.slice(1).reduce((sum, point, index) => {
    const before = inside[index];
    return (
      sum +
      Math.hypot((point.lat - before.lat) * METRES_PER_DEGREE_LAT, (point.lon - before.lon) * METRES_PER_DEGREE_LON)
    );
  }, 0);
  const known = lengths.get(name);
  lengths.set(name, {
    metres: (known?.metres ?? 0) + metres,
    longest: !known || inside.length > known.longest.length ? inside : known.longest,
  });
}

/** Up to four labels, the longest roads first, each at the middle of its longest piece, along it. */
const labels = [...lengths.entries()]
  .filter(([, road]) => road.longest.length >= 2 && road.metres > 250)
  .sort((a, b) => b[1].metres - a[1].metres)
  .slice(0, 4)
  .map(([name, road]) => {
    const middle = Math.floor((road.longest.length - 1) / 2);
    const [from, to] = [road.longest[middle], road.longest[middle + 1]];
    let angle = (Math.atan2(y(to.lat) - y(from.lat), x(to.lon) - x(from.lon)) * 180) / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle < -90) angle += 180;
    return {
      name,
      x: round((x(from.lon) + x(to.lon)) / 2),
      y: round((y(from.lat) + y(to.lat)) / 2),
      angle: Math.round(angle),
    };
  });

const mall = ways.find((way) => way.id === MALL.way);
if (!mall) throw new Error("Asmakh Mall's outline was not in the answer.");

const output = `/**
 * The static map of the streets around the office (plan §30.6, D34): made by
 * \`npx tsx scripts/make-map.mts\` from OpenStreetMap data, read ${new Date().toISOString().slice(0, 10)}.
 * © OpenStreetMap contributors, under the Open Database Licence: the page
 * credits it beside the map. Do not edit by hand; run the script again.
 */
export const MAP = ${JSON.stringify(
  {
    width: WIDTH,
    height: HEIGHT,
    bounds,
    roads,
    labels,
    landmark: {
      name: "Asmakh Mall",
      outline: `${path(mall.geometry)}Z`,
      x: round(mall.geometry.reduce((sum, point) => sum + x(point.lon), 0) / mall.geometry.length),
      y: round(mall.geometry.reduce((sum, point) => sum + y(point.lat), 0) / mall.geometry.length),
    },
  },
  null,
  2,
)} as const;
`;
writeFileSync("src/assets/brand/map.ts", output);
console.log(
  `map.ts: ${roads.main.length} main roads, ${roads.street.length} streets, ${roads.lane.length} lanes; labels: ${labels.map((label) => label.name).join(", ")}`,
);
