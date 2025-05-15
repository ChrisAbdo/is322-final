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

  // Second stage: Upsert to Pinecone (simulate with delay)

  const queryResponse = await index.namespace("notes").upsert([
    {
      id: crypto.randomUUID(), // Generate a unique ID for each note
      values: embedding,
      metadata: { content: text },
    },
  ]);

  return new Response(JSON.stringify(queryResponse));
}
