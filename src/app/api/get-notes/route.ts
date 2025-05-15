import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});
const index = pc.index("docmindsite");

export async function GET(req: Request) {
  try {
    const namespace = "notes";

    // Get index stats to get total number of records in the namespace
    const stats = await index.namespace(namespace).describeIndexStats();
    const recordCount = stats.namespaces?.[namespace]?.recordCount || 0;

    if (recordCount === 0) {
      // Return empty array if no records
      return Response.json({ success: true, data: [] });
    }

    // Use a query with a vector of zeros to match all records
    // This is a workaround since Pinecone doesn't have a "fetch all" method
    const dimension = stats.dimension;
    const zeroVector = new Array(dimension).fill(0);

    const queryResponse = await index.namespace(namespace).query({
      vector: zeroVector,
      topK: recordCount, // Request all records
      includeMetadata: true,
    });

    return Response.json({
      success: true,
      data: queryResponse.matches,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return Response.json(
      { success: false, error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
