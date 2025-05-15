import { Suspense } from "react";
import NotesDisplay from "@/components/note-display";

export default function Home() {
  return (
    <main className="container mx-auto p-4 max-w-4xl mt-20">
      <Suspense fallback={<div>Loading...</div>}>
        <NotesDisplay />
      </Suspense>
    </main>
  );
}
