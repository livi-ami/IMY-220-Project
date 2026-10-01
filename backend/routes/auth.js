import { Router } from "express";
import bcrypt from "bcryptjs";
import { Users } from "../db/users.js";
import { signToken, authenticate } from "../middleware/auth.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { cleanUsername, cleanEmail, cleanPassword } from "../utils/validate.js";
import { presentUser } from "../utils/presenters.js";

const router = Router();

// POST /api/auth/signup  { username, email, password }
router.post("/signup", asyncHandler(async (req, res) => {
  const username = cleanUsername(req.body?.username);
  const email = cleanEmail(req.body?.email);
  const password = cleanPassword(req.body?.password);
  const user = await Users.create({ username, email, passwordHash: await bcrypt.hash(password, 10) });
  res.status(201).json({ success: true, message: "Account created successfully.", token: signToken(user), user: presentUser(user, { self: true }) });
}));

// POST /api/auth/signin  { email, password }
router.post("/signin", asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) throw new HttpError(400, "Email and password are required.");
  const user = await Users.findByEmail(String(email).trim().toLowerCase());
  if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
    throw new HttpError(401, "Incorrect email or password.");
  }
  res.json({ success: true, message: "Signed in successfully.", token: signToken(user), user: presentUser(user, { self: true }) });
}));

// POST /api/auth/logout - tokens are stateless, so the client discards its token; this confirms the call
router.post("/logout", authenticate, (req, res) => {
  res.json({ success: true, message: "Logged out." });
});

// GET /api/auth/me - who am I? (used to restore a session on page load)
router.get("/me", authenticate, (req, res) => {
  res.json({ user: presentUser(req.user, { self: true }) });
});

export default router;
