import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { generateQuotePDF } from "../utils/pdf";
import { exportPdfRequestSchema } from "../validators/export";

export async function exportPdf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const payload = exportPdfRequestSchema.parse(req.body);
    const buffer = await generateQuotePDF({
      ...payload.quote,
      meta: payload.meta,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=quote.pdf",
    );
    res.send(buffer);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation failed",
        details: error.errors,
      });
      return;
    }
    next(error);
  }
}
