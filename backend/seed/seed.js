//npm run seed to wipe and seed the database with sample data
import "dotenv/config";
import { connectDB, closeDB } from "../db/connection.js";
import { wipe, seedDatabase } from "./seedData.js";

try {
  const db = await connectDB();
  await wipe(db);
  const counts = await seedDatabase(db);
  console.log(`Seeded "${db.databaseName}":`, counts);
  console.log("Sample logins -> concertkid@encore.test / Password123   |   admin@encore.test / Admin1234");
} catch (err) {
  console.error("Seeding failed:", err.message);
  process.exitCode = 1;
} finally {
  await closeDB();
}