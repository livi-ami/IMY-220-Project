import { Router } from "express";
import { Users } from "../db/users.js";
import { Friends } from "../db/friends.js";
import { authenticate } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid } from "../utils/validate.js";
import { presentUser } from "../utils/presenters.js";

const router = Router();
router.use(authenticate);

async function loadRequest(id) {
  const request = await Friends.findRequest(oid(id, "request id"));
  if (!request) throw new HttpError(404, "Friend request not found.");
  return request;
}

// GET /api/friends/requests -> { incoming: [...], outgoing: [...] }
router.get("/requests", asyncHandler(async (req, res) => {
  const [incoming, outgoing] = await Promise.all([Friends.incoming(req.user._id), Friends.outgoing(req.user._id)]);
  const people = new Map(
    (await Users.findByIds([...incoming.map((r) => r.fromId), ...outgoing.map((r) => r.toId)])).map((u) => [u._id.toString(), u])
  );
  const shape = (r, otherId, key) => ({
    id: r._id.toString(),
    [key]: people.get(otherId.toString()) ? presentUser(people.get(otherId.toString())) : null,
    createdAt: r.createdAt,
  });
  res.json({
    incoming: incoming.map((r) => shape(r, r.fromId, "from")),
    outgoing: outgoing.map((r) => shape(r, r.toId, "to")),
  });
}));

// POST /api/friends/requests  { toUserId }
router.post("/requests", asyncHandler(async (req, res) => {
  const request = await Friends.sendRequest(req.user, oid(req.body?.toUserId, "user id"));
  res.status(201).json({ success: true, message: "Friend request sent.", requestId: request._id.toString() });
}));

// POST /api/friends/requests/:id/accept
router.post("/requests/:id/accept", asyncHandler(async (req, res) => {
  await Friends.accept(await loadRequest(req.params.id), req.user._id);
  res.json({ success: true, message: "Friend request accepted." });
}));

// DELETE /api/friends/requests/:id - decline (recipient) or cancel (sender)
router.delete("/requests/:id", asyncHandler(async (req, res) => {
  await Friends.remove(await loadRequest(req.params.id), req.user._id);
  res.json({ success: true, message: "Friend request removed." });
}));

// DELETE /api/friends/:userId - unfriend
router.delete("/:userId", asyncHandler(async (req, res) => {
  await Friends.unfriend(req.user, oid(req.params.userId, "user id"));
  res.json({ success: true, message: "Unfriended." });
}));

export default router;
