# Lesson 2 · Skills: teach Claude how you work

▶ [Watch this lesson](https://youtu.be/IOEbHsLxilc?t=196) (starts at 3:16)

## Goal

Lesson two. Skills, or how to teach Claude the way you work.

## Commands and files (as shown in the video)

### `.claude/skills/api-conventions/SKILL.md` · vscode api conventions

```
---
name: api-conventions
description: API conventions for this project. Use when adding or changing endpoints in server.js.
---

When you add or change an endpoint in server.js:

- Routes live under /api and use plural nouns, like /api/books.
- Validate the request body. Reply 400 with {"error": "..."} when it's invalid.
- Errors are always JSON: {"error": "..."} with the right status code.
- POST returns 201 with the created item.
- Add a test in test/server.test.js for every new endpoint, then run npm test.
```

### Terminal · tui skill loaded

```bash
# ❯ Add an endpoint that returns reading stats: how many books there are and how many I've read.
```

### `.claude/skills/release-notes/SKILL.md` · vscode release notes

```
---
name: release-notes
description: Write release notes for the changes since the last tag
disable-model-invocation: true
---

## Commits since the last release

!`git log --oneline $(git describe --tags --abbrev=0)..HEAD`

## Instructions

Add a section for version $ARGUMENTS at the top of CHANGELOG.md
(create the file if it doesn't exist). Group the commits above under
Added, Changed and Fixed. Write one short line per change, for users,
without commit hashes. Then show me the new section.
```

### Terminal · tui release notes

```bash
# ❯ /release-notes 1.1.0
```

## Recap

So: a skill is a SKILL dot M D with a description that says when, and instructions that say how. Claude loads reference skills by itself, when they fit. And task skills with side effects are started only by you. Next, subagents.
