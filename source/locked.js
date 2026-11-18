// Locked role links: each entry builds its OWN standalone HTML page at
// locked/<slug>-<token>.html containing ONLY the matching projects' data —
// not a client-side filter, an actually separate file. Nothing about the
// other projects (names, descriptions, code, screenshots) ships to that page
// at all, so there is no "View everything" escape hatch and no search box
// result that reveals the rest of the library.
//
// To add a role: add an entry below, run `node build.js`, and the new file
// appears under ../locked/. To revoke every existing link at once (e.g. one
// leaked), change SALT and rebuild — every token changes.
// To hand-pick exact projects instead of the cats/kw match below, add an
// `ids:[...]` array to that entry; it then uses exactly those ids.
const SALT = 'nishant-locked-v1';

// Hand-picked per role — deliberately tight (5-8 projects), not a loose
// keyword/category match. A recruiter sent this link should see a focused
// slice, not most of the library. Edit the `ids` array to adjust; ids are
// the `id` field in curated.js.
const ROLES = [
  { slug: 'ai-engineer',       label: 'AI Engineer',
    ids: ['parley','crossbridge','constellation','praxis','verifyai','tutormind','promptforge','grimoire'] },
  { slug: 'ml-engineer',       label: 'ML Engineer',
    ids: ['salarium','glyph','driftwatch','lineageiq','churnlens','tf-digits','privacyprism','consensusgraph'] },
  { slug: 'data-engineer',     label: 'Data Engineer',
    ids: ['tideline','driftwatch','lineageiq','customer-data-bridge','privacyprism','churnlens','batchline'] },
  { slug: 'full-stack',        label: 'Full-stack Engineer',
    ids: ['quickresume','ilaaj-saathi','mediguard','nishaani','pulse','shift','floatline','atlas'] },
  { slug: 'backend',           label: 'Backend Engineer',
    ids: ['tessera','parley','crossbridge','customer-data-bridge','autoredteam','privacyprism','aqueduct'] },
  { slug: 'frontend',          label: 'Frontend Engineer',
    ids: ['touchline','famous','cadence','superhero','portfolio','atlas','consensusgraph'] },
  { slug: 'security',          label: 'Security Engineer',
    ids: ['autoredteam','verifyai','privacyprism','privateledger'] },
  { slug: 'forward-deployed',  label: 'Forward Deployed Engineer',
    ids: ['customer-data-bridge','nishaani','mend','fieldfix','batchline','agromind'] }
];

function hashToken(slug) {
  const crypto = require('crypto');
  return crypto.createHash('sha1').update(SALT + ':' + slug).digest('base64url').replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
}

module.exports = ROLES.map(function (r) {
  return Object.assign({}, r, { token: hashToken(r.slug) });
});
