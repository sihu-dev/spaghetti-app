# Husky Pre-commit Hooks Setup

This directory contains Git hooks managed by Husky for the SPAGHETTI app.

## What's Configured

The pre-commit hook runs **lint-staged** which will:

1. **For TypeScript files in backend/** (`backend/**/*.ts`):
   - Run ESLint with auto-fix (`npm run lint:fix`)
   - Run TypeScript type checking (`npm run typecheck`)

2. **For all supported files** (`*.{ts,js,json,md,yml,yaml}`):
   - Format with Prettier

## Installation

After cloning the repository or adding this configuration, run:

```bash
npm install
```

This will:
1. Install husky and lint-staged packages
2. Set up Git hooks path to `.husky` directory
3. Make the pre-commit hook executable

## Manual Setup (if npm install doesn't work)

If you need to set up hooks manually:

```bash
# Install dependencies
npm install

# Configure git hooks path
git config core.hooksPath .husky

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/_/husky.sh
```

## Testing the Hook

To test if the pre-commit hook works:

```bash
# Make a change to a TypeScript file
echo "// test" >> backend/src/index.ts

# Try to commit
git add backend/src/index.ts
git commit -m "test: verify pre-commit hook"
```

The hook should run ESLint, type-check, and Prettier before allowing the commit.

## Bypassing Hooks (Emergency Only)

If you need to bypass the pre-commit hook in an emergency:

```bash
git commit --no-verify -m "emergency commit"
```

**Note:** Use this sparingly as it defeats the purpose of automated code quality checks.

## Troubleshooting

### Hook not running
- Verify git hooks path: `git config core.hooksPath`
- Should return `.husky`
- If not, run: `git config core.hooksPath .husky`

### Permission errors
- Make hooks executable: `chmod +x .husky/pre-commit .husky/_/husky.sh`

### ESLint or TypeScript errors
- The hook will prevent commits if there are linting or type errors
- Fix the errors or use `--no-verify` flag (not recommended)
