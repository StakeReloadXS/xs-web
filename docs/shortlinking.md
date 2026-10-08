# Shortlinking (research notes)

Goal: short links on our own domain (e.g. `go.stakereloadxs.com/abc`). The site is static on Cloudflare Pages with a Pages Function + D1 for order intake, so Cloudflare-native options fit best.

Candidates and tradeoffs are in the PR comment. Short list:

1. **Sink** (Cloudflare Workers/Pages + KV + Analytics Engine) - lowest ops, free tier friendly.
2. **Shlink** (PHP, REST API, multi-domain) - most featureful if we accept a server/container.
3. **YOURLS / Kutt** - fallbacks.

Nothing is implemented yet; this branch is the working space for the integration.
