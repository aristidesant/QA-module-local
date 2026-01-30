import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import WorkflowHeader from './WorkflowHeader';
import {
	WorkflowStateContext,
	type WorkflowState,
} from '../WorkflowStateContext';

describe('WorkflowHeader', () => {
	it('renders the header and toggles the switch', () => {
		const onPreventSubagentLoopsChange = vi.fn();

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
						preventSubagentLoops: true,
						onPreventSubagentLoopsChange,
						workflowJson: '',
						hasWorkflow: false,
						isEmptyState: true,
						layoutDirection: 'horizontal',
						onLayoutDirectionChange: vi.fn(),
						organizeLayout: vi.fn(),
					} satisfies WorkflowState
				}
			>
				<WorkflowHeader />
			</WorkflowStateContext.Provider>
		);

		expect(screen.getByText('Flow Builder')).toBeInTheDocument();
		expect(screen.getByLabelText('Prevent subagent loops')).toBeChecked();
	});
});
