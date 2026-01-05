#!/usr/bin/env bash
set -euo pipefail

# setup-vscode.sh
# Installs recommended VS Code extensions listed in .vscode/extensions.json
# Non-interactive; safe to run multiple times (idempotent).

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_FILE="$REPO_ROOT/.vscode/extensions.json"

if ! command -v code >/dev/null 2>&1; then
  echo "[SKIP] 'code' CLI not found in PATH. To install it: open VS Code -> Command Palette -> 'Shell Command: Install 'code' command in PATH' (or install VS Code CLI for your OS)."
  echo "You can still enable the workspace settings by opening the folder in VS Code; the .vscode/settings.json is already present."
  exit 0
fi

# Read recommendations from the json file if present
if [ -f "$EXT_FILE" ]; then
  if command -v jq >/dev/null 2>&1; then
    RECS=$(jq -r '.recommendations[]' "$EXT_FILE")
  elif command -v python3 >/dev/null 2>&1; then
    RECS=$(python3 -c "import json,sys; data=json.load(open(sys.argv[1])); print('\n'.join(data.get('recommendations',[])))" "$EXT_FILE")
  else
    echo "[WARN] 'jq' and 'python3' not found; using built-in list"
    RECS="dbaeumer.vscode-eslint esbenp.prettier-vscode eamodio.gitlens bradlc.vscode-tailwindcss ms-azuretools.vscode-docker github.vscode-pull-request-github streetsidesoftware.code-spell-checker"
  fi
else
  echo "[WARN] $EXT_FILE not found, using built-in list"
  RECS="dbaeumer.vscode-eslint esbenp.prettier-vscode eamodio.gitlens bradlc.vscode-tailwindcss ms-azuretools.vscode-docker github.vscode-pull-request-github streetsidesoftware.code-spell-checker"
fi

echo "[INFO] Installing recommended extensions..."
for ext in $RECS; do
  echo "-> Installing $ext"
  code --install-extension "$ext" --force || echo "[WARN] Failed to install $ext"
done

echo "[INFO] All done. If you see warnings, try running the script again after installing the 'code' CLI or check network access."

echo "Note: Workspace trust cannot be programmatically set; to grant full workspace trust, open the workspace in VS Code and accept the trust prompt or manage it under 'Workspace: Manage Workspace Trust'."
