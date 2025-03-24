# Accepting incoming calls

A step-by-step guide to using an AI voice agent to accept incoming phone calls using LiveKit.

On this page
Prerequisites
Step 1: Set up environment variables
Step 2: Create an AI voice agent
Step 3: Create an inbound LiveKit trunk
Add dispatch rule
Step 4: Call your agent
Next steps
Note

To make calls, see the Making outgoing calls quickstart.

This guide walks you through the steps to create an AI voice agent that responds to incoming calls. Users can call a phone number and interact directly with your AI-powered voice assistant. For example, your agent can be a resource in the following scenarios:

    Call centers: Automate customer interactions and reduce wait times.
    Customer service: Provide immediate assistance through an AI agent.
    Sales inquiries: Allow customers to ask questions about products or services.

Prerequisites

The following are required to complete the steps in this quickstart:

    A phone number purchased from your SIP trunk provider.
    A SIP trunk with your provider.
    LiveKit CLI installed.
    SIP server: LiveKit Cloud

    or a self-hosted SIP server.

Instructions for setting up a SIP trunk are available in the Create and configure SIP trunk quickstart.
Step 1: Set up environment variables
Tip

Log in

to see your real credentials populated in many places throughout this page

Set up the following environment variables to configure the LiveKit CLI to use your LiveKit Cloud or self-hosted LiveKit server instance:

export LIVEKIT_URL=wss://test-6s423dil.livekit.cloud
export LIVEKIT_API_KEY=<your API Key>
export LIVEKIT_API_SECRET=<your API Secret>

Step 2: Create an AI voice agent

The fastest way to create an agent is by using the LiveKit CLI.

Enter your API keys at the prompts. Alternatively, you can skip the prompts and manually edit the .env.local file with your API keys.

lk app create --template voice-pipeline-agent-node

// or clone it from GitHub
git clone https://github.com/livekit-examples/voice-pipeline-agent-node.git

Modify the agent to give it an agent_name. This will allow you to dispatch the agent explicitly when configuring SIP.

cli.runApp(new WorkerOptions({
  agent: fileURLToPath(import.meta.url),
  // giving this agent a name of: "inbound-agent"
  agentName: "inbound-agent",
}));

Then you can start the agent:

pnpm build
node dist/agent.js dev

Step 3: Create an inbound LiveKit trunk

An inbound SIP trunk instructs LiveKit to accept calls to one or more numbers that you own. Replace the phone number with the number purchased from your SIP trunking provider and create a file inbound-trunk.json with the following content:

{
  "trunk": {
    "name": "My inbound trunk",
    "numbers": ["+15105550100"]
  }
}

Important

The leading + in the phone number assumes the Destination Number Format is set to +E.164 for your Telnyx number.

Create the LiveKit inbound SIP trunk using the CLI:

lk sip inbound create inbound-trunk.json

Add dispatch rule

Dispatch rules route inbound SIP calls to LiveKit rooms. In this example, the dispatchRuleIndividual routes each caller to their own room. Each room will be named with a prefix of call.

Additionally, specify an agent to handle incoming calls. In this example, inbound-agent is dispatched to all callers.

Create dispatch-rule.json file:

{
  "name": "My dispatch rule",
  "rule": {
    "dispatchRuleIndividual": {
      "roomPrefix": "call"
    }
  },
  "room_config": {
    "agents": [{
      "agent_name": "inbound-agent"
    }]
  }
}

Apply the dispatch rule for the trunk using the CLI:

lk sip dispatch create dispatch-rule.json

Step 4: Call your agent
Calling the phone number you assigned to the trunk places you in a room with your agent.