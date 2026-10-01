import { Router } from "express";
import { Users } from "../db/users.js";
import { Posts } from "../db/posts.js";
import { Albums } from "../db/albums.js";
import { authenticate } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import { presentUser, presentPosts, presentAlbums } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

// GET /api/search?q=term  (use #tag to search hashtags only)
router.get("/", asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 60);
  if (!q) return res.json({ users: [], posts: [], albums: [] });

  const paging = { skip: 0, limit: 12 };
  const isTag = q.startsWith("#");
  const [users, posts, albums] = await Promise.all([
    isTag ? { items: [] } : Users.search(q, paging),
    Posts.list(Posts.searchFilter(q), paging),
    Albums.list(Albums.searchFilter(q), paging),
  ]);
  res.json({
    users: users.items.map((u) => presentUser(u)),
    posts: await presentPosts(posts.items, req.user._id),
    albums: await presentAlbums(albums.items),
  });
}));

export default router;
