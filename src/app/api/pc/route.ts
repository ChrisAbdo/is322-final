import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
const index = pc.index("docmindsite");

// Helper function to simulate a delay

export async function POST(req: Request) {
  const { text } = await req.json();

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: text,
  });

  const queryResponse = await index.namespace("notes").upsert([
    {
      id: crypto.randomUUID(),
      values: embedding,
      metadata: { content: text },
    },
  ]);

  return new Response(JSON.stringify(queryResponse));
}
