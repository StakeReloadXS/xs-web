# Runbook: Cloudflare deploy, DNS and secrets

Production runs on Cloudflare Pages (project `xs-web`) for `stakereloadxs.com` and `www.stakereloadxs.com`. The GitHub Pages setup is retired.

## 1. Normal deploy

- **Trigger:** push to `main`, or run the `Deploy to Cloudflare Pages` workflow manually (`workflow_dispatch`).
- **Workflow:** `.github/workflows/deploy-cloudflare.yml`.
- **What gets published:** an explicit allowlist copied into `_site/`: the HTML pages, `robots.txt`, `sitemap.xml`, `_headers`, `assets/`, `data/` and `functions/`. Scripts, workflows, tests, docs and `wrangler.toml` are never published. Add new public files to the `cp` list in that workflow, or they will not deploy.
- **Tooling:** Node 22 and `wrangler@4`, run as `wrangler pages deploy _site --project-name=xs-web --branch=main`.
- **Concurrency:** deploys are serialised (`deploy-cloudflare-pages` group, no cancel-in-progress).

### Secrets used by the deploy

| Repository secret | Used as | Purpose |
|---|---|---|
| `CLOUDFLARE_TOKEN` | `CLOUDFLARE_API_TOKEN` | Pages deploy token |
| `CF_ACCOUNT_ID` | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account |

## 2. Apex DNS fix (manual)

- **Workflow:** `.github/workflows/cloudflare-fix-apex.yml` (`Fix apex DNS (Cloudflare)`).
- **Script:** `scripts/cloudflare-fix-apex.sh`. It repoints the apex `stakereloadxs.com` at the Pages project and attaches both hostnames. It runs read-only checks first and changes nothing if a check fails. MX, SPF, DKIM and DMARC are read for reporting but never written.
- **Dry run by default.** Leave the `apply` input unchecked to see the plan. Tick it to apply.
- **Guardrails:** the job only runs when the ref is `main`, so a branch cannot edit the script and use the production token. It uses the `production-dns` environment; configure required reviewers on that environment in repo settings to gate applies.

### Secrets used by the DNS fix

| Repository secret | Mapped to env var | Purpose |
|---|---|---|
| `CLOUDFLARE_TOKEN` | `CF_TOKEN` | API token with Zone DNS Edit and Pages Edit |
| `CF_ACCOUNT_ID` | `CF_ACCOUNT_ID` | Cloudflare account |
| `CF_ZONE_ID` | `CF_ZONE_ID` | Zone for `stakereloadxs.com` |

The script expects `CF_TOKEN`, not `CLOUDFLARE_TOKEN`. The mapping lives in the workflow `env:` block. Keep it there when editing either file.

## 3. Order intake settings (Pages dashboard)

Workers & Pages → `xs-web` → Settings:

1. **Bindings → D1 database:** variable `DB`, database `xs-orders`. Redeploy after adding.
2. **Variables and Secrets (optional):** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Use a bot token that has not been shared before. Telegram alerts are best effort; the order is saved first.

No secret values belong in the repo or in this document.

## 4. Verifying a deploy

1. Check the workflow run is green in the Actions tab.
2. Open `https://stakereloadxs.com/` and `https://www.stakereloadxs.com/` and confirm they load.
3. Confirm `https://stakereloadxs.com/robots.txt` and `/sitemap.xml` return the expected files.
4. For order intake, submit a test order only when the owner agrees, then delete the test row from D1 (see the operator guide).

## 5. Rollback

Cloudflare Pages keeps earlier deployments. In the Pages dashboard, open the `xs-web` project, choose the last good deployment and roll back to it. Then fix the change on a branch and redeploy from `main`.

## Known gaps

- The local `CNAME` file is not part of the deploy. It is kept only for reference and can be removed in a later cleanup.
- Secret rotation has no written schedule. Owner to decide.
