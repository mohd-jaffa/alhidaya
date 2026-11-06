# Upload security review

2026-11-01, D141. Scope: the local, uncommitted application code. No production
server or real malware was used. This is a focused upload review, not completion
of the broader ASVS review in R7.3.

| Upload | File limit | Allowed content | Storage |
|---|---:|---|---|
| Admin image | 10 MiB | JPEG, PNG, WebP, AVIF signatures, followed by real image decoding | Generated AVIF/WebP variants; original discarded |
| Admin brochure | 10 MiB | PDF signature | Generated `.pdf` name; published through Settings |
| Public CV | 5 MiB | PDF, DOCX or DOC signatures | Private folder, generated extension from detected type |

Request bodies are also bounded while streaming, including absent or dishonest
Content-Length headers: file allowance plus 16 KiB for admin multipart fields,
or 64 KiB for application fields. No route trusts a browser MIME type or original
filename to choose the stored type or extension. A Windows executable renamed
`image.png` still begins with executable bytes and is refused by the image route.

Images are decoded with the existing 40-million-pixel ceiling, warnings treated
as errors, and encoded afresh at the approved widths. Metadata and appended
program text are not copied to the output; generated variants are the only
stored image files. A valid image header followed by broken pixel data is now
rejected as `UPLOAD_TYPE_NOT_ALLOWED` during conversion, before any variant is
written, rather than escaping as an internal server error.

Image and brochure writes require an admin session and same-origin request.
Applications use the existing origin, honeypot, schema, Turnstile and transactional
rate-limit checks. CVs are stored outside public media with folder mode 700 and
file mode 600. Downloads require an admin session, are audited, and use generated
filenames, attachment disposition, `nosniff`, no-store and a sandbox CSP. HR mail
attachments likewise use generated names and the detected type.

Public media uses app-generated keys and extensions, restrictive path validation,
644 files/755 folders and generated Apache rules: directory listing and CGI off,
script handlers removed, only approved image/PDF extensions served, `nosniff`.
These rules were reviewed as code; their effective behaviour under the client's
Apache configuration must be verified during authorized deployment.

## Limits requiring an explicit distinction

Signature checks are identification hints. The current PDF check recognizes its
header; DOCX recognizes a ZIP header and a Word path marker; DOC recognizes OLE
magic. These do **not** prove a complete, valid document and do not exclude
macros, embedded active content, exploits or malware. Documents are not executed,
unpacked or rendered on this server, but an infected document could still harm
someone opening it on their computer.

No antivirus or content disarm/reconstruction engine is configured. The user chose
to harden and verify existing controls now and decide scanning before launch
(Q52); a future solution must fit the cPanel resource limits. No CV
has been sent to an external scanning service. Adding infrastructure requires
the user's decision under AGENTS.md §29. Until that decision and implementation,
the site must not claim uploads are virus-free.

This distinction follows [OWASP's File Upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html):
signatures are one layer, alongside size restrictions, safe names, storage
isolation and content validation; scanning is a separate layer. Image decoder
limits and strict warning handling follow the [sharp constructor API](https://sharp.pixelplumbing.com/api-constructor/).

## Verification

- Existing streaming-body tests cover an oversized declared body and a body
  exceeding its declared length; storage tests cover traversal refusal, generated
  extensions, permissions, disk budgets and private download behaviour.
- New image tests cover readable headers with truncated pixels, excessive decoded
  dimensions, and a real image with appended harmless program text.
- Built-endpoint tests send harmless executable/script/SVG/PDF fixtures renamed
  `image.png`, forged image signatures, a damaged JPEG, oversized files and a
  disguised brochure, asserting rejection with no media records created.
- The public application journey also rejects an executable-signature fixture
  named `cv.pdf`, without saving an application, while retaining entered fields.
- Final suite results are recorded in changelog.md after verification.
