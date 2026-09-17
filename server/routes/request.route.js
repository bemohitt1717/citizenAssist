import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createServiceRequest,
  getCitizenRequests,
  updateCitizenRequest,
  uploadCitizenRequestDocument,
} from "../controllers/request.controller.js";
import { authorize, protect } from "../middleware/auth.midleware.js";

const requestRouter = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      const directory = path.resolve("uploads");
      fs.mkdirSync(directory, { recursive: true });
      callback(null, directory);
    },
    filename: (_req, file, callback) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      callback(null, `${Date.now()}-${safeName}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Submit new request (citizen only)
requestRouter.post(
  "/requests",
  protect,
  authorize("citizen"),
  createServiceRequest
);

// Get my requests (citizen only)
requestRouter.get(
  "/citizen/requests",
  protect,
  authorize("citizen"),
  getCitizenRequests
);

requestRouter.patch(
  "/citizen/requests/:id",
  protect,
  authorize("citizen"),
  updateCitizenRequest
);

requestRouter.post(
  "/citizen/requests/:id/documents",
  protect,
  authorize("citizen"),
  upload.single("document"),
  uploadCitizenRequestDocument
);

export default requestRouter;