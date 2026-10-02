const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { createServer } = require('../server');

let server, base, dir;

before(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'readlist-'));
  server = createServer(path.join(dir, 'books.json'));
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  server.close();
  await fs.rm(dir, { recursive: true });
});

const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

test('starts with an empty list', async () => {
  const res = await fetch(`${base}/api/books`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), []);
});

test('POST adds a book, rejects missing title', async () => {
  const res = await fetch(`${base}/api/books`, json('POST', { title: ' Dune ', author: 'Herbert' }));
  assert.strictEqual(res.status, 201);
  const book = await res.json();
  assert.strictEqual(book.title, 'Dune');
  assert.strictEqual(book.read, false);

  const bad = await fetch(`${base}/api/books`, json('POST', { author: 'Nobody' }));
  assert.strictEqual(bad.status, 400);
});

test('PATCH marks read, DELETE removes, unknown id is 404', async () => {
  const created = await (await fetch(`${base}/api/books`, json('POST', { title: 'Emma' }))).json();

  const patched = await fetch(`${base}/api/books/${created.id}`, { method: 'PATCH' });
  assert.strictEqual((await patched.json()).read, true);

  const del = await fetch(`${base}/api/books/${created.id}`, { method: 'DELETE' });
  assert.strictEqual(del.status, 204);

  const missing = await fetch(`${base}/api/books/${created.id}`, { method: 'DELETE' });
  assert.strictEqual(missing.status, 404);
});

test('GET /api/stats counts total and read books', async () => {
  const before = await (await fetch(`${base}/api/stats`)).json();
  const a = await (await fetch(`${base}/api/books`, json('POST', { title: 'Stats A' }))).json();
  await fetch(`${base}/api/books`, json('POST', { title: 'Stats B' }));
  await fetch(`${base}/api/books/${a.id}`, { method: 'PATCH' });

  const res = await fetch(`${base}/api/stats`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { total: before.total + 2, read: before.read + 1 });

  const bad = await fetch(`${base}/api/stats`, { method: 'POST' });
  assert.strictEqual(bad.status, 405);
});

test('malformed request URL gets 400 and does not crash the server', async () => {
  const raw = await new Promise((resolve, reject) => {
    const socket = net.connect(server.address().port, 'localhost');
    let data = '';
    socket.on('data', (chunk) => (data += chunk));
    socket.on('close', () => resolve(data));
    socket.on('error', reject);
    socket.write('GET // HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
  });
  assert.match(raw, /^HTTP\/1\.1 400/);

  const res = await fetch(`${base}/api/books`);
  assert.strictEqual(res.status, 200);
});

test('serves the page', async () => {
  const res = await fetch(`${base}/`);
  assert.strictEqual(res.status, 200);
  assert.match(await res.text(), /Reading List/);
});
