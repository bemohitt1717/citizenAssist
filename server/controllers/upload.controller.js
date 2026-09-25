import path from "node:path";
import Agent from "../model/agent.js";
import ServiceRequest from "../model/serviceRequest.js";
import { findCompletedDocument, openCompletedDocument } from "../utils/completedDocumentStorage.js";

export const getRequestDocument = async (req, res, next) => {
  try {
    const filename = req.params.filename;
    if (!filename || filename !== path.basename(filename) || !/^\d+-[a-zA-Z0-9._-]+$/.test(filename)) {
      return res.status(404).json({ status: "error", message: "Document not found." });
    }

    const storedPath = `/uploads/${filename}`;
    const request = await ServiceRequest.findOne({
      $or: [{ documents: storedPath }, { completedDocument: storedPath }],
    });
    if (!request) return res.status(404).json({ status: "error", message: "Document not found." });

    let canRead = req.user.role === "admin" || String(request.citizen) === String(req.user._id);
    if (!canRead && req.user.role === "agent" && request.agent) {
      const agent = await Agent.findOne({ user: req.user._id });
      canRead = Boolean(agent && String(agent._id) === String(request.agent));
    }
    if (!canRead) return res.status(404).json({ status: "error", message: "Document not found." });

    res.setHeader("Cache-Control", "private, no-store");
    if (request.completedDocument === storedPath) {
      const completedFile = await findCompletedDocument(filename);
      if (completedFile) {
        res.setHeader("Content-Type", completedFile.contentType || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${filename.replace(/^\d+-/, "")}"`);
        const stream = openCompletedDocument(completedFile._id);
        stream.on("error", (error) => {
          if (!res.headersSent) return next(error);
          res.destroy(error);
        });
        return stream.pipe(res);
      }
    }

    return res.sendFile(path.resolve("uploads", filename), (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    next(error);
  }
};
