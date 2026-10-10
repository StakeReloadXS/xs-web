# XS product guides

Guides for the XS product family, as listed in issue #42. Each section gives what the issue states about the product and what is still missing. Nothing here was checked against the product repositories, which are not part of this repo.

Every `[OWNER TO CONFIRM]` marker is a fact the repo does not contain. Fill these in from each product's own repository before the guide is treated as complete.

| Product | Runtime | Repository | Status |
|---|---|---|---|
| xs-chrome | Chrome extension | [OWNER TO CONFIRM] | [OWNER TO CONFIRM] |
| xs-npm | npm command-line runtime | [OWNER TO CONFIRM] | [OWNER TO CONFIRM] |
| xs-electron | Cross-platform desktop app | [OWNER TO CONFIRM] | [OWNER TO CONFIRM] |
| xs-serv | Server runtime | [OWNER TO CONFIRM] | [OWNER TO CONFIRM] |
| xs-telegram | Telegram runtime SDK | [OWNER TO CONFIRM] | [OWNER TO CONFIRM] |
| xs-web | Web storefront | `StakeReloadXS/xs-web` (this repo) | Live. See [`README.md`](../README.md) |
| xs-sdk | SDK runtime | [OWNER TO CONFIRM] | [OWNER TO CONFIRM] |

## xs-chrome

**What it is:** XS Chrome extension runtime.

**Guide**

- **Install:** [OWNER TO CONFIRM] Store listing or unpacked install steps.
- **Setup and sign-in:** [OWNER TO CONFIRM] Required account, XSID or settings.
- **Usage:** [OWNER TO CONFIRM] Main workflow and supported sites.
- **Roadmap:** [OWNER TO CONFIRM] Planned changes.
- **Support:** [OWNER TO CONFIRM] Support channel.

## xs-npm

**What it is:** XS npm command runtime.

**Guide**

- **Install:** [OWNER TO CONFIRM] Package name and install command.
- **Commands:** [OWNER TO CONFIRM] Command list and what each one does.
- **Configuration:** [OWNER TO CONFIRM] Config file or environment variables, without secret values.
- **Roadmap:** [OWNER TO CONFIRM] Planned changes.
- **Support:** [OWNER TO CONFIRM] Support channel.

## xs-electron

**What it is:** XS cross-platform app runtime.

**Guide**

- **Install:** [OWNER TO CONFIRM] Supported platforms and installer locations.
- **First run:** [OWNER TO CONFIRM] Sign-in and initial setup.
- **Usage:** [OWNER TO CONFIRM] Main workflow.
- **Updates:** [OWNER TO CONFIRM] How updates are delivered.
- **Support:** [OWNER TO CONFIRM] Support channel.

## xs-serv

**What it is:** XS server runtime.

**Guide**

- **Requirements:** [OWNER TO CONFIRM] Host, OS and resource requirements.
- **Deploy:** [OWNER TO CONFIRM] Deploy steps and configuration.
- **Operate:** [OWNER TO CONFIRM] Start, stop, logs and health checks.
- **Security:** [OWNER TO CONFIRM] Secrets handling and network exposure.
- **Support:** [OWNER TO CONFIRM] Support channel.

## xs-telegram

**What it is:** XS Telegram runtime SDK.

**Guide**

- **Install:** [OWNER TO CONFIRM] Package name and install command.
- **Bot setup:** [OWNER TO CONFIRM] How a bot token is created and supplied. Do not put tokens in the guide.
- **Usage:** [OWNER TO CONFIRM] Main API entry points and a minimal example.
- **Support:** [OWNER TO CONFIRM] Support channel.

## xs-web

**What it is:** XS web storefront, hosted at `stakereloadxs.com` on Cloudflare Pages.

**Guide**

- **Pages:** `index`, `products`, `offers`, `order`, `success`, `support`, `team`. See the sitemap in `sitemap.xml`.
- **Catalog:** edit `data/products.json`, commit, and the site redeploys.
- **Orders:** see [`operator-guide.md`](operator-guide.md) for how orders are read and handled.
- **Deploy and DNS:** see [`runbook.md`](runbook.md).
- **Tests:** run `npm test` in `tests/` before merging.

## xs-sdk

**What it is:** SDK runtime for XS.

**Guide**

- **Install:** [OWNER TO CONFIRM] Package name and install command.
- **Quick start:** [OWNER TO CONFIRM] Minimal example.
- **API reference:** [OWNER TO CONFIRM] Link or generated reference.
- **Versioning:** [OWNER TO CONFIRM] Release and compatibility policy.
- **Support:** [OWNER TO CONFIRM] Support channel.
