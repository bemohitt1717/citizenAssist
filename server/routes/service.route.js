import express from "express";
import { createService, getServiceById, getServices } from "../controllers/service.controller.js";


const serviceRouter = express.Router();

serviceRouter.get("/services", getServices);
serviceRouter.get("/services/:id", getServiceById);
serviceRouter.post("/services", createService)

export default serviceRouter;