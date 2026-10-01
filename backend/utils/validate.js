import { ObjectId } from "mongodb";
import { HttpError } from "./errors.js";

export const oid = (value, label = "id") => {
  if (typeof value !== "string" || !ObjectId.isValid(value) || String(new ObjectId(value)) !== value) {
    throw new HttpError(400, `Invalid ${label}.`);
  }
  return new ObjectId(value);
};

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function cleanText(value, { field, max, required = false }) {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) {
    if (required) throw new HttpError(400, `${field} is required.`);
    return "";
  }
  if (v.length > max) throw new HttpError(400, `${field} must be ${max} characters or fewer.`);
  return v;
}

export function cleanUsername(value) {
  const v = cleanText(value, { field: "Username", max: 20, required: true });
  if (!/^[A-Za-z0-9_.]{3,20}$/.test(v)) {
    throw new HttpError(400, "Username must be 3-20 characters: letters, numbers, _ or . only.");
  }
  return v;
}

export function cleanEmail(value) {
  const v = cleanText(value, { field: "Email", max: 120, required: true }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new HttpError(400, "Enter a valid email address.");
  return v;
}

export function cleanPassword(value) {
  if (typeof value !== "string" || !value) throw new HttpError(400, "Password is required.");
  if (value.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    throw new HttpError(400, "Password must include at least one letter and one number.");
  }
  return value;
}

// Accepts ["a","#b"], '["a","b"]' (JSON string) or "#a #b, c". Returns unique lowercase tags without "#".
export function normalizeTags(input) {
  if (input == null || input === "") return [];
  let list = input;
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      list = Array.isArray(parsed) ? parsed : input.split(/[\s,]+/);
    } catch {
      list = input.split(/[\s,]+/);
    }
  }
  if (!Array.isArray(list)) throw new HttpError(400, "Hashtags must be a list.");
  const tags = [...new Set(list.map((t) => String(t).trim().replace(/^#/, "").toLowerCase()).filter(Boolean))];
  if (tags.length > 15) throw new HttpError(400, "Use 15 hashtags or fewer.");
  if (tags.some((t) => !/^[a-z0-9_]{1,30}$/.test(t))) {
    throw new HttpError(400, "Hashtags may only contain letters, numbers and _ (max 30 characters each).");
  }
  return tags;
}

export function parsePaging(query, defaultLimit = 12) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export const paged = (items, total, { page, limit }) => ({
  items,
  page,
  limit,
  total,
  hasMore: page * limit < total,
});
