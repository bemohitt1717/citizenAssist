import ServiceRequest from "../model/serviceRequest.js";
import Service from "../model/service.js";
import { getNextReference } from "../utils/counter.js";

// Submit a new service request (citizen only)
export const createServiceRequest = async (req, res, next) => {
  try {
    console.log('📝 [REQUEST] Creating service request:', {
      user: req.user._id,
      body: req.body,
    });

    const { serviceId, applicantDetails, documents } = req.body;

    // Check required fields
    if (!serviceId || !applicantDetails) {
      console.log('❌ [ERROR] Missing required fields');
      return res.status(400).json({
        status: "error",
        message: "Service ID and applicant details are required.",
      });
    }

    const { fullName, phone, district } = applicantDetails;

    if (!fullName || !phone || !district) {
      console.log('❌ [ERROR] Missing applicant details');
      return res.status(400).json({
        status: "error",
        message: "Full name, phone, and district are required.",
      });
    }

    // Find service from constants by ID (we're storing string ID, not ObjectId)
    // This matches frontend's service constants
    const validServiceIds = [
      "income-certificate",
      "caste-certificate",
      "domicile-certificate",
      "birth-certificate",
      "pan-services",
      "aadhaar-services",
    ];

    if (!validServiceIds.includes(serviceId)) {
      console.log('❌ [ERROR] Invalid service ID:', serviceId);
      return res.status(404).json({
        status: "error",
        message: "Invalid service ID.",
      });
    }

    // Map service ID to name (you can move this to a helper later)
    const serviceNames = {
      "income-certificate": "Income Certificate",
      "caste-certificate": "Caste Certificate",
      "domicile-certificate": "Domicile Certificate",
      "birth-certificate": "Birth Certificate",
      "pan-services": "PAN Services",
      "aadhaar-services": "Aadhaar Services",
    };

    // Generate unique reference like CA-4821
    const reference = await getNextReference();
    console.log('🔢 [GENERATED] Reference number:', reference);

    // Create first timeline entry
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    const timeline = [
      {
        status: "pending",
        at: formattedDate,
        note: "Request received.",
      },
    ];

    // Create service request
    const serviceRequest = await ServiceRequest.create({
      reference,
      citizen: req.user._id, // From protect middleware
      serviceId,
      serviceName: serviceNames[serviceId],
      status: "pending",
      applicantDetails: {
        fullName,
        phone,
        email: applicantDetails.email || "",
        district,
        address: applicantDetails.address || "",
      },
      timeline,
      documents: documents || [],
      agent: null,
      agentName: null,
      charge: null,
    });

    console.log('✅ [SUCCESS] Request created:', {
      id: serviceRequest._id,
      reference: serviceRequest.reference,
      serviceId: serviceRequest.serviceId,
    });

    return res.status(201).json({
      status: "success",
      message: "Request submitted successfully.",
      data: {
        request: {
          id: serviceRequest._id,
          reference: serviceRequest.reference,
          serviceId: serviceRequest.serviceId,
          status: serviceRequest.status,
          createdAt: serviceRequest.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('❌ [ERROR] Failed to create request:', error);
    next(error);
  }
};

// Get all requests for logged-in citizen
export const getCitizenRequests = async (req, res, next) => {
  try {
    console.log('📋 [REQUEST] Fetching requests for citizen:', req.user._id);

    const requests = await ServiceRequest.find({
      citizen: req.user._id,
    }).sort({ createdAt: -1 });

    console.log(`✅ [SUCCESS] Found ${requests.length} requests`);

    // Format for frontend (match DEMO_REQUESTS shape)
    const formattedRequests = requests.map((request) => ({
      id: request._id,
      reference: request.reference,
      serviceId: request.serviceId,
      status: request.status,
      agentName: request.agentName,
      charge: request.charge,
      applicantDetails: request.applicantDetails,
      documents: request.documents,
      completedDocument: request.completedDocument,
      createdAt: request.createdAt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      timeline: request.timeline,
    }));

    return res.json({
      status: "success",
      count: formattedRequests.length,
      data: {
        requests: formattedRequests,
      },
    });
  } catch (error) {
    console.error('❌ [ERROR] Failed to fetch requests:', error);
    next(error);
  }
};

export const updateCitizenRequest = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({ _id: req.params.id, citizen: req.user._id });
    if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });
    if (['completed', 'cancelled', 'rejected'].includes(request.status)) {
      return res.status(400).json({ status: 'error', message: 'This request can no longer be edited.' });
    }

    const details = req.body.applicantDetails || {};
    const nextDetails = {
      ...request.applicantDetails.toObject(),
      ...details,
    };
    if (!nextDetails.fullName?.trim() || !nextDetails.phone?.trim() || !nextDetails.district?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Full name, phone, and district are required.' });
    }

    request.applicantDetails = nextDetails;
    if (request.status === 'action') request.status = 'review';
    request.timeline.push({
      status: request.status,
      at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      note: 'Citizen updated the request details and resubmitted the information.',
    });
    await request.save();

    console.log('✏️ [REQUEST] Citizen updated request:', request.reference);
    return res.json({ status: 'success', message: 'Request updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const uploadCitizenRequestDocument = async (req, res, next) => {
  try {
    const request = await ServiceRequest.findOne({ _id: req.params.id, citizen: req.user._id });
    if (!request) return res.status(404).json({ status: 'error', message: 'Request not found.' });
    if (['completed', 'cancelled', 'rejected'].includes(request.status)) {
      return res.status(400).json({ status: 'error', message: 'This request can no longer receive documents.' });
    }
    if (!req.file) return res.status(400).json({ status: 'error', message: 'A document file is required.' });

    request.documents.push(`/uploads/${req.file.filename}`);
    if (request.status === 'action') request.status = 'review';
    request.timeline.push({
      status: request.status,
      at: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      note: `Citizen uploaded ${req.body.documentId || req.file.originalname}.`,
    });
    await request.save();

    console.log('📎 [REQUEST] Citizen uploaded document:', { reference: request.reference, file: req.file.filename });
    return res.json({ status: 'success', message: 'Document uploaded successfully.' });
  } catch (error) {
    next(error);
  }
};
