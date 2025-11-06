import { Router } from "express";
import { exportPdf } from "../controllers/export.controller";

const router = Router();

router.post("/pdf", exportPdf);

export default router;
