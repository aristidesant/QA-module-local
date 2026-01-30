import type { ReactNode } from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import WorkflowCanvas from './WorkflowCanvas';
import type {
	WorkflowEdgeData,
	WorkflowNodeData,
} from '../WorkflowSection.types';
import {
	WorkflowStateContext,
	type WorkflowState,
} from '../WorkflowStateContext';
import type { Edge, Node } from '@xyflow/react';

type ReactFlowProps = {
	children?: ReactNode;
	nodes?: Array<Node<WorkflowNodeData>>;
	edges?: Array<Edge<WorkflowEdgeData>>;
};

vi.mock('@xyflow/react', async () => {
	return {
		ReactFlow: ({ children, nodes, edges }: ReactFlowProps) => (
			<div data-testid='react-flow'>
				<div data-testid='nodes-count'>{nodes?.length ?? 0}</div>
				<div data-testid='edges-count'>{edges?.length ?? 0}</div>
				{children}
			</div>
		),
		Background: () => <div data-testid='flow-background' />,
		Controls: () => <div data-testid='flow-controls' />,
		MiniMap: () => <div data-testid='flow-minimap' />,
		BackgroundVariant: { Dots: 'dots' },
		ConnectionLineType: { Bezier: 'bezier' },
	};
});

describe('WorkflowCanvas', () => {
	it('renders workflow canvas with nodes and edges', () => {
		const nodes: Node<WorkflowNodeData>[] = [
			{
				id: 'start',
				position: { x: 0, y: 0 },
				data: {
					label: 'Start',
					workflowType: 'start',
					variant: 'start',
					canConnectIn: false,
					canConnectOut: true,
				},
			},
		];
		const edges: Edge<WorkflowEdgeData>[] = [
			{
				id: 'edge-1',
				source: 'start',
				target: 'end',
				data: { forward: { conditionType: 'unconditional' } },
			},
		];

		renderWithProviders(
			<WorkflowStateContext.Provider
				value={
					{
						nodes,
						edges,
						onNodesChange: vi.fn(),
						onEdgesChange: vi.fn(),
						onConnect: vi.fn(),
						isValidConnection: () => true,
						onNodeClick: vi.fn(),
						onEdgeClick: vi.fn(),
						onAddFromStart: vi.fn(),
						onAddBranch: vi.fn(),
						onDeleteNode: vi.fn(),
						onDuplicateNode: vi.fn(),
						createStartFlow: vi.fn(),
						preventSubagentLoops: false,
						onPreventSubagentLoopsChange: vi.fn(),
						workflowJson: '',
						hasWorkflow: true,
						isEmptyState: false,
						layoutDirection: 'horizontal',
						onLayoutDirectionChange: vi.fn(),
						organizeLayout: vi.fn(),
					} satisfies WorkflowState
				}
			>
				<WorkflowCanvas />
			</WorkflowStateContext.Provider>
		);

		expect(screen.getByTestId('react-flow')).toBeInTheDocument();
		expect(screen.getByTestId('nodes-count').textContent).toBe('1');
		expect(screen.getByTestId('edges-count').textContent).toBe('1');
	});
});
