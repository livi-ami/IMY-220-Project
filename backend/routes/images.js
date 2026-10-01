import { Router } from "express";
import { Images } from "../db/images.js";
import { HttpError, asyncHandler } from "../utils/errors.js";
import { oid } from "../utils/validate.js";

const router = Router();

//GET /api/images/:id - public so <img src="..."> works without an auth header
router.get("/:id", asyncHandler(async (req, res) => {
  const image = await Images.findById(oid(req.params.id, "image id"));
  if (!image) throw new HttpError(404, "Image not found.");
  const bytes = Buffer.from(image.data.buffer.subarray(0, image.data.position ?? image.data.buffer.length));
  res.set({
    "Content-Type": image.contentType,
    "Cache-Control": "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
  });
  res.send(bytes);
}));

export default router;