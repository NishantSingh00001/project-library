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
