const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const PUBLIC_DIR = path.join(__dirname, "public");
const TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
};

function createServer(dataFile = path.join(__dirname, "data", "books.json")) {
  async function load() {
    try {
      return JSON.parse(await fs.readFile(dataFile, "utf8"));
    } catch (err) {
      if (err.code === "ENOENT") return [];
      throw err;
    }
  }

  async function save(books) {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    await fs.writeFile(dataFile, JSON.stringify(books, null, 2));
  }

  async function readBody(req) {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 1e6)
        throw Object.assign(new Error("Body too large"), { status: 413 });
    }
    if (!raw.trim()) return {};
    try {
      return JSON.parse(raw);
    } catch {
      throw Object.assign(new Error("Invalid JSON"), { status: 400 });
    }
  }

  function send(res, status, body) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(body === undefined ? "" : JSON.stringify(body));
  }

  async function handleApi(req, res, url) {
    if (url.pathname === "/api/stats") {
      if (req.method !== "GET")
        return send(res, 405, { error: "Method not allowed" });
      const books = await load();
      const read = books.filter((b) => b.read).length;
      return send(res, 200, { total: books.length, read });
    }

    const match = url.pathname.match(/^\/api\/books(?:\/([^/]+))?$/);
    if (!match) return send(res, 404, { error: "Not found" });
    const id = match[1];
    const books = await load();

    if (!id && req.method === "GET") return send(res, 200, books);

    if (!id && req.method === "POST") {
      const { title, author } = await readBody(req);
      if (typeof title !== "string" || !title.trim()) {
        return send(res, 400, { error: "title is required" });
      }
      const book = {
        id: crypto.randomUUID(),
        title: title.trim(),
        author: typeof author === "string" ? author.trim() : "",
        read: false,
      };
      books.push(book);
      await save(books);
      return send(res, 201, book);
    }

    if (id && req.method === "PATCH") {
      const book = books.find((b) => b.id === id);
      if (!book) return send(res, 404, { error: "Book not found" });
      const body = await readBody(req);
      book.read = typeof body.read === "boolean" ? body.read : true;
      await save(books);
      return send(res, 200, book);
    }

    if (id && req.method === "DELETE") {
      const index = books.findIndex((b) => b.id === id);
      if (index === -1) return send(res, 404, { error: "Book not found" });
      books.splice(index, 1);
      await save(books);
      return send(res, 204);
    }

    send(res, 405, { error: "Method not allowed" });
  }

  async function handleStatic(req, res, url) {
    if (req.method !== "GET")
      return send(res, 405, { error: "Method not allowed" });
    const name = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const file = path.join(PUBLIC_DIR, name);
    if (!file.startsWith(PUBLIC_DIR + path.sep))
      return send(res, 404, { error: "Not found" });
    try {
      const content = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": TYPES[path.extname(file)] || "application/octet-stream",
      });
      res.end(content);
    } catch {
      send(res, 404, { error: "Not found" });
    }
  }

  // Serialize requests so read-modify-write cycles on the JSON file don't interleave.
  let queue = Promise.resolve();

  return http.createServer((req, res) => {
    let url;
    try {
      url = new URL(req.url, "http://localhost");
    } catch {
      return send(res, 400, { error: "Bad request URL" });
    }
    const handler = url.pathname.startsWith("/api/") ? handleApi : handleStatic;
    queue = queue
      .then(() => handler(req, res, url))
      .catch((err) =>
        send(res, err.status || 500, {
          error: err.status ? err.message : "Server error",
        }),
      );
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () =>
    console.log(`Readlist is running at http://localhost:${port}`),
  );
}

module.exports = { createServer };
