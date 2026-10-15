#!/usr/bin/env bash
# Baixa as 7 skills de design para .claude/skills/ deste projeto.
set -e
cd "$(dirname "$0")"
D=.claude/skills
mkdir -p "$D"
TMP=$(mktemp -d)

pegar () { # repo pasta nome
  local repo="$1" pasta="$2" nome="$3"
  local alvo="$TMP/$(echo "$repo" | tr '/' '_')"
  [ -d "$alvo" ] || git clone -q --depth 1 "https://github.com/$repo" "$alvo"
  if [ -d "$alvo/$pasta" ]; then
    rm -rf "$D/$nome"; mkdir -p "$D/$nome"
    cp -r "$alvo/$pasta"/. "$D/$nome/"
    for l in LICENSE LICENSE.md LICENSE.txt; do [ -f "$alvo/$l" ] && cp "$alvo/$l" "$D/$nome/" && break; done
    echo "ok: $nome"
  else
    echo "nao encontrei: $repo/$pasta"
  fi
}

pegar Leonxlnx/taste-skill skills/taste-skill design-taste-frontend
pegar pbakaus/impeccable .claude/skills/impeccable impeccable
pegar emilkowalski/skills skills/emil-design-eng emil-design-eng
pegar anthropics/skills skills/frontend-design frontend-design
pegar bear2u/my-skills skills/landing-page-guide-v2 landing-page-guide-v2
pegar coreyhaines31/marketingskills skills/copywriting copywriting
pegar vercel-labs/agent-skills skills/web-design-guidelines web-design-guidelines

find "$D/landing-page-guide-v2" -name "*.png" -delete 2>/dev/null || true
rm -rf "$TMP"
echo "Pronto. Skills em $D"
