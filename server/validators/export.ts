import { z } from "zod";
import { quoteBreakdownSchema } from "./quote";

export const exportPdfRequestSchema = z.object({
  quote: quoteBreakdownSchema,
  meta: z
    .object({
      projectTitle: z.string().optional(),
      clientName: z.string().optional(),
      createdAt: z.string().optional(),
    })
    .optional(),
});

export type ExportPdfRequest = z.infer<typeof exportPdfRequestSchema>;
