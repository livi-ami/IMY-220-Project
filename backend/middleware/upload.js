import multer from "multer";
import { HttpError } from "../utils/errors.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED.includes(file.mimetype) ? cb(null, true) : cb(new HttpError(400, "Only JPG, PNG, WEBP or GIF images are allowed.")),
});

//parses a multipart form with one optional image field into req.file
export const uploadImage = (field = "image") => (req, res, next) =>
  upload.single(field)(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return next(new HttpError(400, err.code === "LIMIT_FILE_SIZE" ? "Image must be smaller than 5MB." : err.message));
    }
    next(err);
  });