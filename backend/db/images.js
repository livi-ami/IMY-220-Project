import { Binary } from "mongodb";
import { getDb } from "./connection.js";

//images are stored in MongoDB so the database is fully self-contained
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
