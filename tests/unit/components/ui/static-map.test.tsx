import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MAP } from "@/assets/brand/map";
import { mapPosition, StaticMap } from "@/components/ui/static-map";
import { UI_TEXT } from "@/constants/messages";

const centre = {
  lat: (MAP.bounds.north + MAP.bounds.south) / 2,
  lon: (MAP.bounds.west + MAP.bounds.east) / 2,
};

describe("mapPosition", () => {
  it("places a spot by its share of the map's width and height, and nowhere off it", () => {
    expect(mapPosition(centre.lat, centre.lon)).toEqual({ x: 0.5, y: 0.5 });
    expect(mapPosition(MAP.bounds.north, MAP.bounds.west)).toEqual({ x: 0, y: 0 });
    expect(mapPosition(MAP.bounds.north + 0.01, centre.lon)).toBeNull();
    expect(mapPosition(MAP.bounds.south - 0.01, centre.lon)).toBeNull();
    expect(mapPosition(centre.lat, MAP.bounds.west - 0.01)).toBeNull();
    expect(mapPosition(centre.lat, MAP.bounds.east + 0.01)).toBeNull();
  });
});

describe("StaticMap", () => {
  it("draws the streets and Asmakh Mall, names its roads, and credits OpenStreetMap", () => {
    const { container } = render(<StaticMap pin={null} office="Retaj Building, Bin Naifaa 80" />);
    const map = screen.getByRole("img", { name: UI_TEXT.mapLabel });
    expect(map.querySelectorAll("svg path")).toHaveLength(
      MAP.roads.lane.length + MAP.roads.street.length + 2 * MAP.roads.main.length + 1,
    );
    expect(map).toHaveTextContent(MAP.landmark.name);
    for (const label of MAP.labels) expect(map).toHaveTextContent(label.name);
    expect(screen.getByRole("link", { name: UI_TEXT.mapAttribution })).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/copyright",
    );
    expect(container).not.toHaveTextContent("Retaj Building");
  });

  it("marks the office with a forest dot once its spot is set, and only when the spot is on the map", () => {
    const { rerender } = render(<StaticMap pin={centre} office="Retaj Building, Bin Naifaa 80" />);
    const map = screen.getByRole("img", { name: UI_TEXT.mapWithOffice("Retaj Building, Bin Naifaa 80") });
    const office = screen.getByText("Retaj Building, Bin Naifaa 80");
    expect(office).toHaveStyle({ top: "50.00%" });
    expect(map.querySelector(".bg-forest")).toHaveStyle({ left: "50.00%", top: "50.00%" });

    rerender(<StaticMap pin={{ lat: 25.3, lon: 51.6 }} office="Retaj Building, Bin Naifaa 80" />);
    expect(screen.getByRole("img", { name: UI_TEXT.mapLabel })).toBeInTheDocument();
    expect(screen.queryByText("Retaj Building, Bin Naifaa 80")).not.toBeInTheDocument();
  });
});
