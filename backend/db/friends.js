import { getDb } from "./connection.js";
import { HttpError } from "../utils/errors.js";
import { Users } from "./users.js";

const col = () => getDb().collection("friendRequests");

export const Friends = {
  findRequest: (id) => col().findOne({ _id: id }),
  incoming: (userId) => col().find({ toId: userId }).sort({ createdAt: -1 }).toArray(),
  outgoing: (userId) => col().find({ fromId: userId }).sort({ createdAt: -1 }).toArray(),

  async sendRequest(from, toId) {
    if (from._id.equals(toId)) throw new HttpError(400, "You can't send a friend request to yourself.");
    const to = await Users.findById(toId);
    if (!to) throw new HttpError(404, "User not found.");
    if ((from.friends || []).some((f) => f.equals(toId))) throw new HttpError(409, "You are already friends.");

    const existing = await col().findOne({ $or: [{ fromId: from._id, toId }, { fromId: toId, toId: from._id }] });
    if (existing) {
      throw new HttpError(409, existing.fromId.equals(from._id)
        ? "Friend request already sent."
        : "This user already sent you a request. Accept it instead.");
    }
    const doc = { fromId: from._id, toId, createdAt: new Date() };
    const { insertedId } = await col().insertOne(doc);
    return { ...doc, _id: insertedId };
  },

  // Only the recipient can accept
  async accept(request, userId) {
    if (!request.toId.equals(userId)) throw new HttpError(403, "Only the recipient can accept this request.");
    await Promise.all([Users.addFriend(request.fromId, request.toId), Users.addFriend(request.toId, request.fromId)]);
    await col().deleteOne({ _id: request._id });
  },

  // Recipient declines, or sender cancels
  async remove(request, userId) {
    if (!request.toId.equals(userId) && !request.fromId.equals(userId)) {
      throw new HttpError(403, "You can't modify this request.");
    }
    await col().deleteOne({ _id: request._id });
  },

  async unfriend(user, otherId) {
    if (!(user.friends || []).some((f) => f.equals(otherId))) throw new HttpError(404, "You are not friends with this user.");
    await Promise.all([Users.removeFriend(user._id, otherId), Users.removeFriend(otherId, user._id)]);
  },

  // How the viewer relates to another user: self | friends | request_sent | request_received | none
  async relationship(viewer, otherId) {
    if (viewer._id.equals(otherId)) return { status: "self" };
    if ((viewer.friends || []).some((f) => f.equals(otherId))) return { status: "friends" };
    const req = await col().findOne({ $or: [{ fromId: viewer._id, toId: otherId }, { fromId: otherId, toId: viewer._id }] });
    if (!req) return { status: "none" };
    return { status: req.fromId.equals(viewer._id) ? "request_sent" : "request_received", requestId: req._id.toString() };
  },
};
