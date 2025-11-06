import { Router } from "express";
import { previewQuote } from "../controllers/quote.controller";

const router = Router();

router.post("/preview", previewQuote);

export default router;
