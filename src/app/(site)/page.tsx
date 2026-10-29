import { UI_TEXT } from "@/constants/messages";

/** A placeholder until Home is built in "Follow the Line" (plan §6.1, R3.3). */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-2 p-6">
      <h1 className="text-page font-bold">{UI_TEXT.siteName}</h1>
      <p>{UI_TEXT.placeholderNote}</p>
    </main>
  );
}
