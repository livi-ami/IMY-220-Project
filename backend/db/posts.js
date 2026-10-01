import { getDb } from "./connection.js";
import { Images } from "./images.js";
import { escapeRegex } from "../utils/validate.js";

const col = () => getDb().collection("posts");

export const Posts = {
  async create({ userId, imageId, caption, hashtags, eventName }) {
    const now = new Date();
    const doc = { userId, imageId, caption, hashtags, eventName, likes: [], commentCount: 0, createdAt: now, updatedAt: now };
    const { insertedId } = await col().insertOne(doc);
    return { ...doc, _id: insertedId };
  },

  findById: (id) => col().findOne({ _id: id }),
  count: (filter) => col().countDocuments(filter),

  findByIds: (ids) => (ids.length ? col().find({ _id: { $in: ids } }).toArray() : []),

  allByUser: (userId) => col().find({ userId }).toArray(),

  //filter
  async list(filter, { skip, limit }) {
    const [items, total] = await Promise.all([
      col().find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter),
    ]);
    return { items, total };
  },

  //matches caption or event text or exact hashtag
  searchFilter(q) {
    const term = q.trim();
    if (term.startsWith("#")) return { hashtags: term.slice(1).toLowerCase() };
    const re = new RegExp(escapeRegex(term), "i");
    return { $or: [{ caption: re }, { eventName: re }, { hashtags: term.toLowerCase() }] };
  },

  async update(id, changes) {
    await col().updateOne({ _id: id }, { $set: { ...changes, updatedAt: new Date() } });
    return col().findOne({ _id: id });
  },

  async like(id, userId) {
    await col().updateOne({ _id: id }, { $addToSet: { likes: userId } });
    return col().findOne({ _id: id });
  },
  async unlike(id, userId) {
    await col().updateOne({ _id: id }, { $pull: { likes: userId } });
    return col().findOne({ _id: id });
  },

  //deletes a post and everything with it
  async remove(post) {
    const db = getDb();
    await Promise.all([
      db.collection("comments").deleteMany({ postId: post._id }),
      db.collection("reports").deleteMany({ postId: post._id }),
      db.collection("albums").updateMany({ postIds: post._id }, { $pull: { postIds: post._id } }),
      Images.remove(post.imageId),
    ]);
    await col().deleteOne({ _id: post._id });
  },
};
