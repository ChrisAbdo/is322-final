import { embed, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
const index = pc.index("docmindsite");

export async function POST(req: Request) {
  const { query } = await req.json();

  try {
    // Create embedding from user query
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: query,
    });

    // Query Pinecone for similar documents
    const queryResponse = await index.namespace("notes").query({
      vector: embedding,
      topK: 5,
      includeMetadata: true,
    });

    // Extract relevant context from query results
    const matchedDocuments = queryResponse.matches || [];
    const context = matchedDocuments
      .map((match) => match.metadata?.content || "")
      .filter(Boolean)
      .join("\n\n");

    // Generate response using the AI SDK
    const { text } = await generateText({
      model: openai.chat("gpt-3.5-turbo"),
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that answers questions based on the following context: \n\n${context}`,
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    // Create sources array from matched documents
    const sources = matchedDocuments.map((match) => ({
      content:
        typeof match.metadata?.content === "string"
          ? match.metadata.content
          : "",
      score: typeof match.score === "number" ? match.score : 0,
    }));

    // Return response and sources
    return new Response(
      JSON.stringify({
        response: text,
        sources: sources,
      })
    );
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return new Response(
      JSON.stringify({
        response: "Sorry, there was an error processing your request.",
        sources: [],
      }),
      { status: 500 }
    );
  }
}
