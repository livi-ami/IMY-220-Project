import { getDb } from "./connection.js";
import { HttpError } from "../utils/errors.js";
import { escapeRegex } from "../utils/validate.js";
import { Images } from "./images.js";
import { Posts } from "./posts.js";
import { Comments } from "./comments.js";
import { Albums } from "./albums.js";

const col = () => getDb().collection("users");

function rethrowDuplicate(err) {
  if (err?.code === 11000 || /duplicate key|UNIQUE constraint/i.test(err?.message || "")) {
    const text = JSON.stringify(err.keyPattern || {}) + err.message;
    throw new HttpError(409, text.includes("email") ? "That email is already registered." : "That username is taken.");
  }
  throw err;
}

export const Users = {
  async create({ username, email, passwordHash, role = "user" }) {
    const doc = {
      username, usernameLower: username.toLowerCase(), email, passwordHash, role,
      bio: "", avatarImageId: null, friends: [], createdAt: new Date(),
    };
    try {
      const { insertedId } = await col().insertOne(doc);
      return { ...doc, _id: insertedId };
    } catch (err) {
      rethrowDuplicate(err);
    }
  },

  findById: (id) => col().findOne({ _id: id }),
  findByEmail: (email) => col().findOne({ email }),
  findByIds: (ids) => (ids.length ? col().find({ _id: { $in: ids } }).toArray() : []),

  async search(q, { skip = 0, limit = 20 } = {}) {
    const filter = q ? { $or: [{ usernameLower: new RegExp(escapeRegex(q.toLowerCase())) }, { bio: new RegExp(escapeRegex(q), "i") }] } : {};
    const [items, total] = await Promise.all([
      col().find(filter).sort({ usernameLower: 1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter),
    ]);
    return { items, total };
  },

  async update(id, changes) {
    const set = { ...changes };
    if (set.username) {
      set.usernameLower = set.username.toLowerCase();
      // explicit check so we return a clean 409 whatever the database reports for duplicate keys
      if (await col().findOne({ usernameLower: set.usernameLower, _id: { $ne: id } })) {
        throw new HttpError(409, "That username is taken.");
      }
    }
    try {
      await col().updateOne({ _id: id }, { $set: set });
    } catch (err) {
      rethrowDuplicate(err);
    }
    return col().findOne({ _id: id });
  },

  addFriend: (id, friendId) => col().updateOne({ _id: id }, { $addToSet: { friends: friendId } }),
  removeFriend: (id, friendId) => col().updateOne({ _id: id }, { $pull: { friends: friendId } }),

  // Deletes the account and everything it owns / left behind
  async remove(user) {
    const db = getDb();
    const id = user._id;
    for (const post of await Posts.allByUser(id)) await Posts.remove(post);
    for (const comment of await Comments.allByUser(id)) await Comments.remove(comment);
    await Albums.removeByUser(id);
    await Promise.all([
      db.collection("friendRequests").deleteMany({ $or: [{ fromId: id }, { toId: id }] }),
      db.collection("reports").deleteMany({ reporterId: id }),
      col().updateMany({ friends: id }, { $pull: { friends: id } }),
      db.collection("posts").updateMany({ likes: id }, { $pull: { likes: id } }),
      Images.remove(user.avatarImageId),
    ]);
    await col().deleteOne({ _id: id });
  },
};
