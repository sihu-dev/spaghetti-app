#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍝 SPAGHETTI Session Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Time: $(date)"
echo ""

if command -v git &> /dev/null; then
  echo "Git Status:"
  git status --short 2>/dev/null || echo "Not a git repository"
  echo ""
fi

echo "Session completed successfully"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
