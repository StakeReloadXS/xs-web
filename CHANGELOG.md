# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow `VERSION.md`.

## [Unreleased]

### Added

- `POST /api/payment/create` (Pages Function): opens a hosted CCPayment checkout for a cart and returns its payment URL. Prices are recomputed from the catalog. It returns 503 until `CCPAYMENT_APP_ID`, `CCPAYMENT_APP_SECRET` and `CCPAYMENT_API_BASE` are set. The provider call is not yet verified against the sandbox API.
- "Pay now" button on the order page. It is hidden unless `checkoutEnabled` is set to `true` in `assets/js/config.js`, which stays `false`.

## [1.0.0] - 2026-10-12

### Added

- Essential repository files: `LICENSE`, `CLAUDE.md`, `AGENTS.md`, `VERSION.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `.gitignore`, and `.claude` session setup.
