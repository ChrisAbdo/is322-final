"use client";

import { Mic } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "./ui/textarea";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number, transcript?: string) => void;
  visualizerBars?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  className,
}: AIVoiceInputProps) {
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editableTranscript, setEditableTranscript] = useState("");

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (listening) {
      // Call onStart once when recording begins
      onStart?.();

      // Set up timer
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (time > 0) {
      // Only call onStop if we actually had a recording (time > 0)
      onStop?.(time, transcript);
      setTime(0);
    }

    // Cleanup interval on unmount or when listening changes
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [listening, onStart, onStop, time, transcript]);

  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const handleClick = useCallback(() => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setEditableTranscript("");
      setSubmitSuccess(false);
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [listening, resetTranscript]);

  const handleConfirm = () => {
    if (!editableTranscript) return;

    setIsSubmitting(true);

    // Using the same simple promise pattern as in the example
    const saveNotePromise = new Promise((resolve) => {
      // First send the API request
      fetch("/api/pc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: editableTranscript }),
      })
        .then(() => {
          // Simulate a delay to show the loading state
          setTimeout(() => {
            resolve({ success: true });
            setSubmitSuccess(true);
            resetTranscript();
            setEditableTranscript("");
            setIsSubmitting(false);
          }, 1000);
        })
        .catch(() => {
          setIsSubmitting(false);
          toast.error("Failed to save note");
        });
    });

    toast.promise(saveNotePromise, {
      loading: "Saving your note...",
      success: "Note saved successfully!",
      error: "Failed to save note",
    });
  };

  if (!isClient) return null;

  if (isClient && !browserSupportsSpeechRecognition) {
    return (
      <p className="text-center text-red-500">
        Browser doesn't support speech recognition.
      </p>
    );
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            listening
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {listening ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            listening
              ? "text-black/70 dark:text-white/70"
              : "text-black/30 dark:text-white/30"
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {isClient &&
            [...Array(visualizerBars)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-0.5 rounded-full transition-all duration-300",
                  listening
                    ? "bg-black/50 dark:bg-white/50 animate-pulse"
                    : "bg-black/10 dark:bg-white/10 h-1"
                )}
                style={
                  listening
                    ? {
                        height: `${20 + Math.random() * 80}%`,
                        animationDelay: `${i * 0.05}s`,
                      }
                    : undefined
                }
              />
            ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {listening ? "Listening..." : "Click to record note"}
        </p>

        {transcript && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg w-full max-h-40 overflow-y-auto">
            <Textarea
              className="min-h-[80px] text-sm text-black/80 dark:text-white/80 w-full"
              value={editableTranscript}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditableTranscript(e.target.value)
              }
              placeholder="Edit your transcription here..."
            />

            {submitSuccess ? (
              <p className="text-green-500 text-sm mt-2">
                Note saved successfully!
              </p>
            ) : (
              <Button
                className="mt-3 w-full"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Confirm"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
