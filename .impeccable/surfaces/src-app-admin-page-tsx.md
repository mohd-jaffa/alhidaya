---
version: 1
slug: "src-app-admin-page-tsx"
primary_target: "src/app/admin/page.tsx"
related_targets: ["src/app/admin/layout.tsx"]
---

## Scope

The admin panel (plan §16, §30.5; R6.1, D80): sign-in, the shell, Today, the
Enquiries section now; Applications (Phase 5) and the content editors
(Phase 6) later, in the same shell. Operate mode.

## Audience and job

One Al Hidaya office staff member, not technical, mostly at a desktop, sometimes
reading on a phone. Daily job: handle new enquiries and applications;
occasionally edit the site. Success: a new enquiry read, answered by call,
WhatsApp or email, moved along and noted without leaving the stream.

## Direction contract

THESIS: the admin is the day's log of a ward's front desk: one stream of what
arrived, newest first and ruled by day, each row handled where it is. It refuses
the dashboard of KPI tiles and charts, the public site's signs and motion, and
page-per-click inbox work.

OWN-WORLD: quiet and firm, pastel green (D138, chosen by the user after the public work). The sidebar, phone bar/menu and sign-in panel use pale leaf with navy text, the colour logo and green counts; the active row is leaf with navy words. White work areas, fixed Inter Tight type, 6 px corners, hairlines and the existing grouped list remain. Forest carries actions, links, focus and switches, scoped to `/admin`; the public palette stays blue. Status colours retain their meaning: New blue, in progress sky, resolved leaf, errors red, all with words and marks.

STORY: the admin opens on Today and sees what needs them, opens a row, calls,
moves it along, notes it, and trusts nothing was missed.

FIRST VIEWPORT: the column of links; "Today" with Needs you / Everything; a day rule; the
newest arrival opened in place (every answer, Call, WhatsApp, Email, Move to,
a note box), the rest as one-line rows with time, title, summary and a status
chip. Phone: a top bar naming the section with a menu; full-width rows.

FORM: the chosen sketch, .impeccable/mocks/decision/dealt-log.html (surface
seed 393284a0, dealt structure, code-led).

FINISH: built to the sketch at desktop and phone with every state; reviewed
against this contract before Phase 4 closes.

## Constraints

Logo colours only (D35), light only (D28); the public site's tokens and kit;
no smooth scroll, motion 150-250 ms for state only, none with reduced motion;
WCAG 2.2 AA, 44 px targets; Arabic-ready logical properties; plain words, no
jargon; no modal for daily work. The admin never loads the public site's motion.

## The content editors (R6.3, shaped 2026-10-30; plan D86 – D90)

The Pages editor sets the pattern Services, Jobs, Clients and Settings follow:
the day's log, for content.

- **Pages** (`/admin/pages`, the first station of "The site"): the eight fixed
  pages as one-line rows with their address and state (Published, Changes not
  published, Never published); the station's sky count is the pages waiting.
  Today lists what waits to be published above its log.
- **A page:** a bar kept in view with the page's name, its state (Unsaved
  changes, Saved, Publishing, Published, Publish failed) and Save draft,
  Preview (new tab, the saved draft), Publish and Discard draft (both asked
  first; Publish saves first; leaving unsaved asks first). Below, the
  sections as numbered rows: a grip, the type, its heading, Hidden when
  hidden; Edit, Hide/Show, Move up/down, Remove (asked first). Edit opens
  the row in place on mist with the type's fields; text block by block;
  a photo picked from the library in a dialog. Add a section offers only
  what the page allows. SEO last. Errors at their field and counted in the
  bar.
- Desktop first; on a phone rows are full width and actions wrap.

## Font Manager (D168, 2026-11-04)

Settings → Font Manager extends the existing Operate editor. Twenty labelled
native selectors choose from a fixed fifteen-font library, grouped by text purpose,
with live specimens beside on wide screens and below on phones. The shared
draft toolbar and leave guard apply. Save/Preview/Publish/Discard affect only
typography. The admin's own typography stays fixed; only specimens vary.

D172 responsive verification: preserve the full 44 px mobile menu button; editor Back, pagination, activity destinations and media-usage destinations retain full tap targets. Contain-fit brand logos preserve their shape in narrow rails. All existing tasks, sections, selectors and publication behavior remain.

D181 polish: Preview shares the toolbar’s pending state: dimmed, aria-disabled, out of the tab order and blocked for normal/auxiliary activation while saving, publishing or discarding. Restore it after completion or failure. Preserve saved-draft preview and automatic save before preview.

D181 protects pending writes with a named native fieldset disabled during the operation; restore on success/failure. Keep the field group’s zero minimum width for mobile/enlarged text and all current inputs/labels.
