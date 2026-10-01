// Run with:  npm test      (needs MONGO_URI in .env; uses a separate database called "encore_test")
import "dotenv/config";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";
import { connectDB, closeDB } from "../db/connection.js";
import { wipe, seedDatabase } from "../seed/seedData.js";

let server, base;
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

async function api(method, path, { token, json, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json) { headers["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  if (form) body = form;
  const res = await fetch(base + path, { method, headers, body });
  const type = res.headers.get("content-type") || "";
  return { status: res.status, body: type.includes("json") ? await res.json() : null, res };
}
const login = async (email, password = "Password123") => (await api("POST", "/api/auth/signin", { json: { email, password } })).body;
const postForm = (extra = {}, file = { buf: PNG, type: "image/png", name: "a.png" }) => {
  const f = new FormData();
  if (file) f.append("image", new Blob([file.buf], { type: file.type }), file.name);
  for (const [k, v] of Object.entries({ caption: "Test caption", eventName: "Test Event", hashtags: "#one #two", ...extra })) f.append(k, v);
  return f;
};

let kid, mia, admin; // { token, user }

before(async () => {
  const db = await connectDB(process.env.MONGO_URI, "encore_test");
  await wipe(db);
  await seedDatabase(db);
  server = createApp().listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
  kid = await login("concertkid@encore.test");
  mia = await login("mia@encore.test");
  admin = await login("admin@encore.test", "Admin1234");
});
after(async () => { server?.close(); await closeDB(); });

test("auth: signup validation, duplicates, signin, me, logout", async () => {
  assert.equal((await api("POST", "/api/auth/signup", { json: { username: "x", email: "bad", password: "short" } })).status, 400);
  const ok = await api("POST", "/api/auth/signup", { json: { username: "newbie", email: "newbie@encore.test", password: "Password1" } });
  assert.equal(ok.status, 201);
  assert.ok(ok.body.token);
  assert.equal(ok.body.user.passwordHash, undefined);
  assert.equal((await api("POST", "/api/auth/signup", { json: { username: "NEWBIE", email: "other@encore.test", password: "Password1" } })).status, 409);
  assert.equal((await api("POST", "/api/auth/signup", { json: { username: "other", email: "newbie@encore.test", password: "Password1" } })).status, 409);
  assert.equal((await api("POST", "/api/auth/signin", { json: { email: "newbie@encore.test", password: "wrong" } })).status, 401);
  assert.equal((await api("POST", "/api/auth/signin", { json: {} })).status, 400);
  const me = await api("GET", "/api/auth/me", { token: ok.body.token });
  assert.equal(me.body.user.email, "newbie@encore.test");
  assert.equal((await api("POST", "/api/auth/logout", { token: ok.body.token })).status, 200);
});

test("auth is required, bad tokens rejected, unknown routes 404, bad ids 400", async () => {
  assert.equal((await api("GET", "/api/feed/global")).status, 401);
  assert.equal((await api("GET", "/api/feed/global", { token: "garbage" })).status, 401);
  assert.equal((await api("GET", "/api/nope", { token: kid.token })).status, 404);
  assert.equal((await api("GET", "/api/posts/not-an-id", { token: kid.token })).status, 400);
  assert.equal((await api("GET", "/api/posts/aaaaaaaaaaaaaaaaaaaaaaaa", { token: kid.token })).status, 404);
});

test("feeds: global has everything, local only me + friends, pagination works", async () => {
  const global = await api("GET", "/api/feed/global?limit=4", { token: kid.token });
  assert.equal(global.body.items.length, 4);
  assert.equal(global.body.total, 10);
  assert.equal(global.body.hasMore, true);
  const local = await api("GET", "/api/feed/local?limit=50", { token: kid.token });
  const authors = new Set(local.body.items.map((p) => p.author.username));
  assert.ok(!authors.has("setlist.sarah") && !authors.has("front_row_frank"), "local feed must exclude non-friends");
  assert.ok(authors.has("concertkid") && authors.has("engene_lens"));
  assert.ok(local.body.items[0].imageUrl.startsWith("/api/images/"));
});

test("profiles: view, edit own, cannot edit others, admin can", async () => {
  const profile = await api("GET", `/api/users/${kid.user.id}`, { token: kid.token });
  assert.equal(profile.body.user.relationship, "self");
  assert.equal(profile.body.user.postsCount, 3);
  assert.equal(profile.body.user.friendsCount, 3);
  const edit = await api("PUT", `/api/users/${kid.user.id}`, { token: kid.token, json: { bio: "New bio" } });
  assert.equal(edit.body.user.bio, "New bio");
  assert.equal((await api("PUT", `/api/users/${kid.user.id}`, { token: mia.token, json: { bio: "hax" } })).status, 403);
  assert.equal((await api("PUT", `/api/users/${kid.user.id}`, { token: kid.token, json: { username: "livia.lens" } })).status, 409);
  assert.equal((await api("PUT", `/api/users/${kid.user.id}`, { token: kid.token, json: {} })).status, 400);
  const form = new FormData();
  form.append("avatar", new Blob([PNG], { type: "image/png" }), "me.png");
  const av = await api("PUT", `/api/users/${kid.user.id}`, { token: kid.token, form });
  assert.ok(av.body.user.avatarUrl);
  assert.equal((await api("PUT", `/api/users/${mia.user.id}`, { token: admin.token, json: { bio: "edited by admin" } })).status, 200);
  const found = await api("GET", "/api/users?search=livia", { token: kid.token });
  assert.equal(found.body.items[0].username, "livia.lens");
});

test("friends: pending request accept, duplicate, decline, unfriend", async () => {
  const sarah = await login("sarah@encore.test");
  const incoming = await api("GET", "/api/friends/requests", { token: kid.token });
  assert.equal(incoming.body.incoming[0].from.username, "setlist.sarah");
  assert.equal((await api("POST", `/api/friends/requests/${incoming.body.incoming[0].id}/accept`, { token: sarah.token })).status, 403);
  assert.equal((await api("POST", `/api/friends/requests/${incoming.body.incoming[0].id}/accept`, { token: kid.token })).status, 200);
  assert.equal((await api("GET", `/api/users/${sarah.user.id}`, { token: kid.token })).body.user.relationship, "friends");

  // mia (friend of kid) sends to frank, duplicate blocked, then decline path
  const frank = await login("frank@encore.test");
  assert.equal((await api("POST", "/api/friends/requests", { token: mia.token, json: { toUserId: frank.user.id } })).status, 201);
  assert.equal((await api("POST", "/api/friends/requests", { token: mia.token, json: { toUserId: frank.user.id } })).status, 409);
  assert.equal((await api("POST", "/api/friends/requests", { token: frank.token, json: { toUserId: mia.user.id } })).status, 409);
  assert.equal((await api("POST", "/api/friends/requests", { token: mia.token, json: { toUserId: mia.user.id } })).status, 400);
  const list = await api("GET", "/api/friends/requests", { token: frank.token });
  assert.equal((await api("DELETE", `/api/friends/requests/${list.body.incoming[0].id}`, { token: frank.token })).status, 200);

  assert.equal((await api("DELETE", `/api/friends/${sarah.user.id}`, { token: kid.token })).status, 200);
  assert.equal((await api("DELETE", `/api/friends/${sarah.user.id}`, { token: kid.token })).status, 404);
  assert.equal((await api("GET", `/api/users/${kid.user.id}`, { token: kid.token })).body.user.friendsCount, 3);
});

let postId;
test("posts: create with image, validate, edit, like, comment, report, permissions, delete", async () => {
  assert.equal((await api("POST", "/api/posts", { token: kid.token, form: postForm({}, null) })).status, 400);
  assert.equal((await api("POST", "/api/posts", { token: kid.token, form: postForm({}, { buf: Buffer.from("hi"), type: "text/plain", name: "a.txt" }) })).status, 400);
  assert.equal((await api("POST", "/api/posts", { token: kid.token, form: postForm({ caption: "" }) })).status, 400);
  assert.equal((await api("POST", "/api/posts", { token: kid.token, form: postForm({ hashtags: "#bad-tag!" }) })).status, 400);

  const created = await api("POST", "/api/posts", { token: kid.token, form: postForm() });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body.post.hashtags, ["one", "two"]);
  postId = created.body.post.id;

  const img = await api("GET", created.body.post.imageUrl);
  assert.equal(img.status, 200);
  assert.equal(img.res.headers.get("content-type"), "image/png");
  assert.equal(Buffer.from(await img.res.arrayBuffer()).equals(PNG), true, "stored image bytes must round-trip");

  assert.equal((await api("PUT", `/api/posts/${postId}`, { token: mia.token, json: { caption: "hax" } })).status, 403);
  const edited = await api("PUT", `/api/posts/${postId}`, { token: kid.token, json: { caption: "Edited", hashtags: ["#x", "y"] } });
  assert.equal(edited.body.post.caption, "Edited");
  assert.deepEqual(edited.body.post.hashtags, ["x", "y"]);

  assert.equal((await api("POST", `/api/posts/${postId}/like`, { token: mia.token })).body.post.likeCount, 1);
  assert.equal((await api("POST", `/api/posts/${postId}/like`, { token: mia.token })).body.post.likeCount, 1, "liking twice must not double count");
  assert.equal((await api("DELETE", `/api/posts/${postId}/like`, { token: mia.token })).body.post.likeCount, 0);

  const c = await api("POST", `/api/posts/${postId}/comments`, { token: mia.token, json: { text: "Nice!" } });
  assert.equal(c.status, 201);
  assert.equal((await api("POST", `/api/posts/${postId}/comments`, { token: mia.token, json: { text: "  " } })).status, 400);
  assert.equal((await api("GET", `/api/posts/${postId}`, { token: kid.token })).body.post.commentCount, 1);
  assert.equal((await api("PUT", `/api/comments/${c.body.comment.id}`, { token: kid.token, json: { text: "x" } })).status, 403);
  assert.equal((await api("PUT", `/api/comments/${c.body.comment.id}`, { token: mia.token, json: { text: "Nice shot!" } })).body.comment.edited, true);
  const comments = await api("GET", `/api/posts/${postId}/comments`, { token: kid.token });
  assert.equal(comments.body.items[0].text, "Nice shot!");
  // post owner may remove comments on their post
  assert.equal((await api("DELETE", `/api/comments/${c.body.comment.id}`, { token: kid.token })).status, 200);
  assert.equal((await api("GET", `/api/posts/${postId}`, { token: kid.token })).body.post.commentCount, 0);

  const reasons = await api("GET", "/api/report-reasons", { token: mia.token });
  assert.equal(reasons.body.items.length, 6);
  const reasonId = reasons.body.items[0].id;
  assert.equal((await api("POST", `/api/posts/${postId}/report`, { token: kid.token, json: { reasonId } })).status, 400, "can't report own post");
  assert.equal((await api("POST", `/api/posts/${postId}/report`, { token: mia.token, json: { reasonId: "bad" } })).status, 400);
  assert.equal((await api("POST", `/api/posts/${postId}/report`, { token: mia.token, json: { reasonId } })).status, 201);
  assert.equal((await api("POST", `/api/posts/${postId}/report`, { token: mia.token, json: { reasonId } })).status, 409);
});

test("albums: create, edit, add/remove posts, permissions, delete keeps posts", async () => {
  assert.equal((await api("POST", "/api/albums", { token: kid.token, json: { description: "no name" } })).status, 400);
  const created = await api("POST", "/api/albums", { token: kid.token, json: { name: "My Album", description: "d", hashtags: "#a #b" } });
  assert.equal(created.status, 201);
  const id = created.body.album.id;
  assert.equal((await api("PUT", `/api/albums/${id}`, { token: mia.token, json: { name: "hax" } })).status, 403);
  assert.equal((await api("PUT", `/api/albums/${id}`, { token: kid.token, json: { name: "Renamed", hashtags: ["z"] } })).body.album.name, "Renamed");

  const added = await api("POST", `/api/albums/${id}/posts`, { token: kid.token, json: { postId } });
  assert.equal(added.body.album.posts.length, 1);
  assert.equal((await api("POST", `/api/albums/${id}/posts`, { token: kid.token, json: { postId } })).body.album.posts.length, 1, "no duplicates");
  assert.equal((await api("POST", `/api/albums/${id}/posts`, { token: kid.token, json: { postId: "aaaaaaaaaaaaaaaaaaaaaaaa" } })).status, 404);
  assert.equal((await api("POST", `/api/albums/${id}/posts`, { token: mia.token, json: { postId } })).status, 403);
  assert.equal((await api("GET", "/api/albums?search=Renamed", { token: mia.token })).body.items[0].postCount, 1);
  assert.equal((await api("DELETE", `/api/albums/${id}/posts/${postId}`, { token: kid.token })).body.album.posts.length, 0);
  await api("POST", `/api/albums/${id}/posts`, { token: kid.token, json: { postId } });
  assert.equal((await api("DELETE", `/api/albums/${id}`, { token: kid.token })).status, 200);
  assert.equal((await api("GET", `/api/posts/${postId}`, { token: kid.token })).status, 200, "deleting an album keeps its posts");
  assert.equal((await api("GET", `/api/users/${kid.user.id}/albums`, { token: kid.token })).body.items.some((a) => a.id === id), false);
});

test("search finds users, posts (text + #hashtag) and albums", async () => {
  const r = await api("GET", "/api/search?q=enhypen", { token: kid.token });
  assert.ok(r.body.posts.length >= 3 && r.body.albums.length >= 1);
  const tag = await api("GET", `/api/search?q=${encodeURIComponent("#guts")}`, { token: kid.token });
  assert.ok(tag.body.posts.length >= 2 && tag.body.users.length === 0);
  assert.equal((await api("GET", "/api/search?q=mia", { token: kid.token })).body.users[0].username, "moshpit_mia");
  assert.deepEqual((await api("GET", "/api/search?q=", { token: kid.token })).body, { users: [], posts: [], albums: [] });
});

test("admin: only admins add report reasons and read reports; admin can delete any post", async () => {
  assert.equal((await api("POST", "/api/report-reasons", { token: kid.token, json: { label: "x" } })).status, 403);
  assert.equal((await api("POST", "/api/report-reasons", { token: admin.token, json: { label: "Dangerous activity" } })).status, 201);
  assert.equal((await api("POST", "/api/report-reasons", { token: admin.token, json: { label: "Dangerous activity" } })).status, 409);
  assert.equal((await api("GET", "/api/reports", { token: kid.token })).status, 403);
  assert.ok((await api("GET", "/api/reports", { token: admin.token })).body.items.length >= 1);
  assert.equal((await api("DELETE", `/api/posts/${postId}`, { token: mia.token })).status, 403);
  assert.equal((await api("DELETE", `/api/posts/${postId}`, { token: admin.token })).status, 200);
  assert.equal((await api("GET", `/api/posts/${postId}`, { token: kid.token })).status, 404);
  assert.equal((await api("GET", "/api/reports", { token: admin.token })).body.items.length, 0, "reports for a deleted post are removed");
});

test("deleting a user removes their posts, comments, friendships and album entries", async () => {
  const before = (await api("GET", "/api/feed/global?limit=50", { token: admin.token })).body.total;
  const miaPosts = (await api("GET", `/api/users/${mia.user.id}/posts`, { token: admin.token })).body.total;
  assert.equal((await api("DELETE", `/api/users/${kid.user.id}`, { token: mia.token })).status, 403);
  assert.equal((await api("DELETE", `/api/users/${mia.user.id}`, { token: mia.token })).status, 200);
  assert.equal((await api("GET", "/api/feed/global?limit=50", { token: admin.token })).body.total, before - miaPosts);
  assert.equal((await api("GET", "/api/auth/me", { token: mia.token })).status, 401, "token of deleted account stops working");
  assert.equal((await api("GET", `/api/users/${kid.user.id}`, { token: kid.token })).body.user.friendsCount, 2);
});