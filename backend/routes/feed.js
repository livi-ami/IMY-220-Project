import { Router } from "express";
import { Posts } from "../db/posts.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import { parsePaging, paged } from "../utils/validate.js";
import { presentPosts } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

//GET /api/feed/global?page=1&limit=12 - everyone's posts, newest first
router.get("/global", asyncHandler(async (req, res) => {
  const paging = parsePaging(req.query);
  const { items, total } = await Posts.list({}, paging);
  res.json(paged(await presentPosts(items, req.user._id), total, paging));
}));

//GET /api/feed/local - you and your friends
router.get("/local", asyncHandler(async (req, res) => {
  const paging = parsePaging(req.query);
  const ids = [req.user._id, ...(req.user.friends || [])];
  const { items, total } = await Posts.list({ userId: { $in: ids } }, paging);
  res.json(paged(await presentPosts(items, req.user._id), total, paging));
}));

export default router;
