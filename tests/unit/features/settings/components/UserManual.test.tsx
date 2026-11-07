import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ADMIN_MANUAL, ADMIN_TEXT } from "@/constants/admin-messages";
import { UserManual } from "@/features/settings/components/UserManual";

describe("User manual", () => {
  it("provides every lesson with written instructions, optional captions and a transcript", () => {
    render(<UserManual />);
    expect(screen.getByRole("heading", { name: ADMIN_TEXT.userManual })).toBeVisible();
    for (const category of ADMIN_MANUAL) {
      fireEvent.click(
        within(screen.getByRole("navigation", { name: ADMIN_TEXT.manualTopics })).getByRole("button", {
          name: category.title,
        }),
      );
      const lessons = screen.getByRole("group", { name: ADMIN_TEXT.manualLessons });
      expect(within(lessons).getAllByRole("button")).toHaveLength(category.lessons.length);
      for (const lesson of category.lessons) {
        fireEvent.click(within(lessons).getByRole("button", { name: lesson.title }));
        const article = screen.getByRole("article", { name: lesson.title });
        expect(within(article).getAllByRole("listitem")).toHaveLength(lesson.steps.length);
        expect(article.querySelector("source")).toHaveAttribute("src", `/api/admin/manual/${lesson.id}.mp4`);
        expect(article.querySelector("track")).toHaveAttribute("src", `/api/admin/manual/${lesson.id}.vtt`);
        expect(article.querySelector("track")).not.toHaveAttribute("default");
        expect(article.querySelector("video")).toHaveAttribute("preload", "metadata");
        expect(article.querySelector("video")).not.toHaveAttribute("autoplay");
        expect(within(article).getByText(lesson.transcript)).toBeInTheDocument();
      }
    }
    fireEvent.click(screen.getByRole("button", { name: "Getting started" }));
    expect(screen.getByRole("article", { name: ADMIN_MANUAL[0].lessons[0].title })).toBeVisible();
  });
});
