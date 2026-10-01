import { MongoClient } from "mongodb";

let client;
let db;

export async function connectDB(uri = process.env.MONGO_URI, dbName = process.env.DB_NAME || "encore") {
  if (!uri) throw new Error("MONGO_URI is not set. Copy .env.example to .env and add your connection string.");
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db(dbName);
  await createIndexes(db);
  return db;
}

export function getDb() {
  if (!db) throw new Error("Database is not connected yet.");
  return db;
}

export const closeDB = () => client?.close();

async function createIndexes(db) {
  await Promise.all([
    db.collection("users").createIndex({ usernameLower: 1 }, { unique: true }),
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("posts").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("posts").createIndex({ createdAt: -1 }),
    db.collection("posts").createIndex({ hashtags: 1 }),
    db.collection("comments").createIndex({ postId: 1, createdAt: -1 }),
    db.collection("albums").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("friendRequests").createIndex({ fromId: 1, toId: 1 }, { unique: true }),
    db.collection("reports").createIndex({ postId: 1, reporterId: 1 }, { unique: true }),
    db.collection("reportReasons").createIndex({ label: 1 }, { unique: true }),
  ]);
}