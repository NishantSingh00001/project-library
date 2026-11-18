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

This is a *soft* filter: the page still ships the data for every project, the "View as" chips can switch to any other role, and the search box reaches the whole library. It's for giving a link a head start, not for hiding anything.

## Locked links

For links sent to a specific recruiter or company, `locked/<role>-<token>.html` is a separate, standalone page that was built with **only** that role's projects baked in — not filtered client-side. The other projects' names, descriptions, screenshots and code links are not present in that file at all: no "View everything" chip, no search result, no page source that reveals the rest of the library. Each one gets a short random-looking token instead of a plain role name, so the URL alone doesn't announce what it is.

| Role | Example |
|---|---|
| AI Engineer | `/locked/ai-engineer-xvksotyx.html` |
| ML Engineer | `/locked/ml-engineer-s9cqrlg9.html` |
| Data Engineer | `/locked/data-engineer-wrwps7uv.html` |
| Full-stack Engineer | `/locked/full-stack-zfa8snhv.html` |
| Backend Engineer | `/locked/backend-hwhr7msw.html` |
| Frontend Engineer | `/locked/frontend-9a9cpr0g.html` |
| Security Engineer | `/locked/security-b7gjqkag.html` |
| Forward Deployed Engineer | `/locked/forward-deployed-7doo2oyh.html` |

## Admin: one-off company links

A small dot button next to the clock (top left) opens an admin panel, password-gated client-side (SHA-256 check, nothing sent anywhere). Once in, paste a job description and optionally a company/role name, and it builds a link like `/?custom=tessera,crossbridge,...&co=Acme+Corp` on the spot — no rebuild, no deploy.

How it picks projects: entirely local keyword matching against each project's existing tags (`kw`, stack, category, kind) — no AI call, no network request. It scores every project by overlap with the pasted text and takes the top matches; if nothing scores, it falls back to a small general-purpose set rather than showing nothing. The "why these projects" paragraph above the spotlight is templated from the same data (the terms that are distinctive to the matched set, not just common ones like "React"), not freshly written per company.

These links use the **same UI treatment** as the locked pages above — no "View as" switcher, no path to the rest of the library through the UI — but **not the same data guarantee**: they run on the normal `index.html`, so the full project data is still present in that page's source, just not shown. Good enough that a recruiter clicking through sees only the curated set; not something to rely on if the data itself must never be visible to a determined viewer. For that stronger guarantee, add a hand-picked entry to `source/locked.js` instead (ask Claude, or edit it directly) — that bakes a truly separate file the normal way.

To change the admin password: hash a new passphrase (e.g. in a browser console, `await crypto.subtle.digest('SHA-256', new TextEncoder().encode('new-password')).then(b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join(''))`) and replace `ADMIN_HASH` in `source/template.html`.

## Locked-link trust model

These tokens are **obscurity, not real access control** — it's a static file anyone with the URL can open, the same trust level as an unlisted Google Doc link. They're not guessable or enumerable from the public site, but don't rely on them for anything that needs real authentication.

To change which projects a role includes, edit the `ids` list for that role in `source/locked.js`, then rebuild. To invalidate every existing locked link at once (say, one leaked), change the `SALT` constant in `source/locked.js` and rebuild — every token changes and the old files are simply not regenerated (delete the `locked/` folder and rebuild to drop the stale ones).

## Updating it

Everything used to generate the page is in `source/`:

| File | Purpose |
|---|---|
| `curated.js` | Hand-written entry per project: tagline, categories, stack, search concepts, live URL, architecture |
| `locked.js` | Role → curated project-id list + secret token, for the locked links above |
| `auto.json` | File trees, line counts and READMEs extracted from each repo by `extract.py` |
| `shots/` | Preview image per project, captured by `shoot.js` |
| `template.html` | Page markup, styles and script |
| `build.js` | Merges the above into `../index.html` and `../locked/*.html` |

To add or edit a project, change `curated.js`, then run `cd source && node build.js`. The same command regenerates every locked page too.

## Stack

Vanilla HTML, CSS and JavaScript. Three.js (CDN) for the spotlight point field, CSS 3D transforms for the cascade and card tilt, Canvas for generated artwork. Deployed on Vercel as a static site.
