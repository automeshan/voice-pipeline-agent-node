# Voice Pipeline Agent: Beginner's Guide

## Introduction for Basic Coders

If you're familiar with TypeScript and React but new to this project, this guide will help you understand how this voice assistant works in simple terms.

## What This Project Does

This project creates an AI voice assistant that:
1. Listens to what you say
2. Understands your words
3. Thinks about an appropriate response
4. Speaks back to you with a natural-sounding voice

It's like having Siri or Alexa, but running on LiveKit's technology.

## Key Components Explained Simply

### 1. Voice Activity Detection (VAD)
This is like a digital ear that listens for when someone is speaking versus when it's just background noise. The project uses a tool called "Silero" for this part.

```typescript
// This loads the "digital ear"
proc.userData.vad = await silero.VAD.load();
```

### 2. Speech-to-Text (STT)
This component takes the sound of your voice and converts it into written text. The project uses "Deepgram" for this.

```typescript
// This creates the component that turns speech into text
new deepgram.STT()
```

### 3. Language Processing (LLM)
This is the "brain" that reads the text of what you said, understands it, and decides how to respond. The project uses OpenAI's technology (similar to ChatGPT) for this.

```typescript
// This creates the AI "brain" that understands and responds
new openai.LLM()
```

### 4. Text-to-Speech (TTS)
This turns the AI's text response back into spoken words. The project uses "ElevenLabs" for this, which creates very natural-sounding speech.

```typescript
// This creates the component that turns text back into speech
new elevenlabs.TTS()
```

## How These Parts Work Together

The magic happens in these lines:

```typescript
const agent = new pipeline.VoicePipelineAgent(
  vad,                 // The "digital ear"
  new deepgram.STT(),  // Speech-to-text
  new openai.LLM(),    // AI "brain"
  new elevenlabs.TTS(), // Text-to-speech
  { chatCtx: initialContext, fncCtx },
);
```

Think of it like an assembly line:
1. The VAD listens for speech
2. When it hears speech, it sends the audio to Deepgram
3. Deepgram converts it to text and sends it to OpenAI
4. OpenAI understands the text and generates a response
5. The response is sent to ElevenLabs
6. ElevenLabs converts it to speech that is played back to the user

## The Really Cool Part: Function Calling

One special feature is that the AI can actually call functions - like checking the weather:

```typescript
const fncCtx: llm.FunctionContext = {
  weather: {
    // Function definition that lets the AI check the weather
    execute: async ({ location }) => {
      // Get weather data from an online service
      const response = await fetch(`https://wttr.in/${location}?format=%C+%t`);
      // ... more code ...
      return `The weather in ${location} right now is ${weather}.`;
    },
  },
};
```

This means if you ask "What's the weather like in New York?", the AI can:
1. Understand you're asking about weather
2. Call this function to get real weather data
3. Include that data in its response

## Configuration: The API Keys

For this project to work, it needs special keys to access various AI services:

```
LIVEKIT_API_KEY=...     # For connecting to LiveKit's service
LIVEKIT_API_SECRET=...  # For secure LiveKit connections
LIVEKIT_URL=...         # The address of the LiveKit server
OPENAI_API_KEY=...      # To access OpenAI's language model
DEEPGRAM_API_KEY=...    # To access Deepgram's speech-to-text
ELEVEN_API_KEY=...      # To access ElevenLabs' text-to-speech
```

Think of these like special passwords that let the code use these AI services.

## Running the Project

To run this project:

1. Install dependencies: `pnpm install`
2. Build the TypeScript code: `pnpm build`
3. Run the agent: `node dist/agent.js dev`

But remember, this is just the "backend" part of the voice assistant. You also need a "frontend" application where users can actually speak and listen.

## How to Extend This Project

If you want to add new features to this voice assistant, here are some simple ways:

### 1. Add New Functions
You can add more functions to `fncCtx`, like:
- Getting news headlines
- Checking stock prices
- Looking up information

### 2. Modify the AI's Personality
You can change how the AI responds by editing the `initialContext`:

```typescript
const initialContext = new llm.ChatContext().append({
  role: llm.ChatRole.SYSTEM,
  text: 'You are a friendly voice assistant who likes to tell jokes...',
});
```

### 3. Add More Voice Options
You could explore using different voices from ElevenLabs by modifying the TTS configuration.

## Conclusion

This project shows how modern AI tools can be combined to create a voice assistant. While the code might look complex at first, it's actually doing something quite straightforward: listening, understanding, thinking, and speaking.

The most important part to understand is how these components connect together in the pipeline. Once you grasp that concept, you can start thinking about how to extend and customize the assistant for your own needs.
