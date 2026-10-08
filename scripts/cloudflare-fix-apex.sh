#!/usr/bin/env bash
# Repoints the apex stakereloadxs.com at the Pages project and checks that both
# hostnames are attached to it. Dry-run by default; pass --apply to change anything.
#
# Required env:
#   CLOUDFLARE_TOKEN   API token with Zone:DNS:Edit and Account:Cloudflare Pages:Edit
#   CF_ACCOUNT_ID      Cloudflare account ID
#   CF_ZONE_ID         Zone ID for stakereloadxs.com
#
# Why: the apex CNAME points at a per-deployment host (095715b7.xs-web-2yp.pages.dev)
# instead of the project host (xs-web-2yp.pages.dev) that www uses, and the apex
# returns HTTP 522 from Cloudflare while www does not.
set -euo pipefail

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

: "${CLOUDFLARE_TOKEN:?CLOUDFLARE_TOKEN is not set}"
: "${CF_ACCOUNT_ID:?CF_ACCOUNT_ID is not set}"
: "${CF_ZONE_ID:?CF_ZONE_ID is not set}"

PROJECT="xs-web"
APEX="stakereloadxs.com"
WWW="www.stakereloadxs.com"
TARGET="${PROJECT}-2yp.pages.dev"
API="https://api.cloudflare.com/client/v4"

cf() {
  curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" -H "Content-Type: application/json" "$@"
}

say() { printf '%s\n' "$*"; }
mode=$([[ $APPLY -eq 1 ]] && echo APPLY || echo DRY-RUN)
say "== Cloudflare apex fix ($mode) =="

# 1. Pages project must exist.
cf "${API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}" | jq -e '.success' >/dev/null \
  || { say "ERROR: Pages project '${PROJECT}' not found in account"; exit 1; }
say "OK    Pages project '${PROJECT}' exists"

# 2. Both hostnames attached to the project.
domains_json=$(cf "${API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}/domains")
for host in "$APEX" "$WWW"; do
  if jq -e --arg h "$host" '.result[] | select(.name == $h)' <<<"$domains_json" >/dev/null; then
    say "OK    ${host} attached to project"
  elif [[ $APPLY -eq 1 ]]; then
    cf -X POST "${API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}/domains" \
      --data "$(jq -n --arg n "$host" '{name:$n}')" >/dev/null
    say "FIXED ${host} attached to project"
  else
    say "TODO  ${host} is NOT attached to project (run with --apply)"
  fi
done

# 3. Apex CNAME must point at the project host, proxied.
records=$(cf "${API}/zones/${CF_ZONE_ID}/dns_records?name=${APEX}")
apex_cname=$(jq -c '[.result[] | select(.type == "CNAME")][0] // empty' <<<"$records")
conflicting=$(jq -r '[.result[] | select(.type == "A" or .type == "AAAA")] | length' <<<"$records")

if [[ "$conflicting" -gt 0 ]]; then
  say "ERROR: ${APEX} has ${conflicting} A/AAAA record(s); remove them before a CNAME can apply"
  exit 1
fi

if [[ -n "$apex_cname" ]]; then
  current=$(jq -r '.content' <<<"$apex_cname")
  rec_id=$(jq -r '.id' <<<"$apex_cname")
  if [[ "$current" == "$TARGET" ]] && [[ "$(jq -r '.proxied' <<<"$apex_cname")" == "true" ]]; then
    say "OK    apex CNAME already -> ${TARGET} (proxied)"
  elif [[ $APPLY -eq 1 ]]; then
    cf -X PATCH "${API}/zones/${CF_ZONE_ID}/dns_records/${rec_id}" \
      --data "$(jq -n --arg c "$TARGET" '{type:"CNAME", name:"stakereloadxs.com", content:$c, proxied:true, ttl:1}')" >/dev/null
    say "FIXED apex CNAME ${current} -> ${TARGET} (proxied)"
  else
    say "TODO  apex CNAME is ${current}; change to ${TARGET} (run with --apply)"
  fi
else
  if [[ $APPLY -eq 1 ]]; then
    cf -X POST "${API}/zones/${CF_ZONE_ID}/dns_records" \
      --data "$(jq -n --arg c "$TARGET" '{type:"CNAME", name:"stakereloadxs.com", content:$c, proxied:true, ttl:1}')" >/dev/null
    say "FIXED apex CNAME created -> ${TARGET} (proxied)"
  else
    say "TODO  no apex CNAME exists; create one -> ${TARGET} (run with --apply)"
  fi
fi

# 4. Report only: DMARC must be a single TXT record, or receivers ignore it (RFC 7489).
dmarc_count=$(cf "${API}/zones/${CF_ZONE_ID}/dns_records?type=TXT&name=_dmarc.${APEX}" | jq '.result | length')
if [[ "$dmarc_count" -gt 1 ]]; then
  say "WARN  ${dmarc_count} _dmarc TXT records exist; consolidate to one (not changed by this script)"
else
  say "OK    _dmarc TXT record count: ${dmarc_count}"
fi

say "== done =="
