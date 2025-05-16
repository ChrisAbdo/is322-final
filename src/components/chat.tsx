"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIVoiceInput } from "./ai-voice-input";
import { VoiceChat } from "./voice-chat";
import { speak } from "@/lib/tts-utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Source {
  content: string;
  score: number;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await processMessage(input);
    setInput("");
  }

  async function processMessage(message: string) {
    if (!message.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send query to the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      // Now process the data without debug logging

      // Add assistant response to chat
      const assistantResponse =
        typeof data.response === "string"
          ? data.response
          : "Received an invalid response format";

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Play the assistant response using TTS
      try {
        setIsSpeaking(true);
        await speak(assistantResponse);
      } catch (error) {
        console.error("TTS error:", error);
      } finally {
        setIsSpeaking(false);
      }

      // Store sources if available
      if (
        data.sources &&
        Array.isArray(data.sources) &&
        data.sources.length > 0
      ) {
        setSources(
          data.sources.filter(
            (source: any) =>
              source &&
              typeof source.content === "string" &&
              typeof source.score === "number"
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, there was an error processing your request.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVoiceMessage(message: string): Promise<void> {
    return processMessage(message);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-3xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {/* <h2 className="text-2xl font-semibold mb-2">DocMind Chatbot</h2>
            <p>Ask me a question about your documents!</p> */}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-100 ml-auto max-w-[80%]"
                  : "bg-gray-100 mr-auto max-w-[80%]"
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {message.role === "user" ? "You" : "NoteMind AI"}
              </p>
              <div className="whitespace-pre-wrap">
                {typeof message.content === "string"
                  ? message.content
                  : "Invalid message content"}
              </div>
            </div>
          ))
        )}

        {isLoading && !isSpeaking && (
          <div className="p-4 rounded-lg bg-gray-100 mr-auto max-w-[80%]">
            <p className="text-sm font-semibold mb-1">NoteMind AI</p>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="p-2 rounded-lg bg-blue-50 mr-auto max-w-[80%] flex items-center space-x-2 text-xs text-blue-600">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]" />
            </div>
            <span>Speaking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {sources.length > 0 && (
        <Collapsible className="mb-4">
          <CollapsibleTrigger className="flex items-center text-sm font-semibold mb-2">
            <span>Sources:</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded-lg">
              {sources.map((source, index) => (
                <div key={index} className="text-xs mb-2 p-2 bg-white rounded">
                  <div className="font-medium">
                    {typeof source.content === "string"
                      ? source.content.length > 100
                        ? `${source.content.substring(0, 100)}...`
                        : source.content
                      : "Invalid source content"}
                  </div>
                  <div className="text-gray-500 mt-1">
                    Relevance:{" "}
                    {typeof source.score === "number"
                      ? `${(source.score * 100).toFixed(2)}%`
                      : "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <Tabs defaultValue="voice" className="w-[400px]">
        <TabsList className="w-full">
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <div className="h-[120px]">
          {" "}
          {/* Fixed height container for tab content */}
          <TabsContent value="voice" className="h-full">
            <VoiceChat
              onStart={() => console.log("Recording started")}
              onSubmitMessage={handleVoiceMessage}
            />
          </TabsContent>
          <TabsContent value="chat" className="h-full">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
              >
                Send
              </button>
            </form>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
