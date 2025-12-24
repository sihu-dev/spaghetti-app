# 🍝 SPAGHETTI Claude Code Configuration

## Configuration Overview

This directory contains production-grade Claude Code settings optimized for full-stack development.

### Files

- **settings.json** - Team-wide shared settings (committed to git)
- **settings.local.json** - Local machine-specific overrides (git-ignored)
- **hooks/** - Automation scripts for code quality

## Permission Model

### Default Mode: `acceptEdits`
Automatically accepts file edits within your session for faster development workflow.

### Allowed Operations
- ✅ All npm/node/yarn/pnpm commands
- ✅ Git operations (commit, push, pull)
- ✅ File reading (all files)
- ✅ Editing source files in /src, /packages, /public
- ✅ Safe bash commands (ls, grep, find, cat)

### Requires Confirmation
- ⚠️ Network operations (curl, wget)
- ⚠️ Docker commands
- ⚠️ File deletion (rm)
- ⚠️ Package.json and tsconfig.json edits
- ⚠️ Environment file edits

### Denied Operations
- ❌ Reading .env files
- ❌ Reading secrets directory
- ❌ Reading AWS/SSH credentials
- ❌ Dangerous commands (rm -rf, dd, mkfs, shutdown)

## Model Configuration

**Primary Model**: `claude-opus-4-5-20251101` (Claude Opus 4.5)
- Latest frontier model for production-level code generation
- Optimal for complex full-stack architecture tasks

## Performance Settings

- **Max Output Tokens**: 4096
- **Bash Timeout**: 30s (default), 120s (max)
- **Prompt Caching**: Enabled (improves speed)
- **Max Thinking Tokens**: 10,000

## Hooks

### Post-Edit/Write Hook
Automatically formats code after file changes:
- TypeScript/JavaScript → Prettier
- JSON → jq formatting

**Script**: `.claude/hooks/format-and-lint.sh`

### Pre-Bash Hook
Validates commands before execution:
- Blocks dangerous patterns
- Warns about risky operations

**Script**: `.claude/hooks/validate-command.sh`

### Session End Hook
Displays session summary with git status

**Script**: `.claude/hooks/session-summary.sh`

## Security Features

1. **Sandbox Mode**: Enabled for production safety
2. **Secret Protection**: Automatic denial of .env and credential access
3. **Command Validation**: Pre-execution validation of bash commands
4. **Network Control**: Local binding allowed, external requests require confirmation

## IDE Integration

### VS Code
Settings configured in `.vscode/settings.json`:
- Claude Code extension settings
- Auto-formatting on save
- ESLint integration
- Prettier as default formatter

Recommended extensions listed in `.vscode/extensions.json`

## Attribution

All commits and PRs include:
```
🍝 Generated with Claude Code

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Cleanup

Session data automatically cleaned after **30 days**.

## Support

For issues or questions:
- [Claude Code Documentation](https://code.claude.com/docs)
- [GitHub Issues](https://github.com/anthropics/claude-code/issues)
