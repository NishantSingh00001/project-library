# Project Library

Static single-page site. `index.html` is generated: edit files in `source/` and run `cd source && node build.js`.

## Security rules

- Never put secrets, API keys or tokens in any file in this repo. This site must stay keyless.
- Keep `.env` files out of git (`.gitignore` covers them).
- Escape all project text before inserting it into the page. Do not add `innerHTML` with unescaped data.
- Pin any third-party script to an exact version from an allowed CDN.
- If a backend, upload, paid feature or AI endpoint is ever added, enforce access rules, size limits, entitlement checks and rate caps on the server, and update `SECURITY_REVIEW.md`.
