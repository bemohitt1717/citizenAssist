import mongoose from "mongoose";

const BUCKET_NAME = "completedDocuments";

const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Document storage is not connected.");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
};

export const storeCompletedDocument = ({ filename, buffer, contentType, metadata }) =>
  new Promise((resolve, reject) => {
    const upload = getBucket().openUploadStream(filename, { contentType, metadata });
    upload.once("error", reject);
    upload.once("finish", () => resolve(upload.id));
    upload.end(buffer);
  });

export const findCompletedDocument = (filename) => {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Document storage is not connected.");
  return db.collection(`${BUCKET_NAME}.files`).findOne({ filename });
};

export const openCompletedDocument = (id) => getBucket().openDownloadStream(id);

export const deleteCompletedDocument = (id) => getBucket().delete(id);
