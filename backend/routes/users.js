import { Router } from "express";
import { Users } from "../db/users.js";
import { Posts } from "../db/posts.js";
import { Albums } from "../db/albums.js";
import { Friends } from "../db/friends.js";
import { Images } from "../db/images.js";
import { authenticate, assertOwnerOrAdmin } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid, cleanText, cleanUsername, parsePaging, paged } from "../utils/validate.js";
import { presentUser, presentPosts, presentAlbums } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

async function loadUser(id) {
  const user = await Users.findById(oid(id, "user id"));
  if (!user) throw new HttpError(404, "User not found.");
  return user;
}

// GET /api/users?search=term&page=1
router.get("/", asyncHandler(async (req, res) => {
  const paging = parsePaging(req.query, 20);
  const { items, total } = await Users.search(String(req.query.search || "").trim(), paging);
  res.json(paged(items.map((u) => presentUser(u)), total, paging));
}));

// GET /api/users/:id - profile with counts and your relationship to them
router.get("/:id", asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  const [postsCount, rel] = await Promise.all([Posts.count({ userId: user._id }), Friends.relationship(req.user, user._id)]);
  res.json({
    user: {
      ...presentUser(user, { self: req.user._id.equals(user._id) }),
      postsCount,
      friendsCount: (user.friends || []).length,
      relationship: rel.status,
      requestId: rel.requestId || null,
    },
  });
}));

// PUT /api/users/:id  { username?, bio? } + optional "avatar" file (multipart)
router.put("/:id", uploadImage("avatar"), asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  assertOwnerOrAdmin(req.user, user._id, "this profile");

  const body = req.body || {};
  const changes = {};
  if (body.username !== undefined) changes.username = cleanUsername(body.username);
  if (body.bio !== undefined) changes.bio = cleanText(body.bio, { field: "Bio", max: 160 });
  if (req.file) changes.avatarImageId = await Images.create({ buffer: req.file.buffer, contentType: req.file.mimetype });
  if (!Object.keys(changes).length) throw new HttpError(400, "Nothing to update.");

  const updated = await Users.update(user._id, changes);
  if (changes.avatarImageId) await Images.remove(user.avatarImageId); // clean up the replaced picture
  res.json({ success: true, user: presentUser(updated, { self: req.user._id.equals(user._id) }) });
}));

// DELETE /api/users/:id - removes the account and everything it owns
router.delete("/:id", asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  assertOwnerOrAdmin(req.user, user._id, "this account");
  await Users.remove(user);
  res.json({ success: true, message: "Account deleted." });
}));

// GET /api/users/:id/posts
router.get("/:id/posts", asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  const paging = parsePaging(req.query, 12);
  const { items, total } = await Posts.list({ userId: user._id }, paging);
  res.json(paged(await presentPosts(items, req.user._id), total, paging));
}));

// GET /api/users/:id/albums
router.get("/:id/albums", asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  const paging = parsePaging(req.query, 12);
  const { items, total } = await Albums.list({ userId: user._id }, paging);
  res.json(paged(await presentAlbums(items), total, paging));
}));

// GET /api/users/:id/friends
router.get("/:id/friends", asyncHandler(async (req, res) => {
  const user = await loadUser(req.params.id);
  const friends = await Users.findByIds(user.friends || []);
  res.json({ items: friends.map((f) => presentUser(f)), total: friends.length });
}));

export default router;
