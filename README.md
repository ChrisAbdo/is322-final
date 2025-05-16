# NoteMind AI - Frontend

This is the frontend part of the NoteMind AI application, built with Next.js 15 and React 19. The frontend provides a modern interface for recording voice notes and interacting with them through AI-powered chat capabilities.

## Features

- **Voice Note Recording**: Record voice notes using the browser's Speech Recognition API
- **Real-time Transcription**: View and edit transcriptions of your voice notes in real-time
- **AI Chat**: Chat with your notes using natural language queries
- **Text-to-Speech**: Hear AI responses read aloud through high-quality speech synthesis
- **Notes Management**: View and manage all your saved notes

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Create a `.env.local` file with the following environment variables:

```
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app/`: Contains the main pages and API routes
- `src/components/`: Reusable UI components
- `src/components/ai-voice-input.tsx`: Voice recording component with transcription
- `src/components/chat.tsx`: AI chat interface with voice interaction
- `src/lib/`: Utility functions and shared code
- `src/lib/tts-utils.ts`: Text-to-speech utilities

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Speech Recognition](https://www.npmjs.com/package/react-speech-recognition)
- [ElevenLabs API](https://docs.elevenlabs.io/api-reference/text-to-speech)
- [OpenAI API](https://platform.openai.com/docs/api-reference)
- [Pinecone Documentation](https://docs.pinecone.io/)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
