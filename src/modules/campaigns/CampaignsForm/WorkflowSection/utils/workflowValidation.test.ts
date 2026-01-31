import { describe, it, expect } from 'vitest';
import {
	validateWorkflowEdgeConditions,
	validateWorkflow,
	hasEdgeCondition,
	getEdgeWarningLevel,
} from './workflowValidation';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';

describe('Workflow Edge Condition Validation', () => {
	describe('validateWorkflowEdgeConditions', () => {
		it('should return valid for workflow with no edges', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {
					start_node: {
						type: 'start',
						position: { x: 0, y: 0 },
						edgeOrder: [],
					},
				},
				edges: {},
			};

			const result = validateWorkflowEdgeConditions(workflow);

			expect(result.isValid).toBe(true);
			expect(result.invalidEdges).toHaveLength(0);
		});

		it('should return valid for edges with forward condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {
					start_node: {
						type: 'start',
						position: { x: 0, y: 0 },
						edgeOrder: ['edge-1'],
					},
					node1: {
						type: 'standalone_agent',
						position: { x: 100, y: 100 },
						edgeOrder: [],
						label: 'Agent 1',
						agentId: 'agent-1',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					},
				},
				edges: {
					'edge-1': {
						source: 'start_node',
						target: 'node1',
						forwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = validateWorkflowEdgeConditions(workflow);

			expect(result.isValid).toBe(true);
			expect(result.invalidEdges).toHaveLength(0);
		});

		it('should return valid for edges with backward condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {
					start_node: {
						type: 'start',
						position: { x: 0, y: 0 },
						edgeOrder: ['edge-1'],
					},
					node1: {
						type: 'standalone_agent',
						position: { x: 100, y: 100 },
						edgeOrder: [],
						label: 'Agent 1',
						agentId: 'agent-1',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					},
				},
				edges: {
					'edge-1': {
						source: 'start_node',
						target: 'node1',
						backwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = validateWorkflowEdgeConditions(workflow);

			expect(result.isValid).toBe(true);
			expect(result.invalidEdges).toHaveLength(0);
		});

		it('should return invalid for edges with no conditions', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {
					start_node: {
						type: 'start',
						position: { x: 0, y: 0 },
						edgeOrder: ['edge-1'],
					},
					node1: {
						type: 'standalone_agent',
						position: { x: 100, y: 100 },
						edgeOrder: [],
						label: 'Agent 1',
						agentId: 'agent-1',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					},
				},
				edges: {
					'edge-1': {
						source: 'start_node',
						target: 'node1',
					},
				},
			};

			const result = validateWorkflowEdgeConditions(workflow);

			expect(result.isValid).toBe(false);
			expect(result.invalidEdges).toHaveLength(1);
			expect(result.invalidEdges[0].edgeId).toBe('edge-1');
			expect(result.errorMessage).toContain('1 edge(s) have no conditions');
		});

		it('should identify multiple edges with no conditions', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {
					start_node: {
						type: 'start',
						position: { x: 0, y: 0 },
						edgeOrder: ['edge-1', 'edge-2'],
					},
					node1: {
						type: 'standalone_agent',
						position: { x: 100, y: 100 },
						edgeOrder: [],
						label: 'Agent 1',
						agentId: 'agent-1',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					},
					node2: {
						type: 'standalone_agent',
						position: { x: 200, y: 200 },
						edgeOrder: [],
						label: 'Agent 2',
						agentId: 'agent-2',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					},
				},
				edges: {
					'edge-1': {
						source: 'start_node',
						target: 'node1',
					},
					'edge-2': {
						source: 'start_node',
						target: 'node2',
					},
				},
			};

			const result = validateWorkflowEdgeConditions(workflow);

			expect(result.isValid).toBe(false);
			expect(result.invalidEdges).toHaveLength(2);
			expect(result.errorMessage).toContain('2 edge(s) have no conditions');
		});

		it('should handle undefined workflow', () => {
			const result = validateWorkflowEdgeConditions(undefined);

			expect(result.isValid).toBe(false);
			expect(result.invalidEdges).toHaveLength(0);
			expect(result.errorMessage).toBe('No workflow provided');
		});
	});

	describe('validateWorkflow', () => {
		it('should validate workflow using edge conditions check', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {
					start_node: {
						type: 'start',
						position: { x: 0, y: 0 },
						edgeOrder: ['edge-1'],
					},
					node1: {
						type: 'standalone_agent',
						position: { x: 100, y: 100 },
						edgeOrder: [],
						label: 'Agent 1',
						agentId: 'agent-1',
						delayMs: 0,
						enableTransferredAgentFirstMessage: false,
					},
				},
				edges: {
					'edge-1': {
						source: 'start_node',
						target: 'node1',
						forwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = validateWorkflow(workflow);

			expect(result.isValid).toBe(true);
		});
	});

	describe('getEdgeWarningLevel', () => {
		it('should return error for edge with no conditions', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('error');
		});

		it('should return warning for edge with only unconditional forward condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						forwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('warning');
		});

		it('should return warning for edge with only unconditional backward condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						backwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('warning');
		});

		it('should return none for edge with proper LLM condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						forwardCondition: {
							type: 'llm',
							condition: 'user wants to proceed',
						},
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('none');
		});

		it('should return none for edge with expression condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						forwardCondition: {
							type: 'expression',
							expression: {
								type: 'eq_operator',
								left: { type: 'string_literal', value: 'test' },
								right: { type: 'string_literal', value: 'test' },
							},
						},
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('none');
		});

		it('should return none for edge with result condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						forwardCondition: {
							type: 'result',
							successful: true,
						},
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('none');
		});

		it('should return none for non-existent edge', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('none');
		});

		it('should return none when workflow is undefined', () => {
			const result = getEdgeWarningLevel('edge-1', undefined);

			expect(result).toBe('none');
		});

		it('should return none for edge with both forward and backward conditions', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						forwardCondition: {
							type: 'llm',
							condition: 'user wants to proceed',
						},
						backwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = getEdgeWarningLevel('edge-1', workflow);

			expect(result).toBe('none');
		});
	});

	describe('hasEdgeCondition', () => {
		it('should return true for edge with forward condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						forwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = hasEdgeCondition('edge-1', workflow);

			expect(result).toBe(true);
		});

		it('should return true for edge with backward condition', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
						backwardCondition: { type: 'unconditional' },
					},
				},
			};

			const result = hasEdgeCondition('edge-1', workflow);

			expect(result).toBe(true);
		});

		it('should return false for edge with no conditions', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {
					'edge-1': {
						source: 'node1',
						target: 'node2',
					},
				},
			};

			const result = hasEdgeCondition('edge-1', workflow);

			expect(result).toBe(false);
		});

		it('should return false for non-existent edge', () => {
			const workflow: AgentWorkflow = {
				preventSubagentLoops: false,
				nodes: {},
				edges: {},
			};

			const result = hasEdgeCondition('edge-1', workflow);

			expect(result).toBe(false);
		});

		it('should return false when workflow is undefined', () => {
			const result = hasEdgeCondition('edge-1', undefined);

			expect(result).toBe(false);
		});
	});
});
