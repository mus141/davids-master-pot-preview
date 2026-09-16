# David's Master Pot — website preview

Unofficial redesign preview, built for client review. **Not the live David's Master Pot website.**
The official site is https://davidsmasterpot.com.au

Live preview: https://mus141.github.io/davids-master-pot-preview/

## What this is

A bilingual (English / Simplified Chinese) static rebuild of the David's Master Pot
marketing site. 18 pages per language plus localised 404s, generated from a single
shared content layer so nothing forks between languages.

Brand imagery and the mascot are David's Master Pot's own assets, used here solely
for this client review.

## Structure

| Path | What |
|---|---|
| `content/` | All copy and data (EN + ZH) as JSON. Single source of truth. |
| `src/` | Design tokens, base, components, motion CSS, and `app.js` |
| `build.js` / `render.js` / `emit.js` | Static site generator |
| `docs/` | Built site, served by GitHub Pages |
| `assets/` | Optimised WebP imagery and self-hosted fonts |

## Build

```bash
node emit.js                                   # builds to build/ for local root hosting
BASE_PATH=/davids-master-pot-preview PREVIEW=1 node emit.js && cp -R build docs
npx serve build -l 4700                        # local preview
```

`BASE_PATH` prefixes every local URL for subdirectory hosting. `PREVIEW=1` adds
`noindex` so the preview never competes with the real site in search results.

## Notes

- **Fonts are self-hosted** (Anton + Archivo, SIL OFL). Google Fonts is unreachable
  from mainland China, so the type system cannot depend on it. Chinese uses the
  device stack (PingFang SC / Microsoft YaHei).
- Facebook, Instagram and Google Maps links are correct for customers in Australia
  but will not open from mainland China.

## Outstanding, needs client data

- Per-100g price is referenced throughout but never stated
- Opening hours and phone numbers: 0 of 20 stores have them (schema is ready, deliberately left null rather than guessed)
- `formEndpoint` in `content/site.json` is null, so the franchise and contact forms have nowhere to submit
- Harbour Town has contradictory source data: the street address is Gold Coast, the postcode (4011) is Brisbane
