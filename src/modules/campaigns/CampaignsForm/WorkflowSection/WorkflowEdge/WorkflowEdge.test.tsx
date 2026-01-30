import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkflowEdge from './WorkflowEdge';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useWorkflowState } from '../WorkflowStateContext';

vi.mock('../WorkflowStateContext', () => ({
	useWorkflowState: vi.fn(),
}));

vi.mock('@xyflow/react', async () => {
	const actual = await vi.importActual('@xyflow/react');
	return {
		...actual,
		BaseEdge: ({ path, style }: any) => (
			<div data-testid='base-edge' data-path={path} style={style} />
		),
		EdgeLabelRenderer: ({ children }: any) => (
			<div data-testid='edge-label-renderer'>{children}</div>
		),
		getBezierPath: vi.fn().mockReturnValue(['mock-path', 100, 100]),
	};
});

describe('WorkflowEdge', () => {
	const mockOnEdgeClick = vi.fn();
	const defaultProps = {
		id: 'edge-1',
		source: 'node-1',
		target: 'node-2',
		sourceX: 0,
		sourceY: 0,
		targetX: 200,
		targetY: 0,
		sourcePosition: 'right',
		targetPosition: 'left',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useWorkflowState).mockReturnValue({
			onEdgeClick: mockOnEdgeClick,
		} as any);
	});

	it('renders a base edge', () => {
		renderWithProviders(<WorkflowEdge {...(defaultProps as any)} />);
		expect(screen.getByTestId('base-edge')).toBeInTheDocument();
		expect(screen.getByTestId('base-edge')).toHaveAttribute(
			'data-path',
			'mock-path'
		);
	});

	it('renders forward and backward labels', () => {
		const data = {
			forward: { label: 'Forward Label' },
			backward: { label: 'Backward Label' },
		};
		renderWithProviders(
			<WorkflowEdge {...(defaultProps as any)} data={data} />
		);

		expect(screen.getByText('Forward Label')).toBeInTheDocument();
		expect(screen.getByText('Backward Label')).toBeInTheDocument();
	});

	it('calls onEdgeClick when labels are clicked', () => {
		const data = {
			forward: { label: 'Forward Label' },
			backward: { label: 'Backward Label' },
		};
		renderWithProviders(
			<WorkflowEdge {...(defaultProps as any)} data={data} />
		);

		fireEvent.click(screen.getByText('Forward Label'));
		expect(mockOnEdgeClick).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			'forward'
		);

		fireEvent.click(screen.getByText('Backward Label'));
		expect(mockOnEdgeClick).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			'backward'
		);
	});

	it('applies dashed style for backward-only edges', () => {
		const data = {
			backward: { label: 'Backward Label' },
		};
		renderWithProviders(
			<WorkflowEdge {...(defaultProps as any)} data={data} />
		);

		const baseEdge = screen.getByTestId('base-edge');
		expect(baseEdge.style.strokeDasharray).toBe('5,5');
	});
});
