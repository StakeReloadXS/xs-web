#!/usr/bin/env bash
# Repoints the apex stakereloadxs.com at the Pages project and checks that both
# hostnames are attached and active. Dry-run by default; pass --apply to change anything.
#
# Required env:
#   CLOUDFLARE_TOKEN   API token with Zone:DNS:Edit and Account:Cloudflare Pages:Edit
#   CF_ACCOUNT_ID      Cloudflare account ID
#   CF_ZONE_ID         Zone ID for stakereloadxs.com
#
# All read-only checks run before any change. If a check fails, nothing is modified.
# Only the apex and www attachments and the apex web CNAME are ever written. MX, SPF,
# DKIM and DMARC records are read for reporting and never changed.
set -euo pipefail

APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

: "${CLOUDFLARE_TOKEN:?CLOUDFLARE_TOKEN is not set}"
: "${CF_ACCOUNT_ID:?CF_ACCOUNT_ID is not set}"
: "${CF_ZONE_ID:?CF_ZONE_ID is not set}"

PROJECT="xs-web"
APEX="stakereloadxs.com"
WWW="www.stakereloadxs.com"
API="https://api.cloudflare.com/client/v4"

# cf METHOD URL [JSON_BODY] -> prints the response body. Exits with Cloudflare's own
# error message when success is not true, so auth and scope problems are visible.
cf() {
  local method=$1 url=$2 body=${3:-}
  local args=(-sS -X "$method" -H "Authorization: Bearer ${CLOUDFLARE_TOKEN}" -H "Content-Type: application/json" "$url")
  [[ -n "$body" ]] && args+=(--data "$body")
  local resp
  resp=$(curl "${args[@]}") || { echo "ERROR: request failed: ${method} ${url}" >&2; exit 1; }
  if ! jq -e '.success == true' <<<"$resp" >/dev/null 2>&1; then
    local msg
    msg=$(jq -r '[.errors[]?.message] | if length == 0 then "unknown error" else join("; ") end' <<<"$resp" 2>/dev/null || echo "unparseable response")
    echo "ERROR: Cloudflare API ${method} ${url#"$API"}: ${msg}" >&2
    exit 1
  fi
  printf '%s' "$resp"
}

say() { printf '%s\n' "$*"; }
mode=$([[ $APPLY -eq 1 ]] && echo APPLY || echo DRY-RUN)
say "== Cloudflare apex fix (${mode}) =="

# ---- Read-only checks. Nothing is changed in this section. ----

project=$(cf GET "${API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}")
TARGET=$(jq -r '.result.subdomain // empty' <<<"$project")
[[ -n "$TARGET" ]] || { say "ERROR: Pages project '${PROJECT}' returned no subdomain"; exit 1; }
say "OK    Pages project '${PROJECT}' is served at ${TARGET}"

domains=$(cf GET "${API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}/domains")
records=$(cf GET "${API}/zones/${CF_ZONE_ID}/dns_records?name=${APEX}&per_page=100")

ac_count=$(jq '[.result[] | select(.type == "A" or .type == "AAAA")] | length' <<<"$records")
if [[ "$ac_count" -gt 0 ]]; then
  say "ERROR: ${APEX} has ${ac_count} A/AAAA record(s); remove them before a CNAME can apply. No changes made."
  exit 1
fi
cname_count=$(jq '[.result[] | select(.type == "CNAME")] | length' <<<"$records")
if [[ "$cname_count" -gt 1 ]]; then
  say "ERROR: ${APEX} has ${cname_count} CNAME records; resolve manually. No changes made."
  exit 1
fi

attach_list=()
for host in "$APEX" "$WWW"; do
  status=$(jq -r --arg h "$host" '[.result[] | select(.name == $h)][0].status // "missing"' <<<"$domains")
  case "$status" in
    active)  say "OK    ${host} attached and active" ;;
    missing) attach_list+=("$host"); say "TODO  ${host} is not attached to the project" ;;
    *)       say "WARN  ${host} is attached with status '${status}'; check the Pages dashboard (not changed)" ;;
  esac
done

apex_cname=$(jq -c '[.result[] | select(.type == "CNAME")][0] // empty' <<<"$records")
dns_action="create"
if [[ -n "$apex_cname" ]]; then
  current=$(jq -r '.content' <<<"$apex_cname")
  proxied=$(jq -r '.proxied' <<<"$apex_cname")
  if [[ "$current" == "$TARGET" && "$proxied" == "true" ]]; then
    dns_action="none"
    say "OK    apex CNAME already -> ${TARGET} (proxied)"
  else
    dns_action="patch"
    say "TODO  apex CNAME is ${current}; change to ${TARGET} (proxied)"
  fi
else
  say "TODO  no apex CNAME exists; create one -> ${TARGET} (proxied)"
fi

dmarc_count=$(cf GET "${API}/zones/${CF_ZONE_ID}/dns_records?type=TXT&name=_dmarc.${APEX}&per_page=100" | jq '.result | length')
if [[ "$dmarc_count" -gt 1 ]]; then
  say "WARN  ${dmarc_count} _dmarc TXT records exist; consolidate to one (not changed by this script)"
else
  say "OK    _dmarc TXT record count: ${dmarc_count}"
fi

if [[ $APPLY -eq 0 ]]; then
  say "== dry run: nothing changed. Re-run with --apply to make the TODO changes. =="
  exit 0
fi

# ---- Changes. Reached only with --apply, after all checks passed. ----

for host in ${attach_list[@]+"${attach_list[@]}"}; do
  cf POST "${API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${PROJECT}/domains" \
    "$(jq -n --arg n "$host" '{name: $n}')" >/dev/null
  say "FIXED ${host} attached to project"
done

# Attaching a domain can create its DNS record, so re-read before writing the CNAME.
if [[ ${#attach_list[@]} -gt 0 ]]; then
  records=$(cf GET "${API}/zones/${CF_ZONE_ID}/dns_records?name=${APEX}&per_page=100")
  apex_cname=$(jq -c '[.result[] | select(.type == "CNAME")][0] // empty' <<<"$records")
  if [[ -z "$apex_cname" ]]; then
    dns_action="create"
  elif [[ "$(jq -r '.content' <<<"$apex_cname")" == "$TARGET" && "$(jq -r '.proxied' <<<"$apex_cname")" == "true" ]]; then
    dns_action="none"
  else
    dns_action="patch"
  fi
fi

payload=$(jq -n --arg c "$TARGET" '{type: "CNAME", name: "stakereloadxs.com", content: $c, proxied: true, ttl: 1}')
case "$dns_action" in
  none)   say "OK    apex CNAME unchanged" ;;
  patch)
    rec_id=$(jq -r '.id' <<<"$apex_cname")
    cf PATCH "${API}/zones/${CF_ZONE_ID}/dns_records/${rec_id}" "$payload" >/dev/null
    say "FIXED apex CNAME -> ${TARGET} (proxied)" ;;
  create)
    cf POST "${API}/zones/${CF_ZONE_ID}/dns_records" "$payload" >/dev/null
    say "FIXED apex CNAME created -> ${TARGET} (proxied)" ;;
esac

say "== done =="
