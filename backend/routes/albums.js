import { Router } from "express";
import { Albums } from "../db/albums.js";
import { Posts } from "../db/posts.js";
import { authenticate, assertOwnerOrAdmin } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid, cleanText, normalizeTags, parsePaging, paged } from "../utils/validate.js";
import { presentAlbum, presentAlbums } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

async function loadAlbum(id) {
  const album = await Albums.findById(oid(id, "album id"));
  if (!album) throw new HttpError(404, "Album not found.");
  return album;
}

//POST /api/albums
router.post("/", asyncHandler(async (req, res) => {
  const body = req.body || {};
  const album = await Albums.create({
    userId: req.user._id,
    name: cleanText(body.name, { field: "Album name", max: 60, required: true }),
    description: cleanText(body.description, { field: "Description", max: 300 }),
    hashtags: normalizeTags(body.hashtags),
  });
  res.status(201).json({ success: true, album: await presentAlbum(album, req.user._id) });
}));

//GET /api/albums?search=term&page=1 - all albums (global)
router.get("/", asyncHandler(async (req, res) => {
  const paging = parsePaging(req.query, 12);
  const search = String(req.query.search || "").trim();
  const { items, total } = await Albums.list(search ? Albums.searchFilter(search) : {}, paging);
  res.json(paged(await presentAlbums(items), total, paging));
}));

//GET /api/albums/:id - album with its posts
router.get("/:id", asyncHandler(async (req, res) => {
  res.json({ album: await presentAlbum(await loadAlbum(req.params.id), req.user._id) });
}));

//PUT /api/albums/:id  { name?, description?, hashtags? } (owner or admin)
router.put("/:id", asyncHandler(async (req, res) => {
  const album = await loadAlbum(req.params.id);
  assertOwnerOrAdmin(req.user, album.userId, "this album");
  const body = req.body || {};
  const changes = {};
  if (body.name !== undefined) changes.name = cleanText(body.name, { field: "Album name", max: 60, required: true });
  if (body.description !== undefined) changes.description = cleanText(body.description, { field: "Description", max: 300 });
  if (body.hashtags !== undefined) changes.hashtags = normalizeTags(body.hashtags);
  if (!Object.keys(changes).length) throw new HttpError(400, "Nothing to update.");
  res.json({ success: true, album: await presentAlbum(await Albums.update(album._id, changes), req.user._id) });
}));

//DELETE /api/albums/:id (owner or admin) - posts themselves are kept
router.delete("/:id", asyncHandler(async (req, res) => {
  const album = await loadAlbum(req.params.id);
  assertOwnerOrAdmin(req.user, album.userId, "this album");
  await Albums.remove(album._id);
  res.json({ success: true, message: "Album deleted." });
}));

//POST /api/albums/:id/posts  { postId } - add any existing post to your album
router.post("/:id/posts", asyncHandler(async (req, res) => {
  const album = await loadAlbum(req.params.id);
  assertOwnerOrAdmin(req.user, album.userId, "this album");
  const postId = oid(req.body?.postId, "post id");
  if (!(await Posts.findById(postId))) throw new HttpError(404, "Post not found.");
  res.json({ success: true, album: await presentAlbum(await Albums.addPost(album._id, postId), req.user._id) });
}));

//DELETE /api/albums/:id/posts/:postId
router.delete("/:id/posts/:postId", asyncHandler(async (req, res) => {
  const album = await loadAlbum(req.params.id);
  assertOwnerOrAdmin(req.user, album.userId, "this album");
  res.json({ success: true, album: await presentAlbum(await Albums.removePost(album._id, oid(req.params.postId, "post id")), req.user._id) });
}));

export default router;