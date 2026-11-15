import { API_ROUTES } from "@/constants/routes";
import { postForm } from "@/lib/api/client";

/** The field that holds the answer to a job's own question (D209), by the question's place in the form. */
export const answerField = (index: number) => `answer-${index}`;

/**
 * The endpoint the application form calls (AGENTS.md §14), apart from the
 * inbox's in `api.client.ts`, so the public page never carries the admin's
 * addresses (plan §31).
 */
export const CareersClient = {
  /**
   * What was typed goes as one JSON part, to be read once more by the route's
   * schema exactly as a JSON body would be, and the CV as a file beside it.
   * The job's own questions (D209), in the words the form asked them, go as
   * `answers`, each with the choice made.
   */
  apply: (values: Record<string, unknown>, questions: readonly string[] = []) => {
    const { cv, ...typed } = values;
    const answerFields = new Set(questions.map((_, index) => answerField(index)));
    const fields = Object.fromEntries(Object.entries(typed).filter(([name]) => !answerFields.has(name)));
    const answers = questions.map((question, index) => ({ question, choice: typed[answerField(index)] }));
    const form = new FormData();
    form.set("fields", JSON.stringify({ ...fields, answers }));
    if (cv instanceof File) form.set("cv", cv);
    return postForm<{ received: true }>(API_ROUTES.applications, form);
  },
};
