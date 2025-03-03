// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
/**
 * This file defines a voice assistant agent using LiveKit's agent framework.
 * It creates an AI voice assistant that can listen to users, process their speech,
 * respond with AI-generated text, and convert that text back to speech.
 */
// Import necessary packages and modules
import {
  // TypeScript type definitions for the agent framework
  type JobContext,
  // Provides context for the running job
  type JobProcess,
  // Represents the process running the job
  WorkerOptions,
  // Configuration options for the worker
  cli,
  // Command-line interface utilities
  defineAgent,
  // Function to define an agent
  llm,
  // Large Language Model utilities
  pipeline, // Pipeline for processing voice
} from '@livekit/agents';
// Import plugins for different AI services
import * as deepgram from '@livekit/agents-plugin-deepgram';
// Speech-to-Text service
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
// Text-to-Speech service
import * as openai from '@livekit/agents-plugin-openai';
// AI language model
import * as silero from '@livekit/agents-plugin-silero';
// Voice Activity Detection

// Utility imports
import dotenv from 'dotenv';
// For loading environment variables
import path from 'node:path';
// For handling file paths
import { fileURLToPath } from 'node:url';
// For converting file URLs to paths
import { z } from 'zod';

// For schema validation (similar to PropTypes in React)

// Get the current directory path (similar to how you might set up paths in a React project)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Set up the path to the environment variables file
const envPath = path.join(__dirname, '../.env.local');
// Load environment variables from the .env.local file
dotenv.config({ path: envPath });

/**
 * Define and export the agent with its configuration and behavior.
 * This is similar to how you might export a React component.
 */
export default defineAgent({
  /**
   * The prewarm function runs before the agent starts handling requests.
   * It's similar to useEffect or componentDidMount in React - for initialization.
   *
   * @param proc - The job process object where we can store data
   */
  prewarm: async (proc: JobProcess) => {
    // Load the Voice Activity Detection model and store it for later use
    // This detects when someone is speaking vs. silent
    proc.userData.vad = await silero.VAD.load();
  },

  /**
   * The entry function is the main function that runs when the agent starts.
   * It's similar to the main render function of a React component.
   *
   * @param ctx - The job context that provides access to the LiveKit room and participants
   */
  entry: async (ctx: JobContext) => {
    // Get the Voice Activity Detection model we loaded in prewarm
    const vad = ctx.proc.userData.vad! as silero.VAD;

    // Set up the initial context for the AI assistant
    // This is like setting initial state in React
    const initialContext = new llm.ChatContext().append({
      role: llm.ChatRole.SYSTEM,
      text:
        'You are a voice assistant created by LiveKit. Your interface with users will be voice. ' +
        'You should use short and concise responses, and avoiding usage of unpronounceable ' +
        'punctuation.',
    });

    // Connect to the LiveKit room
    await ctx.connect();
    console.log('waiting for participant');

    // Wait for a participant to join the room
    // This is like waiting for a user to interact with your React app
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example agent for ${participant.identity}`);

    /**
     * Define functions that the AI can use
     * This is similar to defining handler functions in React components
     * that get passed down as props
     */
    const fncCtx: llm.FunctionContext = {
      // Define a weather function that the AI can call
      weather: {
        description: 'Get the weather in a location',
        // Use Zod for type validation (similar to PropTypes in React)
        parameters: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        // The actual function that gets executed when the AI calls it
        execute: async ({ location }) => {
          console.debug(`executing weather function for ${location}`);
          // Fetch weather data from an external API
          const response = await fetch(`https://wttr.in/${location}?format=%C+%t`);
          if (!response.ok) {
            throw new Error(`Weather API returned status: ${response.status}`);
          }
          const weather = await response.text();
          return `The weather in ${location} right now is ${weather}.`;
        },
      },
    };

    /**
     * Create the voice pipeline agent by connecting all the components:
     * 1. Voice Activity Detection (VAD) - Detects when someone is speaking
     * 2. Speech-to-Text (STT) - Converts speech to text
     * 3. Large Language Model (LLM) - Processes the text and generates a response
     * 4. Text-to-Speech (TTS) - Converts the response back to speech
     *
     * This is similar to how you might compose components in React
     */
    const agent = new pipeline.VoicePipelineAgent(
      vad, // Voice Activity Detection
      new deepgram.STT(), // Speech-to-Text
      new openai.LLM(), // AI Language Model
      new elevenlabs.TTS(), // Text-to-Speech
      { chatCtx: initialContext, fncCtx }, // Configuration options
    );

    // Start the agent with the room and participant
    agent.start(ctx.room, participant);

    // Make the agent say an initial greeting
    // The 'true' parameter means this is the first message
    await agent.say('Hey, how can I help you today', true);
  },
});

/**
 * Start the application using the CLI runner
 * This is like the ReactDOM.render() call in a React application
 */
cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url) }));
