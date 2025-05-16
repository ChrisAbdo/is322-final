export async function GET(request: Request) {
  try {
    // Get text from query params
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");

    if (!text) {
      return new Response("Text parameter is required", { status: 400 });
    }

    // Use a default voice ID (Rachel)
    const voiceId = "G17SuINrv2H9FC6nvetn";
    // sk_0ecbd4222e94c1e39361baa9b58a44d89137230c8f87d20f
    const apiKey = "sk_7555d6f1677c0be91d5ca7c565629ed3c53a700e514d5c62";

    // Make a direct API call to ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error details:", errorText);
      throw new Error(
        `ElevenLabs API error: ${response.status} ${response.statusText}`
      );
    }

    // Get the audio data
    const audioData = await response.arrayBuffer();

    // Return the audio stream
    return new Response(audioData, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    return new Response("Error generating speech", { status: 500 });
  }
}
