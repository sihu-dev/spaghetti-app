#!/usr/bin/env bash
set -euo pipefail
EXTS_FILE="$HOME/.vscode/extensions.json"
if [[ ! -f "$EXTS_FILE" ]]; then
  echo "No extensions.json found at $EXTS_FILE" >&2
  exit 1
fi
if ! command -v code >/dev/null 2>&1; then
  echo "VS Code CLI 'code' not found; skipping extension install" >&2
  exit 0
fi
jq -r '.[]' "$EXTS_FILE" | while read -r ext; do
  if code --list-extensions | grep -q "^$ext$"; then
    echo "Extension '$ext' already installed"
  else
    echo "Installing extension: $ext"
    code --install-extension "$ext" --force || echo "Failed to install $ext"
  fi
done
