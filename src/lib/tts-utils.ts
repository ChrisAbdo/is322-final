export interface TTSOptions {
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
  speed?: number;
}

const DEFAULT_OPTIONS: TTSOptions = {
  voiceId: "21m00Tcm4TlvDq8ikWAM", // Default ElevenLabs voice ID (Rachel)
  stability: 0.5,
  similarityBoost: 0.8,
  speed: 1.0,
};

/**
 * Creates a text-to-speech audio stream using ElevenLabs API
 * @param text Text to convert to speech
 * @param options TTS options (voice ID, stability, etc.)
 * @returns Promise resolving to an Audio element playing the speech
 */
export function createSpeech(
  text: string,
  options: TTSOptions = {}
): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    // Merge default options with provided options
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Use the API route we created to proxy the request
    fetch(`/api/tts?text=${encodeURIComponent(text)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`TTS API error: ${response.status}`);
        }
        return response.blob();
      })
      .then((audioBlob) => {
        // Create an audio element to play the speech
        const audio = new Audio();
        audio.src = URL.createObjectURL(audioBlob);

        // Resolve with the audio element once it can play
        audio.oncanplaythrough = () => {
          resolve(audio);
        };

        // Handle errors
        audio.onerror = (e) => {
          reject(new Error(`Audio playback error: ${e}`));
        };

        // Start loading the audio
        audio.load();
      })
      .catch(reject);
  });
}

/**
 * Speaks the given text using the TTS service
 * @param text Text to speak
 * @param options TTS options
 * @returns Promise that resolves when speech begins playing
 */
export function speak(text: string, options?: TTSOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    createSpeech(text, options)
      .then((audio) => {
        // Start playing the audio
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Speech has started playing
              resolve();
            })
            .catch((error) => {
              reject(new Error(`Failed to play audio: ${error}`));
            });
        } else {
          // Older browsers might not return a promise
          resolve();
        }
      })
      .catch(reject);
  });
}
