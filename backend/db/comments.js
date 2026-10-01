import { getDb } from "./connection.js";

const col = () => getDb().collection("comments");
const bumpCount = (postId, n) => getDb().collection("posts").updateOne({ _id: postId }, { $inc: { commentCount: n } });

export const Comments = {
  async create({ postId, userId, text }) {
    const doc = { postId, userId, text, createdAt: new Date() };
    const { insertedId } = await col().insertOne(doc);
    await bumpCount(postId, 1);
    return { ...doc, _id: insertedId };
  },

  findById: (id) => col().findOne({ _id: id }),
  allByUser: (userId) => col().find({ userId }).toArray(),

  async listByPost(postId, { skip, limit }) {
    const [items, total] = await Promise.all([
      col().find({ postId }).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).toArray(),
      col().countDocuments({ postId }),
    ]);
    return { items, total };
  },

  async update(id, text) {
    await col().updateOne({ _id: id }, { $set: { text, editedAt: new Date() } });
    return col().findOne({ _id: id });
  },

  async remove(comment) {
    await col().deleteOne({ _id: comment._id });
    await bumpCount(comment.postId, -1);
  },
};