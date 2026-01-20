# Agent Workflows Skill

This skill provides comprehensive documentation on the technical structure, node types, and implementation of ElevenLabs Agent Workflows within the NAI platform.

## Overview

Agent Workflows use a branching conversation graph to build sophisticated AI conversational experiences. Unlike linear paths, workflows allow agents to dynamically adapt, delegate, or transfer based on user intent or tool results.

## Node Types & Technical Specifications

### 1. Agent Transfer (`standalone_agent`)

Facilitates an external delegation where the entire conversation is handed off to a **different, designated AI agent**.

- **Execution**: Utilizes the `transfer_to_agent` system tool.
- **Context**: Preservation of conversation history is handled by ElevenLabs to ensure continuity for the user.
- **Properties**:
  - `agentId`: Identifier of the target agent.
  - `delayMs`: Delay before the transfer occurs.
  - `transferMessage`: message for the agent to say during the transfer.
  - `enableTransferredAgentFirstMessage`: Whether the receiving agent repeats its greeting.

### 2. Subagent (`override_agent`)

Used for internal specialization and behavioral shifts **within the same agent identity**.

- **Function**: Modifies the agent's configuration at a specific point in the conversation.
- **Overrides**: Can override system prompt, LLM selection, voice settings, tools, and knowledge bases.
- **Properties**:
  - `additionalPrompt`: String appended to or overriding the system instructions.
  - `additionalToolIds`: Node-specific tool availability.
  - `additionalKnowledgeBase`: Node-specific knowledge items.

### 3. Tool Dispatch (`tool`)

A dedicated execution point that guarantees a specific tool call is made.

- **Flow Control**: Features a unique edge type for routing based on tool execution results:
  - **Success Path**: Route to take if the tool succeeds.
  - **Failure Path**: Route to take if the tool fails or errors.

### 4. Transfer to Number (`phone_number`)

Transitions from an AI conversation to a human agent via telephony.

- **Transfer Types**:
  - **Conference Transfer**: (Default) System calls the destination, adds participants to a conference, then removes the AI.
  - **SIP REFER Transfer**: Direct transfer using the SIP REFER protocol. Highly efficient but requires:
    1. The call must be using the SIP protocol.
    2. The SIP Trunk must explicitly allow REFER transfers.
- **Properties**:
  - `transferType`: `conference` or `sip_refer`.
  - `transferDestination`: Object containing `type` (usually `phone`) and `phoneNumber`.

### 5. Flow Control Nodes

- **Start Node**: The mandatory entry point. In our implementation, the first connection from Start MUST be a **Subagent** to initialize the main agent logic.
- **End Node**: Gracefully terminates the conversation flow.

## Implementation Standards

### State & Canvas

- **Library**: `@xyflow/react` (React Flow) facilitates the visual graph.
- **Provider**: `WorkflowStateProvider` manages the graph state and syncs with the parent form context.
- **Syncing**: The `agentConfig.workflow` object in the campaign form is the source of truth for all node and edge data.

### Node Configuration UI

- **Subagent Nodes**: Use the complex `SubagentForm` to handle multi-tab configuration (Prompt, Voice, KB, etc.).
- **Agent Transfer & Phone Nodes**: Use the simplified, single-column forms in `WorkflowNodeConfig.tsx` to ensure speed and clarity.
- **Mantine Standards**: All forms must use `size="sm"`, `gap="xs"`, and standard Mantine components (TextInput, Textarea, Select, SegmentedControl).

### Terminology Alignment (CRITICAL)

Always ensure UI labels match ElevenLabs documentation to prevent user confusion:

- `standalone_agent` (Model) -> **Agent Transfer** (UI)
- `override_agent` (Model) -> **Subagent** (UI)
