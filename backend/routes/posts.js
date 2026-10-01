import { Router } from "express";
import { Posts } from "../db/posts.js";
import { Comments } from "../db/comments.js";
import { Images } from "../db/images.js";
import { ReportReasons, Reports } from "../db/reports.js";
import { authenticate, assertOwnerOrAdmin } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid, cleanText, normalizeTags, parsePaging, paged } from "../utils/validate.js";
import { presentPost, presentComments, presentComment } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

async function loadPost(id) {
  const post = await Posts.findById(oid(id, "post id"));
  if (!post) throw new HttpError(404, "Post not found.");
  return post;
}

//POST /api/posts - multipart/form-data: image (file), caption, eventName, hashtags
router.post("/", uploadImage("image"), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, "An image is required.");
  const body = req.body || {};
  const caption = cleanText(body.caption, { field: "Caption", max: 300, required: true });
  const eventName = cleanText(body.eventName, { field: "Event name", max: 60, required: true });
  const hashtags = normalizeTags(body.hashtags);

  const imageId = await Images.create({ buffer: req.file.buffer, contentType: req.file.mimetype });
  try {
    const post = await Posts.create({ userId: req.user._id, imageId, caption, eventName, hashtags });
    res.status(201).json({ success: true, post: await presentPost(post, req.user._id) });
  } catch (err) {
    await Images.remove(imageId);
    throw err;
  }
}));

//GET /api/posts/:id
router.get("/:id", asyncHandler(async (req, res) => {
  res.json({ post: await presentPost(await loadPost(req.params.id), req.user._id) });
}));

//PUT /api/posts/:id  { caption?, eventName?, hashtags? } (owner or admin)
router.put("/:id", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  assertOwnerOrAdmin(req.user, post.userId, "this post");
  const body = req.body || {};
  const changes = {};
  if (body.caption !== undefined) changes.caption = cleanText(body.caption, { field: "Caption", max: 300, required: true });
  if (body.eventName !== undefined) changes.eventName = cleanText(body.eventName, { field: "Event name", max: 60, required: true });
  if (body.hashtags !== undefined) changes.hashtags = normalizeTags(body.hashtags);
  if (!Object.keys(changes).length) throw new HttpError(400, "Nothing to update.");
  res.json({ success: true, post: await presentPost(await Posts.update(post._id, changes), req.user._id) });
}));

//DELETE /api/posts/:id (owner or admin)
router.delete("/:id", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  assertOwnerOrAdmin(req.user, post.userId, "this post");
  await Posts.remove(post);
  res.json({ success: true, message: "Post deleted." });
}));

//POST /api/posts/:id/like  and  DELETE /api/posts/:id/like
router.post("/:id/like", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  res.json({ post: await presentPost(await Posts.like(post._id, req.user._id), req.user._id) });
}));
router.delete("/:id/like", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  res.json({ post: await presentPost(await Posts.unlike(post._id, req.user._id), req.user._id) });
}));

//GET /api/posts/:id/comments?page=1&limit=20 (newest first)
router.get("/:id/comments", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  const paging = parsePaging(req.query, 20);
  const { items, total } = await Comments.listByPost(post._id, paging);
  res.json(paged(await presentComments(items), total, paging));
}));

//POST /api/posts/:id/comments  { text }
router.post("/:id/comments", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  const text = cleanText(req.body?.text, { field: "Comment", max: 300, required: true });
  const comment = await Comments.create({ postId: post._id, userId: req.user._id, text });
  res.status(201).json({ success: true, comment: await presentComment(comment) });
}));

//POST /api/posts/:id/report  { reasonId, details? }
router.post("/:id/report", asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  if (post.userId.equals(req.user._id)) throw new HttpError(400, "You can't report your own post.");
  const reasonId = oid(req.body?.reasonId, "reason id");
  if (!(await ReportReasons.findById(reasonId))) throw new HttpError(404, "That report reason doesn't exist.");
  const details = cleanText(req.body?.details, { field: "Details", max: 300 });
  await Reports.create({ postId: post._id, reporterId: req.user._id, reasonId, details });
  res.status(201).json({ success: true, message: "Thanks, your report has been sent." });
}));

export default router;