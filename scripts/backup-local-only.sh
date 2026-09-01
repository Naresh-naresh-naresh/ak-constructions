#!/usr/bin/env bash
#
# Archive the AK-project files that exist ONLY on this laptop.
#
# Everything else — code, full history, deployments, DNS — already lives in
# personal accounts and needs no backup. This covers the gap.
#
# Deliberately does NOT copy ~/.ssh/id_ed25519. Copying a private key into a
# tarball is worse than not having a backup of it: the key is trivially
# replaceable (generate a new one, add it to GitHub) whereas a leaked copy is
# not revocable from wherever it ended up. Only ssh/config is included, so the
# `github-personal` Host alias can be recreated.
#
# Deliberately EXCLUDES employer material that happens to sit in this repo:
# .claude/skills/freshservice-api/ (internal Freshworks API references) and
# OnCall_Roster.xlsx (colleagues' contact details). Those belong to Freshworks.
#
# The archive still contains live production secrets from .env.local. Encrypt it
# and put it in a password manager — not cloud storage, not email.
#
# Usage: bash scripts/backup-local-only.sh [output-dir]

set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$HOME/Desktop}"
STAMP="$(date +%Y%m%d)"
STAGE="$(mktemp -d)"
NAME="ak-constructions-local-$STAMP"
DEST="$STAGE/$NAME"
CLAUDE_DIR="$HOME/.claude/projects/-Users-nvellingiri-Documents-Aws-end-to-end-project-ak-constructions"

mkdir -p "$DEST"/{secrets,claude}

echo "==> gitignored project files"
if [ -f "$REPO/.env.local" ]; then
  cp "$REPO/.env.local" "$DEST/secrets/env.local"
  echo "    .env.local"
fi
if [ -f "$REPO/.claude/settings.local.json" ]; then
  cp "$REPO/.claude/settings.local.json" "$DEST/secrets/settings.local.json"
  echo "    .claude/settings.local.json"
fi

echo "==> ssh config (alias only, no keys)"
if [ -f "$HOME/.ssh/config" ]; then
  mkdir -p "$DEST/ssh"
  cp "$HOME/.ssh/config" "$DEST/ssh/config"
  echo "    config"
fi

echo "==> Claude memory for this project"
if [ -d "$CLAUDE_DIR/memory" ]; then
  cp -R "$CLAUDE_DIR/memory" "$DEST/claude/"
  echo "    $(find "$CLAUDE_DIR/memory" -type f | wc -l | tr -d ' ') files"
fi

echo "==> Claude transcripts (the decision history)"
if compgen -G "$CLAUDE_DIR/"*.jsonl > /dev/null; then
  mkdir -p "$DEST/claude/transcripts"
  cp "$CLAUDE_DIR/"*.jsonl "$DEST/claude/transcripts/"
  echo "    $(find "$DEST/claude/transcripts" -type f | wc -l | tr -d ' ') files"
fi

cat > "$DEST/README.txt" <<'TXT'
AK Constructions — files that existed only on the Freshworks laptop.

CONTAINS LIVE PRODUCTION SECRETS (secrets/env.local). Encrypt before storing.

RESTORING
  secrets/env.local            -> repo root as .env.local, then set
                                  NEXTAUTH_URL=http://localhost:3005
                                  (Vercel's copy holds the production URL;
                                  leaving it breaks local login.)
  secrets/settings.local.json  -> .claude/settings.local.json
  claude/memory                -> plain markdown, readable with no tooling
  claude/transcripts           -> full session history as JSONL

SSH ACCESS TO GITHUB
  No private key is in this archive, on purpose. On the new machine:
    ssh-keygen -t ed25519 -C "nareshvellingiribvn@gmail.com"
    gh ssh-key add ~/.ssh/id_ed25519.pub
  ssh/config shows the `github-personal` Host alias the repo remote uses. You
  can also just switch the remote to a plain github.com URL.

AUTHORITATIVE COPY OF THE SECRETS
  Vercel, not this archive:  vercel env pull .env.local
  Treat this file as the fallback for when you no longer have Vercel open.

NOT INCLUDED ON PURPOSE
  Freshworks internal material in the repo:
  .claude/skills/freshservice-api/, OnCall_Roster.xlsx

The project's own durable context is in the repo, not here:
docs/HANDOVER.md, and the git commit messages.
TXT

ARCHIVE="$OUT/$NAME.tar.gz"
tar -czf "$ARCHIVE" -C "$STAGE" "$NAME"
rm -rf "$STAGE"

echo
echo "Done: $ARCHIVE  ($(du -h "$ARCHIVE" | cut -f1))"
echo
echo "Now encrypt it — it holds production secrets:"
echo "  zip -e $OUT/$NAME.zip $ARCHIVE && rm $ARCHIVE"
