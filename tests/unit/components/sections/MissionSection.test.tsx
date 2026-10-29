import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MissionSection } from "@/components/sections/MissionSection";
import { UI_TEXT } from "@/constants/messages";
import { contentFixture } from "@tests/support/fixtures/content";

describe("MissionSection", () => {
  it("sets the mission and the vision side by side, each under its own heading", () => {
    render(<MissionSection anchor="mission" content={contentFixture("MISSION")} />);
    expect(screen.getByRole("heading", { level: 2, name: UI_TEXT.mission })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: UI_TEXT.vision })).toBeInTheDocument();
    expect(screen.getByText("Our mission.")).toBeInTheDocument();
    expect(screen.getByText("Our vision.")).toBeInTheDocument();
  });
});
