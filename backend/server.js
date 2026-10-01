import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./db/connection.js";
import { seedIfEmpty } from "./seed/seedData.js";

const PORT = process.env.PORT || 5000;

try {
  const db = await connectDB();
  console.log(`Connected to MongoDB database "${db.databaseName}"`);
  if (process.env.AUTO_SEED !== "false") await seedIfEmpty(db);

  createApp().listen(PORT, "0.0.0.0", () => console.log(`Encore backend listening on port ${PORT}`));
} catch (err) {
  console.error("Failed to start the backend:", err.message);
  process.exit(1);
}
