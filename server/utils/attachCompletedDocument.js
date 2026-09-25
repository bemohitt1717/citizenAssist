import {
  deleteCompletedDocument,
  findCompletedDocument,
  storeCompletedDocument,
} from "./completedDocumentStorage.js";

export const attachCompletedDocument = async ({ request, file, userId, uploader, at }) => {
  if (!file?.buffer) {
    const error = new Error("A document file is required.");
    error.status = 400;
    throw error;
  }

  const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${safeName}`;
  const fileId = await storeCompletedDocument({
    filename,
    buffer: file.buffer,
    contentType: file.mimetype,
    metadata: { requestId: String(request._id), uploadedBy: String(userId), uploader },
  });

  const previousDocument = request.completedDocument;
  request.completedDocument = `/uploads/${filename}`;
  request.timeline.push({
    status: request.status,
    at,
    note: `Final document uploaded by the ${uploader}.`,
  });

  try {
    await request.save();
  } catch (error) {
    await deleteCompletedDocument(fileId).catch(() => {});
    throw error;
  }

  if (previousDocument?.startsWith("/uploads/")) {
    try {
      const previousFilename = previousDocument.split("/").pop();
      const previousFile = await findCompletedDocument(previousFilename);
      if (previousFile) await deleteCompletedDocument(previousFile._id);
    } catch (error) {
      console.warn("Could not remove the replaced final document from storage:", error.message);
    }
  }

  return { document: request.completedDocument, filename };
};
