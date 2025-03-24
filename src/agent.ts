// SPDX-FileCopyrightText: 2024 LiveKit, Inc.
//
// SPDX-License-Identifier: Apache-2.0
import {
  type JobContext,
  type JobProcess,
  WorkerOptions,
  cli,
  defineAgent,
  llm,
  pipeline,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Initialize environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env.local');

console.log('\n=== Agent Initialization ===');
console.log('Current directory:', __dirname);
console.log('Loading environment from:', envPath);

// Debug: Print raw environment file contents
try {
  const envContents = await fs.readFile(envPath, 'utf-8');
  console.log('\nEnvironment file contents (without values):');
  console.log(
    envContents
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line && !line.startsWith('#'))
      .map((line: string) => line.split('=')[0])
      .join('\n'),
  );
} catch (error) {
  console.error('Could not read .env.local file:', error);
}

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env.local file:', result.error);
  } else {
    console.log('Environment file loaded successfully');
  }
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to load environment file:', error.message);
  } else {
    console.error('Failed to load environment file:', error);
  }
}

console.log('\n=== System Information ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Command line arguments:', process.argv);

// Check for required environment variables
const requiredEnvVars = [
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'OPENAI_API_KEY',
  'ELEVEN_API_KEY',
  'DEEPGRAM_API_KEY',
] as const;

// Debug: Print all environment variables
console.log('\nDebug: All process.env keys:', Object.keys(process.env));

console.log('\n=== Environment Variables Check ===');
interface EnvVarStatus {
  present: boolean;
  length: number;
  preview: string;
}

const envVarStatus: Record<string, EnvVarStatus> = {};
const missingEnvVars = requiredEnvVars.filter((varName) => {
  const isPresent = !!process.env[varName];
  const value = process.env[varName];
  console.log(`\nDebug: ${varName} raw value:`, value);
  envVarStatus[varName] = {
    present: isPresent,
    length: value ? value.length : 0,
    preview: value ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : 'NOT SET',
  };
  return !isPresent;
});

// Log detailed environment variable status
console.log('\nEnvironment Variables Status:');
Object.entries(envVarStatus).forEach(([varName, status]) => {
  console.log(`${varName}:
    Present: ${status.present ? '✅' : '❌'}
    Length: ${status.length}
    Preview: ${status.preview}`);
});

if (missingEnvVars.length > 0) {
  console.error('\n❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env.local file or set these variables in your environment');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are present');
}

// Validate API endpoints
console.log('\n=== API Endpoint Validation ===');
try {
  const livekitUrl = new URL(process.env.LIVEKIT_URL ?? '');
  console.log('LiveKit URL validation:', {
    protocol: livekitUrl.protocol,
    hostname: livekitUrl.hostname,
    port: livekitUrl.port || 'default',
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Invalid LiveKit URL:', error.message);
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    console.log('\n=== Agent Prewarm Phase ===');
    console.log('Initializing prewarm phase...');
    try {
      console.log('Loading VAD model...');
      proc.userData.vad = await silero.VAD.load();
      console.log('VAD model loaded successfully');
    } catch (error) {
      console.error('Failed to load VAD model:', error);
      throw error;
    }
  },
  entry: async (ctx: JobContext) => {
    console.log('\n=== Agent Entry Point ===');
    console.log('Agent entry point called');
    try {
      const vad = ctx.proc.userData.vad as silero.VAD;
      console.log('VAD model retrieved from userData');

      const initialContext = new llm.ChatContext().append({
        role: llm.ChatRole.SYSTEM,
        text:
          'You are a voice assistant created by LiveKit. Your interface with users will be voice. ' +
          'You should use short and concise responses, and avoid using unpronounceable punctuation.',
      });
      console.log('Initial chat context created');

      console.log('Attempting to connect to room...');
      await ctx.connect();
      console.log('Successfully connected to room');

      console.log('Waiting for participant to join...');
      const participant = await ctx.waitForParticipant();
      console.log(`Participant joined: ${participant.identity}`);
      console.log(`Starting assistant example agent for ${participant.identity}`);

      const fncCtx: llm.FunctionContext = {
        weather: {
          description: 'Get the weather in a location',
          parameters: z.object({
            location: z.string().describe('The location to get the weather for'),
          }),
          execute: async ({ location }) => {
            console.debug(`Executing weather function for ${location}`);
            try {
              const response = await fetch(`https://wttr.in/${location}?format=%C+%t`);
              console.log(`Weather API response status: ${response.status}`);

              if (!response.ok) {
                console.error(`Weather API error: ${response.status}`);
                throw new Error(`Weather API returned status: ${response.status}`);
              }

              const weather = await response.text();
              console.log(`Weather data received: ${weather}`);
              return `The weather in ${location} right now is ${weather}.`;
            } catch (error) {
              console.error('Error fetching weather data:', error);
              throw error;
            }
          },
        },
      };
      console.log('Function context created');

      console.log('Initializing VoicePipelineAgent components...');
      console.log('- Setting up STT with Deepgram');
      const stt = new deepgram.STT();

      console.log('- Setting up LLM with OpenAI');
      const llmComponent = new openai.LLM();

      console.log('- Setting up TTS with ElevenLabs');
      const tts = new elevenlabs.TTS();

      console.log('Creating VoicePipelineAgent instance');
      const agent = new pipeline.VoicePipelineAgent(vad, stt, llmComponent, tts, {
        chatCtx: initialContext,
        fncCtx,
      });

      console.log('Starting VoicePipelineAgent...');
      try {
        agent.start(ctx.room, participant);
        console.log('VoicePipelineAgent started successfully');
      } catch (error) {
        console.error('Failed to start VoicePipelineAgent:', error);
        throw error;
      }

      console.log('Attempting to say initial greeting...');
      try {
        await agent.say('Hey, how can I help you today?', true);
        console.log('Initial greeting sent successfully');
      } catch (error) {
        console.error('Failed to send initial greeting:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in agent entry point:', error);
      throw error;
    }
  },
});

console.log('\n=== Registering Agent with CLI ===');
try {
  // Log available CLI commands
  console.log('Available CLI commands:', Object.keys(cli).join(', '));

  // Log the agent file path
  const agentPath = fileURLToPath(import.meta.url);
  console.log('Agent file path:', agentPath);

  // Create worker options with detailed logging
  const workerOptions = new WorkerOptions({ agent: agentPath });
  console.log('Worker options created:', JSON.stringify(workerOptions, null, 2));

  // Run the CLI app with the worker options
  cli.runApp(workerOptions);
  console.log('Agent registered successfully with CLI');
} catch (error) {
  console.error('Failed to register agent with CLI:', error);
  console.error('Error details:', error instanceof Error ? error.stack : String(error));
  throw error;
}
