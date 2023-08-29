import { Hono } from "https://deno.land/x/hono@v3.5.5/mod.ts";
import "https://deno.land/std@0.200.0/dotenv/load.ts";
import {
  makeChatGPTGenerator,
} from "https://deno.land/x/vercel_ai@1.0.0/mod.ts";
import { ChatCompletionSSE } from "./mod.ts";

const API_KEY = Deno.env.get("API_KEY");

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
  config.model = `openai:${config.model}`;

  // Start SSE
  const completion = new ChatCompletionSSE({
    model: config.model,
  });

  setTimeout(async () => {
    for await (
      const _ of completion.pipe(
        makeChatGPTGenerator()(config),
      )
    ) {
      // `completion.pipe` already gets things done
    }
  });

  return completion.asResponse();
});

Deno.serve(app.fetch);
