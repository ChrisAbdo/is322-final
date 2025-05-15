async function getNotes() {
  // Using absolute URL for local development
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const response = await fetch(`${apiUrl}/api/get-notes`, {
    // Ensure fresh data on each request
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }

  const data = await response.json();
  return data.success ? data.data : [];
}

export default async function NotesDisplay() {
  const notes = await getNotes();

  if (!notes.length) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
        <p className="mt-1 text-gray-500">
          Get started by creating your first note.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note: any) => (
        <div
          key={note.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <p className="text-gray-600 mt-2">
            {note.metadata?.content?.substring(0, 150) || "No content"}
            {(note.metadata?.content?.length || 0) > 150 ? "..." : ""}
          </p>
          <div className="mt-3 flex items-center text-sm text-gray-500">
            {note.metadata?.createdAt && (
              <time dateTime={note.metadata.createdAt}>
                {new Date(note.metadata.createdAt).toLocaleDateString()}
              </time>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
