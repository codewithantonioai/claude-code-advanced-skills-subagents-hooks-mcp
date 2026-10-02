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
