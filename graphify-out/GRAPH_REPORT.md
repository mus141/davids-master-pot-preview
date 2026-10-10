# Graph Report - DavidsMasterPot  (2026-09-18)

## Corpus Check
- 15 files · ~190,185 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 83 nodes · 138 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- build.js
- emit.js
- package.json
- render.js
- esc
- David's Master Pot — website preview
- marquee
- S
- baseCard
- asset
- optimize.sh
- README.md

## God Nodes (most connected - your core abstractions)
1. `esc()` - 22 edges
2. `home()` - 14 edges
3. `asset()` - 10 edges
4. `S()` - 8 edges
5. `baseCard()` - 7 edges
6. `marquee()` - 7 edges
7. `storeCard()` - 6 edges
8. `David's Master Pot — website preview` - 6 edges
9. `url()` - 5 edges
10. `tiles()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `newsPage()` --calls--> `esc()`  [EXTRACTED]
  DavidsMasterPot/render.js → DavidsMasterPot/build.js
- `promosPage()` --calls--> `esc()`  [EXTRACTED]
  DavidsMasterPot/render.js → DavidsMasterPot/build.js
- `baseCard()` --calls--> `esc()`  [EXTRACTED]
  DavidsMasterPot/render.js → DavidsMasterPot/build.js
- `buildPage()` --calls--> `esc()`  [EXTRACTED]
  DavidsMasterPot/render.js → DavidsMasterPot/build.js
- `clubPage()` --calls--> `esc()`  [EXTRACTED]
  DavidsMasterPot/render.js → DavidsMasterPot/build.js

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "build.js"
Cohesion: 0.15
Nodes (11): BASE, fs, LANGS, menu, NAV, OUT, pages, path (+3 more)

### Community 1 - "emit.js"
Cohesion: 0.15
Nodes (11): B, crypto, css, fs, META, path, R, RENDER (+3 more)

### Community 2 - "package.json"
Cohesion: 0.25
Nodes (7): description, name, private, scripts, build, serve, version

### Community 3 - "render.js"
Cohesion: 0.25
Nodes (7): B, news, newsPage(), promos, promosPage(), TILE_BG, timeline

### Community 4 - "esc"
Cohesion: 0.52
Nodes (7): esc(), para(), home(), paraStrip(), reach(), sectionHead(), stats()

### Community 5 - "David's Master Pot — website preview"
Cohesion: 0.29
Nodes (6): Build, David's Master Pot — website preview, Notes, Outstanding, needs client data, Structure, What this is

### Community 6 - "marquee"
Cohesion: 0.40
Nodes (5): buildPage(), clubPage(), dishCard(), marquee(), menuPage()

### Community 7 - "S"
Cohesion: 0.50
Nodes (5): contactPage(), franchisePage(), S(), storeCard(), storesPage()

### Community 8 - "baseCard"
Cohesion: 0.50
Nodes (4): allerg(), heat(), baseCard(), hrail()

### Community 9 - "asset"
Cohesion: 0.67
Nodes (4): asset(), shell(), url(), tiles()

## Knowledge Gaps
- **39 isolated node(s):** `fs`, `path`, `site`, `menu`, `stores` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `esc()` connect `esc` to `build.js`, `render.js`, `marquee`, `S`, `baseCard`, `asset`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `asset()` connect `asset` to `build.js`, `esc`, `marquee`, `S`, `baseCard`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `home()` connect `esc` to `render.js`, `marquee`, `S`, `baseCard`, `asset`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `site` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._