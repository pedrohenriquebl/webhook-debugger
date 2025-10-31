import { z } from "zod";

export const webhookListSchemaItem = z.object({
  id: z.string().uuid(),
  method: z.string(),
  pathname: z.string(),
  createdAt: z.coerce.date(),
});

export const webhookListSchema = z.object({
  webhooks: z.array(webhookListSchemaItem),
  nextCursor: z.string().nullable(),
});

export const webhooksDetailsSchema = z.object({
  id: z.string().uuid(),
  method: z.string(),
  pathname: z.string(),
  ip: z.string(),
  contentType: z.string().nullable(),
  contentLength: z.number().nullable(),
  statusCode: z.number(),
  queryParams: z.record(z.string(), z.string()).nullable(),
  headers: z.record(z.string(), z.string()),
  body: z.string().nullable(),
  createdAt: z.coerce.date(),
});
