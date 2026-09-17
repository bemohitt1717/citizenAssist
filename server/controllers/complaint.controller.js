import Complaint from "../model/complaint.js";
import ServiceRequest from "../model/serviceRequest.js";

export const createComplaint = async (req, res, next) => {
  try {
    const { requestId, subject, description } = req.body;

    if (!requestId || !subject?.trim() || !description?.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Request, subject, and description are required.",
      });
    }

    const request = await ServiceRequest.findOne({
      _id: requestId,
      citizen: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Request not found.",
      });
    }

    const existingComplaint = await Complaint.findOne({
      citizen: req.user._id,
      request: request._id,
      status: { $in: ["open", "under-review"] },
    });

    if (existingComplaint) {
      return res.status(409).json({
        status: "error",
        message: "You already have an open complaint for this request.",
      });
    }

    const complaint = await Complaint.create({
      citizen: req.user._id,
      request: request._id,
      against: request.agentName || null,
      subject: subject.trim(),
      description: description.trim(),
    });

    console.log("📞 [COMPLAINT] Created:", {
      complaint: complaint._id.toString(),
      request: request.reference,
      citizen: req.user._id.toString(),
    });

    return res.status(201).json({
      status: "success",
      message: "Complaint submitted successfully.",
      data: { complaint: { id: complaint._id, status: complaint.status } },
    });
  } catch (error) {
    console.error("❌ [COMPLAINT] Create failed:", error);
    next(error);
  }
};
