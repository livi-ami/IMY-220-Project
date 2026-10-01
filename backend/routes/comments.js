import { Router } from "express";
import { Comments } from "../db/comments.js";
import { Posts } from "../db/posts.js";
import { authenticate, assertOwnerOrAdmin } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid, cleanText } from "../utils/validate.js";
import { presentComment } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

async function loadComment(id) {
  const comment = await Comments.findById(oid(id, "comment id"));
  if (!comment) throw new HttpError(404, "Comment not found.");
  return comment;
}

// PUT /api/comments/:id  { text } (author or admin)
router.put("/:id", asyncHandler(async (req, res) => {
  const comment = await loadComment(req.params.id);
  assertOwnerOrAdmin(req.user, comment.userId, "this comment");
  const text = cleanText(req.body?.text, { field: "Comment", max: 300, required: true });
  res.json({ success: true, comment: await presentComment(await Comments.update(comment._id, text)) });
}));

// DELETE /api/comments/:id (author, the post's owner, or admin)
router.delete("/:id", asyncHandler(async (req, res) => {
  const comment = await loadComment(req.params.id);
  const post = await Posts.findById(comment.postId);
  const isPostOwner = post && post.userId.equals(req.user._id);
  if (!isPostOwner) assertOwnerOrAdmin(req.user, comment.userId, "this comment");
  await Comments.remove(comment);
  res.json({ success: true, message: "Comment deleted." });
}));

export default router;
