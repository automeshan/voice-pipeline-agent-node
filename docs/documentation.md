# Voice Pipeline Agent Documentation

Welcome to the comprehensive documentation for the Voice Pipeline Agent project. This documentation is designed for developers of all skill levels, from beginners to experts.

## Table of Contents

1. [Codebase Overview](./codebase-overview.md) - A comprehensive overview of the project architecture and functionality
2. [Beginner's Guide](./beginner-guide.md) - An introduction to the codebase for developers new to this technology
3. [Architecture Diagrams](./architecture-diagram.md) - Visual representations of the codebase architecture
4. [Critical Code Explanation](./critical-code-explanation.md) - Detailed explanation of the most important code sections

## Quick Start

To run this project:

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   Make sure your `.env.local` file contains all required API keys:
   - LIVEKIT_URL
   - LIVEKIT_API_KEY
   - LIVEKIT_API_SECRET
   - OPENAI_API_KEY
   - ELEVEN_API_KEY
   - DEEPGRAM_API_KEY

3. **Build the project**
   ```bash
   pnpm build
   ```

4. **Run the agent**
   ```bash
   node dist/agent.js dev
   ```

## Project Structure

```
voice-pipeline-agent-node/
├── .env.local        # Environment variables (API keys)
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── src/
    └── agent.ts      # Main agent implementation
```

## Key Technologies

- **LiveKit Agents Framework**: The foundation for building interactive AI agents
- **Silero**: Voice Activity Detection
- **Deepgram**: Speech-to-Text
- **OpenAI**: Language Model
- **ElevenLabs**: Text-to-Speech

## Further Resources

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/overview/)
- [LiveKit Cloud](https://livekit.io/cloud)
- [LiveKit Examples](https://github.com/livekit-examples/)
