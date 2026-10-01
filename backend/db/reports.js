import { getDb } from "./connection.js";
import { HttpError } from "../utils/errors.js";

const reasons = () => getDb().collection("reportReasons");
const reports = () => getDb().collection("reports");

export const ReportReasons = {
  list: () => reasons().find({}).sort({ label: 1 }).toArray(),
  findById: (id) => reasons().findOne({ _id: id }),
  async create(label) {
    try {
      const { insertedId } = await reasons().insertOne({ label, createdAt: new Date() });
      return { _id: insertedId, label };
    } catch (err) {
      if (err?.code === 11000) throw new HttpError(409, "That reason already exists.");
      throw err;
    }
  },
};

export const Reports = {
  async create({ postId, reporterId, reasonId, details }) {
    const doc = { postId, reporterId, reasonId, details, status: "open", createdAt: new Date() };
    try {
      const { insertedId } = await reports().insertOne(doc);
      return { ...doc, _id: insertedId };
    } catch (err) {
      if (err?.code === 11000) throw new HttpError(409, "You have already reported this post.");
      throw err;
    }
  },
  list: () => reports().find({}).sort({ createdAt: -1 }).toArray(),
};
