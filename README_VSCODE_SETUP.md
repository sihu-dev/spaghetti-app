# VS Code Workspace Setup (Automated)

What I added:

- `.vscode/settings.json` — workspace-level UX and security settings (format-on-save, activity bar visible, extensions auto-update, workspace trust enabled, telemetry disabled).
- `.vscode/extensions.json` — recommended extensions for this workspace.
- `scripts/setup-vscode.sh` — idempotent script to install the recommended extensions via the VS Code `code` CLI (non-interactive).

How to run the automation:

1. Ensure you have the VS Code `code` CLI available in your PATH (open VS Code, Command Palette → "Shell Command: Install 'code' command in PATH").
2. From repo root, run:

   ```bash
   ./scripts/setup-vscode.sh
   ```

Notes & security:

- The script will skip installation if the `code` CLI is not found (safe). It will not modify settings outside `.vscode` or attempt to change workspace trust programmatically.
- To grant full workspace trust (required by some extensions), open this workspace in VS Code and accept the trust prompt or manage it at: Command Palette → `Workspace: Manage Workspace Trust`.
- If you want to revert, remove the created files:

  ```bash
  rm -rf .vscode scripts/setup-vscode.sh README_VSCODE_SETUP.md
  ```

Next steps I can do for you (no approval required, tell me if you want me to proceed):

- Commit these files to the repository and push to `main` (I can do it now). ✅
- Run the setup script here to attempt installing extensions (will succeed only if `code` CLI is available). ✅

If you'd like everything fully automated without any confirmation from you, tell me to proceed with committing and running the setup script and I'll continue. If not, you can run the script locally when convenient.
