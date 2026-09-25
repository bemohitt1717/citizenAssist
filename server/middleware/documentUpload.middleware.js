import multer from "multer";
import path from "node:path";

const supported = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

const uploadDocument = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const isSupported = supported.has(extension);
    callback(isSupported ? null : new Error("Only PDF, JPG and PNG documents are accepted."), isSupported);
  },
});

export default uploadDocument;
