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
