import Service from "../model/service.js";

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      status: "success",
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!service) {
      return res.status(404).json({
        status: "error",
        message: "Service not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      requiredDocuments,
      estimatedTime,
      assistanceFee,
      eligibility,
      process,
    } = req.body;

    if (
      !name ||
      !description ||
      !requiredDocuments ||
      !estimatedTime ||
      assistanceFee === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required service details",
      });
    }

    const existingService = await Service.findOne({ name });

    if (existingService) {
      return res.status(409).json({
        status: "error",
        message: "Service already exists",
      });
    }

    const service = await Service.create({
      name,
      description,
      requiredDocuments,
      estimatedTime,
      assistanceFee,
      eligibility,
      process,
    });

    res.status(201).json({
      status: "success",
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};