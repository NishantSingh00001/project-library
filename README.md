# Project Library

An Apple TV-style library of every project I've built. A 3D spotlight of top projects, shelves by type and tech stack, an accurate local search, and a deep dive for each project: what it does, how it works, what's special, architecture, tech stack, file structure and implementation notes.

## How it works

- `index.html` is the whole site: one self-contained file with the data and preview images inlined. No build step is needed to deploy.
- Clicking a poster opens the project's live site. Clicking the text under it opens the deep dive.
- The theme follows local time (light 06:30 to 18:30, dark otherwise). The clock at the top left switches it by hand.
- Search runs in the browser over weighted fields (name, concepts, stack, description). Every word must match.

## Tailored links

Add URL parameters to open the library already filtered. The spotlight, shelves and grid all narrow to the matching projects, and the "View as" chips under the spotlight do the same thing with a click.

| Parameter | Example | Effect |
|---|---|---|
| `role` | `?role=ai-engineer` | Projects relevant to a role. Known roles: `ai-engineer`, `ml-engineer`, `data-engineer`, `full-stack`, `backend`, `frontend`, `security`, `forward-deployed` (short forms such as `ml`, `sde`, `fde` work). Any other value is treated as a search. |
| `tech` | `?tech=react,typescript` | Projects whose stack includes every listed technology. |
| `tag` | `?tag=rag` | Projects matching a concept, using the same engine as the search box. |

Parameters combine: `?role=ai-engineer&tech=react`. If nothing matches, the full library is shown with a note.

## Updating it

Everything used to generate the page is in `source/`:

| File | Purpose |
|---|---|
| `curated.js` | Hand-written entry per project: tagline, categories, stack, search concepts, live URL, architecture |
| `auto.json` | File trees, line counts and READMEs extracted from each repo by `extract.py` |
| `shots/` | Preview image per project, captured by `shoot.js` |
| `template.html` | Page markup, styles and script |
| `build.js` | Merges the above into `../index.html` |

To add or edit a project, change `curated.js`, then run `cd source && node build.js`.

## Stack

Vanilla HTML, CSS and JavaScript. Three.js (CDN) for the spotlight point field, CSS 3D transforms for the cascade and card tilt, Canvas for generated artwork. Deployed on Vercel as a static site.
