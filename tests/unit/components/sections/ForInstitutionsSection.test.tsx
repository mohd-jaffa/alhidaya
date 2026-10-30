import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ForInstitutionsSection } from "@/components/sections/ForInstitutionsSection";
import type { Section } from "@/lib/validation";
import { contentFixture, imageFixture } from "@tests/support/fixtures/content";

vi.mock("@/components/motion/MotionProvider", () => ({ useMotion: () => ({ engine: null }) }));

type Institutions = Extract<Section, { type: "FOR_INSTITUTIONS" }>["content"];
const faces = ["a", "b", "c"].map((id) => ({ ...imageFixture(`Face ${id}`), id }));
const ward = { ...imageFixture("A nurse on a ward"), id: "ward" };
const image = (ref: { mediaId: string } | null) =>
  ref ? ([...faces, ward].find((face) => face.id === ref.mediaId) ?? null) : null;

describe("ForInstitutionsSection (D97, D105)", () => {
  it("opens with its pill and heading, then the team, the photo and the reach, then its figures", () => {
    const content: Institutions = {
      ...contentFixture("FOR_INSTITUTIONS"),
      team: {
        title: { en: "Nurses for your team" },
        text: { en: "Tell us the roles." },
        avatars: faces.map(({ id }) => ({ mediaId: id })),
      },
      photo: { image: { mediaId: "ward" }, text: { en: "On your wards." } },
      reach: { title: { en: "Across Doha" }, avatars: [{ mediaId: "a" }, { mediaId: "b" }] },
      facts: [
        { value: { en: "24/7" }, label: { en: "Nurses around the clock" } },
        { value: { en: "8" }, label: { en: "Nursing services" } },
      ],
    };
    const { container } = render(<ForInstitutionsSection anchor="for-institutions" content={content} image={image} />);
    expect(screen.getByRole("region", { name: /Nurse staffing for/ })).toBe(container.firstElementChild);
    expect(screen.getByText("For institutions")).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Nurses for your team" })).toBeVisible();
    expect(screen.getByRole("img", { name: "A nurse on a ward" })).toBeVisible();
    expect(screen.getByText("On your wards.")).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Across Doha" })).toBeVisible();
    expect(screen.getAllByRole("term")).toHaveLength(2);
    expect(screen.getByText("Nurses around the clock")).toBeVisible();
    expect(screen.getAllByText("8").length).toBeGreaterThan(0);
  });

  it("stands without faces, a photo, words or figures, and with a face that is gone", () => {
    const content: Institutions = {
      ...contentFixture("FOR_INSTITUTIONS"),
      pictogram: null,
      headingEnd: { en: null },
      team: { title: { en: "Nurses" }, text: { en: null }, avatars: [{ mediaId: "gone" }] },
      photo: { image: null, text: { en: null } },
      reach: { title: { en: "Doha" }, avatars: [] },
      facts: [],
    };
    const { container } = render(<ForInstitutionsSection anchor="for-institutions" content={content} image={image} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("dl")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Nurse staffing for" })).toBeVisible();
  });
});
