# Admin training clips

37 task-based clips split from the non-captioned Al Hidaya admin walkthrough created on 2026-11-07 at the owner's request. Each is H.264/AAC with fast-start metadata. Matching WebVTT captions are optional, with estimated timing from the approved narration. Narration uses Microsoft's synthetic English Jenny voice.

These files contain fictional submissions and a deleted training account. They are intentionally outside `public/`. The authenticated `/api/admin/manual/[asset]` endpoint serves only filenames in the fixed manual catalogue, with no-store responses and byte ranges. `scripts/standalone-assets.mjs` copies this folder into the standalone release.

The menu, topics, written steps and transcripts are defined in `src/constants/admin-manual.ts`. Source recording and export notes remain in the local `.data/admin-walkthrough/deliverables/README.md`.
