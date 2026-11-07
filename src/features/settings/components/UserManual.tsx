"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ADMIN_MANUAL, ADMIN_TEXT } from "@/constants/admin-messages";
import { ADMIN_API_ROUTES } from "@/constants/admin-routes";

/** Task-based training: only the selected lesson loads a video. */
export function UserManual() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [lessonIndex, setLessonIndex] = useState(0);
  const category = ADMIN_MANUAL[categoryIndex];
  const lesson = category.lessons[lessonIndex];
  return (
    <div className="grid max-w-site gap-8">
      <header className="grid gap-2">
        <h1 className="text-section font-semibold text-navy">{ADMIN_TEXT.userManual}</h1>
        <p className="max-w-measure text-ink-2">{ADMIN_TEXT.manualIntro}</p>
      </header>
      <div className="grid items-start gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label={ADMIN_TEXT.manualTopics} className="grid gap-2">
          <h2 className="text-title font-semibold">{ADMIN_TEXT.manualTopics}</h2>
          {ADMIN_MANUAL.map((item, index) => (
            <Button
              key={item.title}
              variant={index === categoryIndex ? "primary" : "quiet"}
              aria-pressed={index === categoryIndex}
              className="justify-start text-start"
              onClick={() => {
                setCategoryIndex(index);
                setLessonIndex(0);
              }}
            >
              {item.title}
            </Button>
          ))}
        </nav>
        <section className="grid min-w-0 gap-6" aria-label={category.title}>
          <h2 className="text-title font-semibold">{category.title}</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label={ADMIN_TEXT.manualLessons}>
            {category.lessons.map((item, index) => (
              <Button
                key={item.id}
                variant={index === lessonIndex ? "primary" : "secondary"}
                aria-pressed={index === lessonIndex}
                onClick={() => setLessonIndex(index)}
              >
                {item.title}
              </Button>
            ))}
          </div>
          <article className="grid min-w-0 gap-5" aria-label={lesson.title}>
            <header className="grid gap-1">
              <h3 className="text-title font-semibold">{lesson.title}</h3>
              <p className="text-small text-ink-2">{ADMIN_TEXT.manualDuration(lesson.duration)}</p>
            </header>
            <video
              key={lesson.id}
              controls
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-panel bg-navy"
              aria-label={ADMIN_TEXT.manualVideo(lesson.title)}
            >
              <source src={ADMIN_API_ROUTES.adminManualAsset(`${lesson.id}.mp4`)} type="video/mp4" />
              <track
                kind="captions"
                src={ADMIN_API_ROUTES.adminManualAsset(`${lesson.id}.vtt`)}
                srcLang="en"
                label={ADMIN_TEXT.manualEnglish}
              />
              {ADMIN_TEXT.manualVideoFallback}
            </video>
            <h4 className="font-semibold">{ADMIN_TEXT.manualSteps}</h4>
            <ol className="grid list-decimal gap-3 ps-6">
              {lesson.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <details className="rounded-panel border border-rule p-4">
              <summary className="min-h-touch cursor-pointer font-semibold">{ADMIN_TEXT.manualTranscript}</summary>
              <p className="pt-3 text-ink-2">{lesson.transcript}</p>
            </details>
          </article>
          <p className="text-small text-ink-2">{ADMIN_TEXT.manualRecordingNote}</p>
        </section>
      </div>
    </div>
  );
}
