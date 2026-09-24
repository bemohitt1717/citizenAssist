import express from "express";
import { createService, getServiceById, getServices } from "../controllers/service.controller.js";
import { authorize, protect } from "../middleware/auth.midleware.js";


const serviceRouter = express.Router();

serviceRouter.get("/services", getServices);
serviceRouter.get("/services/:id", getServiceById);
serviceRouter.post("/services", protect, authorize("admin"), createService);

export default serviceRouter;
