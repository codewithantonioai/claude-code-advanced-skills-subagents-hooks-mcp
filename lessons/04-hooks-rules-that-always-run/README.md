# Lesson 4 · Hooks: rules that always run

▶ [Watch this lesson](https://youtu.be/IOEbHsLxilc?t=655) (starts at 10:55)

## Goal

Lesson four. Hooks, rules that always run.

## Commands and files (as shown in the video)

### `.claude/hooks/protect-files.sh` · vscode protect

```bash
#!/bin/bash
# protect-files.sh: block edits to files Claude must never touch

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

PROTECTED_PATTERNS=(".env" "data/books.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "Blocked: $FILE_PATH matches protected pattern '$pattern'" >&2
    exit 2
  fi
done

exit 0
```

### `.claude/settings.json` · vscode settings

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/protect-files.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write"
          }
        ]
      }
    ]
  }
}
```

### Terminal · terminal test hook

```bash
echo '{"tool_input":{"file_path":"data/books.json"}}' | .claude/hooks/protect-files.sh; echo "exit code: $?"
```

### Terminal · tui blocked

```bash
# ❯ Add three sample books directly to data/books.json.
```

## Recap

So: a hook is an event, a matcher, and a command. Exit two blocks the action, and tells Claude why. And you test your hooks by hand before you trust them. Next, MCP, to give Claude a tool it doesn't have.
