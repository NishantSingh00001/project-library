# Security review

Reviewed against the five common mistakes.

| Check | Result |
|---|---|
| Secrets in frontend code | None. The site has no API keys, tokens or environment variables. |
| Data access without rules | Not applicable. There is no database or backend. |
| Unlimited uploads | Not applicable. The site accepts no uploads. |
| Paid features unchecked on the server | Not applicable. There are no paid features. |
| Uncapped AI or agent endpoints | Not applicable. Search runs locally; no model is called. |

Other notes:

- All project text is HTML-escaped before rendering. README links are limited to `http(s)` URLs and open with `rel="noopener"`.
- Only one third-party script is loaded: Three.js 0.149.0 from cdnjs, pinned to an exact version.
- The only browser storage used is a theme preference in `localStorage`.
- `vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy`.
- A gitleaks GitHub Action scans every push and pull request.
- URL parameters (`role`, `tech`, `tag`) only filter the built-in project list. Their values are HTML-escaped before display and are never sent anywhere.
- Locked links (`locked/<role>-<token>.html`) are separate static pages built with only the included projects' data; the rest of the library is genuinely absent from that file, not hidden by CSS/JS. The token is obscurity (an unguessable, unlisted path), not authentication — treat a locked link like an unlisted doc link: fine to hand to one recipient, not a substitute for a real login. See the README's "Locked links" section for how tokens are generated and rotated.
- The admin panel (JD-tailored link generator) is a UI gate only, not an authorization boundary: the password is SHA-256-checked client-side against a hash baked into `template.html`, which is adequate for "keep casual visitors from noticing the button" but is crackable offline by anyone with the page source and is not a substitute for real auth. It makes no network request of any kind — the JD text, the matching, and the generated link are all computed in that tab and never sent anywhere, so there's no server-side surface to secure. Admin-generated `?custom=` links reuse the existing project data already embedded in `index.html` (same as `?role=`); they get the locked pages' no-switcher UI treatment but not their data-separation guarantee — see the README's "Admin: one-off company links" section.

## 20-point pen-test checklist (2026-11-18)

This site has no server of its own (static files on Vercel), no database, no auth system, no
GraphQL/WebSocket/SAML/XML. Almost every item below is **not applicable** for that reason; the
two rows with a real finding are marked.

| # | Check | Applies? | Why |
|---|---|---|---|
| 1 | HTTP/2 Rapid Reset | No | No server of our own — Vercel's static hosting terminates HTTP/2, not our code. |
| 2 | bcrypt 72-byte limit | No | No bcrypt, no password hashing of any kind server-side. |
| 3 | SAML signature bypass | No | No SAML. |
| 4 | nOAuth | No | No OAuth / "Log in with X". |
| 5 | GraphQL alias batching | No | No GraphQL. |
| 6 | TOTP replay | No | No 2FA/TOTP. |
| 7 | ReDoS | No | Reviewed every regex in `template.html` (markdown-lite renderer, search normalizer, slug/stem helpers). All run on short, length-bounded strings (project text we wrote, or a search box) and none nests repetition (no `(a+)+`-shaped patterns). |
| 8 | JWT algorithm confusion | No | No JWTs. |
| 9 | HTTP request smuggling | No | No proxy/load balancer of our own in front of the app. |
| 10 | Web cache poisoning | No | Vercel's CDN caches static assets by URL only; nothing in our code builds a response from `X-Forwarded-Host` or similar. |
| 11 | Spoofed X-Forwarded-For | No | No server-side rate limiting by IP (there's no server). |
| 12 | Postgres views / RLS | No | No database. |
| 13 | Math.random() for security tokens | **Partial finding** | Nothing uses `Math.random()`. But the *locked-link* tokens (`locked.js`) aren't random either — they're `sha1(SALT + ':' + roleSlug)`, a deterministic hash. That's fine for the stated purpose (an unguessable-looking but stable, bookmarkable URL) and is already documented as obscurity-not-auth. The only gap: if someone learns `SALT` (it's in the public repo) and the 8 role slugs, they could precompute every token — a determined recruiter could find links meant for other roles. Possible fix: make tokens random and stored in `locked.js` instead of derived, so the repo itself doesn't leak how to compute them. Not fixing without your OK since it'd mean regenerating and re-sharing every existing locked link. |
| 14 | Timing attacks on secret comparison | No | The one comparison (`h===ADMIN_HASH` in `template.html`) runs entirely in the visitor's own browser with no network round trip to measure — there's no remote attacker position from which JS string-compare timing is observable. Not the same threat model as a server checking a secret. |
| 15 | Padding oracle | No | No server-side encryption/decryption of cookies or tokens. |
| 16 | Server-side prototype pollution | No | No server merging request bodies — there's no server. |
| 17 | Server-side template injection | No | No server-side templating; the one bit of template-like rendering (markdown-lite in `template.html`) only ever runs on project text we wrote ourselves, never on visitor input. |
| 18 | XXE | No | No XML parsing anywhere. |
| 19 | Cross-site WebSocket hijacking | No | No WebSockets. |
| 20 | Unicode username normalization | No | No usernames/accounts. |

No fixes needed or pending approval here — only the locked-link-token note under #13 is a genuine (low-severity) design trade-off, already flagged above, and left as-is pending your call.
