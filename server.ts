import { Hono } from "https://deno.land/x/hono@v3.5.5/mod.ts";
import "https://deno.land/std@0.200.0/dotenv/load.ts";
import OpenAI from "https://esm.sh/openai@4.3.1";
import { ChatCompletion, ChatCompletionSSE } from "./mod.ts";

const API_KEY = Deno.env.get("API_KEY");

const openai = new OpenAI();

const app = new Hono();

app.post("/v1/chat/completions", async (ctx) => {
  if (
    // Check if the request has the correct API key
    API_KEY && API_KEY !==
      ctx.req.header("Authorization")?.slice("Bearer ".length)
  ) {
    return ctx.json({ error: "Invalid API key" }, 401);
  }

  // Extract config
  const config = await ctx.req.json();

  if (!config.stream) {
    // Handle non-streaming
    const response = await openai.chat.completions.create(config);
    return ctx.json(new ChatCompletion().completion(
      response.choices[0].message.content ?? "",
    ));
  }

  // Start SSE
  const stream = await openai.chat.completions.create(
    config as OpenAI.Chat.CompletionCreateParamsStreaming,
  );
  const completion = new ChatCompletionSSE({
    model: config.model,
  });

  setTimeout(async () => {
    for await (const part of stream) {
      const token = part.choices[0]?.delta?.content ?? "";
      completion.chunk(token);
    }
    completion.endChunk();
  });

  return completion.asResponse();
});

Deno.serve(app.fetch);
