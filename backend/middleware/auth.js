import jwt from "jsonwebtoken";
import { Users } from "../db/users.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid } from "../utils/validate.js";

const secret = () => process.env.JWT_SECRET || "dev-secret-change-me";

export const signToken = (user) => jwt.sign({ sub: user._id.toString() }, secret(), { expiresIn: "7d" });

// Requires "Authorization: Bearer <token>". Loads the user onto req.user.
export const authenticate = asyncHandler(async (req, res, next) => {
  const [type, token] = (req.headers.authorization || "").split(" ");
  if (type !== "Bearer" || !token) throw new HttpError(401, "You need to log in first.");

  let payload;
  try {
    payload = jwt.verify(token, secret());
  } catch {
    throw new HttpError(401, "Your session has expired. Please log in again.");
  }
  const user = await Users.findById(oid(payload.sub));
  if (!user) throw new HttpError(401, "This account no longer exists.");
  req.user = user;
  next();
});

export const requireAdmin = (req, res, next) =>
  req.user?.role === "admin" ? next() : next(new HttpError(403, "Administrator access required."));

// Allows the owner of a resource, or an admin
export function assertOwnerOrAdmin(user, ownerId, what = "this") {
  if (user.role !== "admin" && !user._id.equals(ownerId)) {
    throw new HttpError(403, `You can only change ${what} if you own it.`);
  }
}
