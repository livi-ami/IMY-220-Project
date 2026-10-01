import { Binary } from "mongodb";
import { getDb } from "./connection.js";

// Images are stored in MongoDB itself so the database is fully self-contained
// (no uploads folder to lose when a container is removed).
const col = () => getDb().collection("images");

export const Images = {
  async create({ buffer, contentType }) {
    const { insertedId } = await col().insertOne({ data: new Binary(buffer), contentType, createdAt: new Date() });
    return insertedId;
  },
  findById: (id) => col().findOne({ _id: id }),
  async remove(id) {
    if (id) await col().deleteOne({ _id: id });
  },
};
