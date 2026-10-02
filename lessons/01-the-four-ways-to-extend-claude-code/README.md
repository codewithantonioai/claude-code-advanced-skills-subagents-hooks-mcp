# Lesson 1 · The four ways to extend Claude Code

▶ [Watch this lesson](https://youtu.be/IOEbHsLxilc?t=0) (starts at 0:00)

## Goal

Lesson one. The four ways to extend Claude Code, and where each one plugs in.

## Commands and files (as shown in the video)

### Terminal · build app

```bash
# ❯ Build a small reading list web app in this folder. Node.js with no dependencies: server.js uses node:http
# to serve public/index.html and a JSON API (GET /api/books, POST /api/books, PATCH /api/books/:id to mark a
# book as read, DELETE /api/books/:id). Store the books in data/books.json. Plain HTML, CSS and JavaScript
# for the page, dark theme. Add a few tests with node --test. Keep it small.
```

## Recap

So: there are four extension points. Each one plugs into a different part of the loop. And you add them when you feel the need. Let's start with the most flexible one, skills.
