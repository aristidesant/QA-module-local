import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentForm from './AgentForm';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';

describe('AgentForm', () => {
	const mockWorkflow: AgentWorkflow = {
		edges: {},
		nodes: {
			node1: {
				id: 'node1',
				type: 'override_agent',
				label: 'Initial Name',
				position: { x: 0, y: 0 },
				edgeOrder: [],
				conversationConfig: {},
				subagent: {
					prompt: 'Agent prompt',
					overridePrompt: false,
				},
			} as any,
		},
		preventSubagentLoops: false,
	};

	const mockOnWorkflowChange = vi.fn();

	it('renders node name field and allows editing', () => {
		renderWithProviders(
			<AgentForm
				nodeId='node1'
				workflow={mockWorkflow}
				onWorkflowChange={mockOnWorkflowChange}
			/>
		);

		const nameInput = screen.getByLabelText('Node name');
		expect(nameInput).toBeInTheDocument();
		expect(nameInput).toHaveValue('Initial Name');

		fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

		expect(mockOnWorkflowChange).toHaveBeenCalled();
		const updatedWorkflow = mockOnWorkflowChange.mock.calls[0][0];
		expect(updatedWorkflow.nodes.node1.label).toBe('Updated Name');
	});

	it('handles prompt editing when override is off', () => {
		renderWithProviders(
			<AgentForm
				nodeId='node1'
				workflow={mockWorkflow}
				onWorkflowChange={mockOnWorkflowChange}
			/>
		);

		const promptInput = screen.getByPlaceholderText(
			'Describe the goal of this agent'
		);
		fireEvent.change(promptInput, {
			target: { value: 'New Additional Prompt' },
		});

		expect(mockOnWorkflowChange).toHaveBeenCalled();
		const lastCall =
			mockOnWorkflowChange.mock.calls[
				mockOnWorkflowChange.mock.calls.length - 1
			][0];
		expect(lastCall.nodes.node1.additionalPrompt).toBe('New Additional Prompt');
	});

	it('handles prompt editing when override is on', () => {
		const baseNode = mockWorkflow.nodes.node1 as any;
		const overrideWorkflow = {
			...mockWorkflow,
			nodes: {
				node1: {
					...baseNode,
					subagent: {
						...baseNode.subagent,
						overridePrompt: true,
					},
					conversationConfig: {
						agent: {
							prompt: {
								prompt: 'Initial Override Prompt',
							},
						},
					},
				},
			},
		};

		renderWithProviders(
			<AgentForm
				nodeId='node1'
				workflow={overrideWorkflow as any}
				onWorkflowChange={mockOnWorkflowChange}
			/>
		);

		const promptInput = screen.getByPlaceholderText(
			'Describe the goal of this agent'
		);
		expect(promptInput).toHaveValue('Initial Override Prompt');

		fireEvent.change(promptInput, {
			target: { value: 'Updated Override Prompt' },
		});

		expect(mockOnWorkflowChange).toHaveBeenCalled();
		const lastCall =
			mockOnWorkflowChange.mock.calls[
				mockOnWorkflowChange.mock.calls.length - 1
			][0];
		expect(lastCall.nodes.node1.conversationConfig.agent.prompt.prompt).toBe(
			'Updated Override Prompt'
		);
	});

	it('migrates additionalPrompt to conversationConfig when toggling override ON', () => {
		const workflow = {
			...mockWorkflow,
			nodes: {
				node1: {
					...mockWorkflow.nodes.node1,
					additionalPrompt: 'Migrate this text',
				},
			},
		};

		renderWithProviders(
			<AgentForm
				nodeId='node1'
				workflow={workflow as any}
				onWorkflowChange={mockOnWorkflowChange}
			/>
		);

		const overrideSwitch = screen.getByLabelText('Override prompt');
		fireEvent.click(overrideSwitch);

		expect(mockOnWorkflowChange).toHaveBeenCalled();
		const lastCall =
			mockOnWorkflowChange.mock.calls[
				mockOnWorkflowChange.mock.calls.length - 1
			][0];
		expect(lastCall.nodes.node1.subagent.overridePrompt).toBe(true);
		expect(lastCall.nodes.node1.additionalPrompt).toBeNull();
		expect(lastCall.nodes.node1.conversationConfig.agent.prompt.prompt).toBe(
			'Migrate this text'
		);
	});

	it('migrates conversationConfig prompt to additionalPrompt when toggling override OFF', () => {
		const baseNode = mockWorkflow.nodes.node1 as any;
		const workflow = {
			...mockWorkflow,
			nodes: {
				node1: {
					...baseNode,
					subagent: {
						...baseNode.subagent,
						overridePrompt: true,
					},
					conversationConfig: {
						agent: {
							prompt: {
								prompt: 'Migrate this text back',
							},
						},
					},
				},
			},
		};

		renderWithProviders(
			<AgentForm
				nodeId='node1'
				workflow={workflow as any}
				onWorkflowChange={mockOnWorkflowChange}
			/>
		);

		const overrideSwitch = screen.getByLabelText('Override prompt');
		fireEvent.click(overrideSwitch);

		expect(mockOnWorkflowChange).toHaveBeenCalled();
		const lastCall =
			mockOnWorkflowChange.mock.calls[
				mockOnWorkflowChange.mock.calls.length - 1
			][0];
		expect(lastCall.nodes.node1.subagent.overridePrompt).toBe(false);
		expect(lastCall.nodes.node1.additionalPrompt).toBe(
			'Migrate this text back'
		);
		expect(
			lastCall.nodes.node1.conversationConfig.agent.prompt.prompt
		).toBeNull();
	});
});
