import { Router } from "express";
import { ReportReasons, Reports } from "../db/reports.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import { cleanText } from "../utils/validate.js";

const router = Router();
router.use(authenticate);

const presentReason = (r) => ({ id: r._id.toString(), label: r.label });

//GET /api/report-reasons - the choices shown in the "report post" form
router.get("/report-reasons", asyncHandler(async (req, res) => {
  res.json({ items: (await ReportReasons.list()).map(presentReason) });
}));

//POST /api/report-reasons  { label } (admin)
router.post("/report-reasons", requireAdmin, asyncHandler(async (req, res) => {
  const label = cleanText(req.body?.label, { field: "Reason", max: 60, required: true });
  res.status(201).json({ success: true, reason: presentReason(await ReportReasons.create(label)) });
}));

//GET /api/reports (admin) - all reports, newest first
router.get("/reports", requireAdmin, asyncHandler(async (req, res) => {
  const reports = await Reports.list();
  res.json({
    items: reports.map((r) => ({
      id: r._id.toString(), postId: r.postId.toString(), reporterId: r.reporterId.toString(),
      reasonId: r.reasonId.toString(), details: r.details, status: r.status, createdAt: r.createdAt,
    })),
  });
}));

export default router;