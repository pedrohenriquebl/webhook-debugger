import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { webhooks } from "@/db/schema";
import { db } from "@/db";
import { inArray } from "drizzle-orm";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/generate",
    {
      schema: {
        summary: "Generate a Typescript webhook handler",
        tags: ["Webhooks"],
        body: z.object({
          webhookIds: z.array(z.string()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { webhookIds } = request.body;

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds));

      const webhooksBodys = result.map((webhook) => webhook.body).join("\n\n");

      const { text } = await generateText({
        model: google("gemini-2.5-flash-lite"),
        prompt: `
        You are an expert TypeScript developer specialized in building webhook handlers with input validation.

        You will receive the raw JSON bodies of several webhook examples. Each body represents a possible event that can be received by a webhook endpoint.

        Your task is to generate a complete, production-ready TypeScript code that can handle all these webhook events.

        The output must include:

        1. A zod schema for each distinct webhook event type.
        2. A discriminated union type for all events.
        3. A handler function called handleWebhookEvent(event: WebhookEvent) that processes each type.
        4. Return only the TypeScript code.

        Here are the webhook examples payloads:

        ${webhooksBodys}

        Return only the code and do not return \'\'\' typescript or any other markdown symbols, do not include any other text or introduction before or after the code.
`.trim(),
      });

      return reply.status(201).send({ code: text });
    }
  );
};
