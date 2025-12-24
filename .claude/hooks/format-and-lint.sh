#!/bin/bash
set -e

# Extract file path from tool input
file_path=$(jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")
if [ -z "$file_path" ]; then
  exit 0
fi

# Format TypeScript/JavaScript files
if [[ "$file_path" =~ \.(ts|tsx|js|jsx)$ ]]; then
  if command -v npx &> /dev/null && [ -f "package.json" ]; then
    npx prettier --write "$file_path" 2>/dev/null || true
    echo "✓ Formatted TypeScript/JavaScript: $file_path"
  fi
fi

# Format JSON files
if [[ "$file_path" =~ \.json$ ]]; then
  if command -v jq &> /dev/null; then
    jq . "$file_path" > "${file_path}.tmp" && mv "${file_path}.tmp" "$file_path" 2>/dev/null || true
    echo "✓ Formatted JSON: $file_path"
  fi
fi

exit 0
