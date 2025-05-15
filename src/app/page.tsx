"use client";
import { AIVoiceInput } from "@/components/ai-voice-input";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Chat from "@/components/chat";

export default function Home() {
  const [recordings, setRecordings] = useState<
    { duration: number; timestamp: Date }[]
  >([]);

  const handleStop = (duration: number) => {
    setRecordings((prev) => [
      ...prev.slice(-4),
      { duration, timestamp: new Date() },
    ]);
  };

  return (
    // <div className="space-y-8">
    //   <div className="space-y-4">
    // <AIVoiceInput
    //   onStart={() => console.log("Recording started")}
    //   onStop={handleStop}
    // />
    //   </div>
    // </div>
    <>
      <div className="flex justify-center items-center">
        <Tabs defaultValue="record" className="">
          <TabsList className="mx-auto">
            <TabsTrigger value="record">Record note</TabsTrigger>
            <TabsTrigger value="chat">Chat with notes</TabsTrigger>
          </TabsList>
          <TabsContent value="record">
            <AIVoiceInput
              onStart={() => console.log("Recording started")}
              onStop={handleStop}
            />
          </TabsContent>
          <TabsContent value="chat">
            <Chat />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
