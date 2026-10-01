import { getDb } from "./connection.js";
import { escapeRegex } from "../utils/validate.js";

const col = () => getDb().collection("albums");

export const Albums = {
  async create({ userId, name, description, hashtags }) {
    const now = new Date();
    const doc = { userId, name, description, hashtags, postIds: [], createdAt: now, updatedAt: now };
    const { insertedId } = await col().insertOne(doc);
    return { ...doc, _id: insertedId };
  },

  findById: (id) => col().findOne({ _id: id }),

  async list(filter, { skip, limit }) {
    const [items, total] = await Promise.all([
      col().find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments(filter),
    ]);
    return { items, total };
  },

  searchFilter(q) {
    const term = q.trim();
    if (term.startsWith("#")) return { hashtags: term.slice(1).toLowerCase() };
    const re = new RegExp(escapeRegex(term), "i");
    return { $or: [{ name: re }, { description: re }, { hashtags: term.toLowerCase() }] };
  },

  async update(id, changes) {
    await col().updateOne({ _id: id }, { $set: { ...changes, updatedAt: new Date() } });
    return col().findOne({ _id: id });
  },

  async addPost(id, postId) {
    await col().updateOne({ _id: id }, { $addToSet: { postIds: postId }, $set: { updatedAt: new Date() } });
    return col().findOne({ _id: id });
  },
  async removePost(id, postId) {
    await col().updateOne({ _id: id }, { $pull: { postIds: postId }, $set: { updatedAt: new Date() } });
    return col().findOne({ _id: id });
  },

  remove: (id) => col().deleteOne({ _id: id }),
  removeByUser: (userId) => col().deleteMany({ userId }),
};
