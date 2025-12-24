#!/bin/bash

# Extract command from tool input
command_text=$(jq -r '.tool_input.command // empty' 2>/dev/null || echo "")

# Block dangerous patterns
if [[ "$command_text" =~ ^(rm -rf|dd|mkfs|shutdown|reboot|:(){ :|:&};:) ]]; then
  echo "✗ Blocked potentially dangerous command: $command_text"
  exit 2
fi

# Warn about risky operations
if [[ "$command_text" =~ ^rm ]]; then
  echo "⚠ Allowing deletion command (requires confirmation): $command_text"
fi

echo "✓ Command validation passed"
exit 0
