---
name: invoke-agent
description: Invoke a GSD agent with a custom prompt across any CLI
category: orchestration
arguments:
  - name: agent
    description: Agent name (e.g., gsd-executor, gsd-planner, gsd-verifier)
    required: true
  - name: prompt
    description: Prompt to send to agent (quoted string)
    required: true
examples:
  - command: "/gsd:invoke-agent gsd-executor 'Implement authentication'"
    description: Invoke executor agent with custom prompt
  - command: "/gsd:invoke-agent gsd-planner 'Plan phase 3'"
    description: Invoke planner agent for phase planning
---

# Invoke Agent

You are invoking the **{agent}** agent with the following prompt:

**Prompt:** {prompt}

## Agent Invocation

The agent invoker will:
1. Detect the current CLI (Claude, Copilot, or Codex)
2. Load the agent registry to validate agent existence
3. Use the CLI-specific adapter to invoke the agent
4. Return the agent's response with performance metrics

## Instructions

Execute the agent invocation and return the result to the user.

**Technical implementation:**
```javascript
const { invokeAgent } = require('./bin/lib/orchestration/agent-invoker.js');
const AgentRegistry = require('./bin/lib/orchestration/agent-registry.js');

const registry = new AgentRegistry();
const agent = registry.getAgent(args[0]); // First arg is agent name

if (!agent) {
  throw new Error(`Agent not found: ${args[0]}. Run /gsd:help to see available agents.`);
}

const prompt = args.slice(1).join(' '); // Join remaining args as prompt
const result = await invokeAgent(agent, prompt);

if (result.success) {
  console.log(`\n✅ Agent ${result.agent} completed on ${result.cli}:\n`);
  console.log(result.result);
  console.log(`\n⏱️  Duration: ${result.duration}ms`);
} else {
  console.error(`\n❌ Agent ${result.agent} failed on ${result.cli}:\n`);
  console.error(result.error);
  if (result.stderr) {
    console.error(`\nStderr: ${result.stderr}`);
  }
  process.exit(1);
}
```

Execute this agent invocation now.
