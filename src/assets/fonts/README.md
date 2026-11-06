# Public font library (D168)

These fonts are bundled, not uploaded by admins. All public role defaults remain
Inter Tight. The admin panel keeps Inter Tight except for its labelled specimens.

The fourteen optional Latin variable WOFF2 faces were copied from the Fontsource
variable packages listed in `library.json`. That manifest records the exact
version, source tarball, file size and SHA-256 digest. Each directory includes
its upstream SIL Open Font License. Inter Tight's existing source and licenses
are documented in `inter-tight/README.md`.

Only normal variable faces are bundled; the browser synthesizes italics where
existing content uses emphasis. All fifteen support the site's 400, 500, 600 and 700
weights. The current English site's Latin subset includes its punctuation and
numerals; a future Arabic locale needs its own approved Arabic font library.

`src/app/site-fonts.ts` registers the optional faces with `next/font/local`,
metric-adjusted Arial or Times New Roman fallbacks and `preload: false`. A browser
requests a face when selected content uses it. The existing root Inter Tight preload is retained
for the default site and the admin. No font CDN or new runtime dependency is used.

The deployable public bundle also includes all fifteen complete licenses at
`/fonts/LICENSES.txt`, copied with public assets into the standalone release.

The five expressive additions (D169) are Playfair Display, Cormorant Garamond,
Fraunces, Space Grotesk and Syne. The three serifs use a metric-adjusted
Times New Roman fallback; the remaining faces use Arial. They support the same
four used weights and remain optional, without extra preloads. Their official
previews are at https://fontsource.org/fonts/ followed by each manifest ID.
