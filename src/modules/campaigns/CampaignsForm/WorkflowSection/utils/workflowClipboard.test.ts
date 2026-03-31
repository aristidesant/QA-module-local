import { describe, expect, it } from 'vitest';
import {
	parseImportedWorkflow,
	WorkflowImportError,
} from './workflowClipboard';

describe('workflowClipboard', () => {
	it('imports external snake_case workflows without renaming node ids', () => {
		const rawWorkflow = JSON.stringify({
			prevent_subagent_loops: true,
			nodes: {
				start_node: {
					type: 'start',
					position: { x: 0, y: 0 },
					edge_order: ['edge_primary'],
				},
				node_alpha_beta: {
					type: 'end',
					position: { x: 100, y: 100 },
					edge_order: [],
				},
			},
			edges: {
				edge_primary: {
					source: 'start_node',
					target: 'node_alpha_beta',
					forward_condition: {
						type: 'unconditional',
					},
				},
			},
		});

		const result = parseImportedWorkflow(rawWorkflow, false);

		expect(result.workflow.preventSubagentLoops).toBe(true);
		expect(Object.keys(result.workflow.nodes)).toEqual([
			'start_node',
			'node_alpha_beta',
		]);
		expect(Object.keys(result.workflow.edges)).toEqual(['edge_primary']);
		expect(result.workflow.edges.edge_primary.source).toBe('start_node');
		expect(result.workflow.edges.edge_primary.target).toBe('node_alpha_beta');
		expect(result.workflow.nodes.start_node.edgeOrder).toEqual([
			'edge_primary',
		]);
	});

	it('imports internal camelCase workflows unchanged in semantics', () => {
		const rawWorkflow = JSON.stringify({
			preventSubagentLoops: false,
			nodes: {
				start_node: {
					type: 'start',
					position: { x: 0, y: 0 },
					edgeOrder: ['edge_one'],
				},
				node_two: {
					type: 'standalone_agent',
					position: { x: 100, y: 100 },
					edgeOrder: [],
					label: 'Subagent',
					agentId: 'agent-1',
					delayMs: 0,
					enableTransferredAgentFirstMessage: false,
				},
			},
			edges: {
				edge_one: {
					source: 'start_node',
					target: 'node_two',
					forwardCondition: {
						type: 'unconditional',
					},
				},
			},
		});

		const result = parseImportedWorkflow(rawWorkflow, true);

		expect(result.workflow.preventSubagentLoops).toBe(false);
		expect(result.workflow.nodes.start_node.edgeOrder).toEqual(['edge_one']);
		expect(result.workflow.edges.edge_one.forwardCondition).toEqual({
			type: 'unconditional',
		});
	});

	it('repairs edgeOrder without changing ids', () => {
		const rawWorkflow = JSON.stringify({
			prevent_subagent_loops: true,
			nodes: {
				start_node: {
					type: 'start',
					position: { x: 0, y: 0 },
					edge_order: ['edge_missing'],
				},
				node_branch_one: {
					type: 'end',
					position: { x: 100, y: 100 },
					edge_order: [],
				},
				node_branch_two: {
					type: 'end',
					position: { x: 200, y: 100 },
					edge_order: [],
				},
			},
			edges: {
				edge_first: {
					source: 'start_node',
					target: 'node_branch_one',
				},
				edge_second: {
					source: 'start_node',
					target: 'node_branch_two',
				},
			},
		});

		const result = parseImportedWorkflow(rawWorkflow, false);

		expect(result.workflow.nodes.start_node.edgeOrder).toEqual([
			'edge_first',
			'edge_second',
		]);
	});

	it('rejects edges that reference nodes that do not exist', () => {
		const rawWorkflow = JSON.stringify({
			prevent_subagent_loops: true,
			nodes: {
				start_node: {
					type: 'start',
					position: { x: 0, y: 0 },
					edge_order: ['edge_primary'],
				},
			},
			edges: {
				edge_primary: {
					source: 'start_node',
					target: 'node_does_not_exist',
				},
			},
		});

		expect(() => parseImportedWorkflow(rawWorkflow, false)).toThrowError(
			new WorkflowImportError('missingEdgeNodeReference')
		);
	});
});
