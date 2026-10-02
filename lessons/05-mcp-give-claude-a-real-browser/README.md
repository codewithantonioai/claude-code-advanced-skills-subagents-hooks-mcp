# Lesson 5 · MCP: give Claude a real browser

▶ [Watch this lesson](https://youtu.be/IOEbHsLxilc?t=861) (starts at 14:21)

## Goal

Lesson five. MCP, and how to give Claude a real browser.

## Commands and files (as shown in the video)

### Terminal · terminal install browser

```bash
npx @playwright/mcp@latest install-browser chrome-for-testing
```

### Terminal · terminal mcp add

```bash
claude mcp add --scope project playwright -- npx -y @playwright/mcp@latest --headless --browser chromium
```

## Recap

So: MCP gives Claude new tools, through a server. Use scope project, and it goes in dot M C P dot json for the whole team. And approve only the servers you trust. Now, let's put all four pieces to work at once.
