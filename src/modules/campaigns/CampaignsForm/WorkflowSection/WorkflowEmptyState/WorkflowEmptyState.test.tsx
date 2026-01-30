import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import WorkflowEmptyState from './WorkflowEmptyState';
import {
	WorkflowStateContext,
	type WorkflowState,
} from '../WorkflowStateContext';

describe('WorkflowEmptyState', () => {
	it('renders the empty state message', () => {
		renderWithProviders(
			<WorkflowStateContext.Provider
				value={
					{
						nodes: [],
						edges: [],
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
						hasWorkflow: false,
						isEmptyState: true,
						layoutDirection: 'horizontal',
						onLayoutDirectionChange: vi.fn(),
						organizeLayout: vi.fn(),
					} satisfies WorkflowState
				}
			>
				<WorkflowEmptyState />
			</WorkflowStateContext.Provider>
		);

		expect(screen.getByText('No workflow configured')).toBeInTheDocument();
		expect(
			screen.getByText(
				'Create a workflow to define how your agent handles conversations with branching logic and tools.'
			)
		).toBeInTheDocument();
	});
});
