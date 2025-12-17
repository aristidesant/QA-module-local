import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import DispositionViewer from './DispositionViewer';

const mockSetRightComponent = vi.fn();

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: () => ({ setRightComponent: mockSetRightComponent }),
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/DispositionSection/NodeDetailPanel',
	() => ({
		__esModule: true,
		default: ({ node }: any) => <div>NodeDetail-{node?.id}</div>,
	})
);

describe('DispositionViewer', () => {
	beforeEach(() => vi.clearAllMocks());

	it('renders empty state when no nodes exist', () => {
		const flow = { flowJson: { name: 'Test', dispositionNodes: [] } } as any;
		renderWithProviders(<DispositionViewer flow={flow} />);
		expect(screen.getByText(/No outcome nodes found./i)).toBeInTheDocument();
	});

	it('renders group node with children and supports expand/collapse without opening details', () => {
		const flow = {
			flowJson: {
				name: 'Root Flow',
				dispositionNodes: [
					{
						id: 1,
						name: 'Group Node',
						children: [{ id: 2, name: 'Child Leaf', children: [] }],
					},
				],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		// root flow title present
		expect(screen.getByText('Root Flow')).toBeInTheDocument();

		// child rendered initially (expanded)
		expect(screen.getByText('Child Leaf')).toBeInTheDocument();

		// collapse the group using the chevron button
		const collapseBtn = screen.getByLabelText('Collapse node');
		fireEvent.click(collapseBtn);
		expect(screen.queryByText('Child Leaf')).toBeNull();

		// expand again
		const expandBtn = screen.getByLabelText('Expand node');
		fireEvent.click(expandBtn);
		expect(screen.getByText('Child Leaf')).toBeInTheDocument();

		// click on the group card should NOT open the NodeDetailPanel
		const groupCard = screen.getByLabelText(/Outcome node: Group Node/i);
		fireEvent.click(groupCard);
		expect(mockSetRightComponent).not.toHaveBeenCalled();
	});

	it('activates leaf node via keyboard Enter and Space to open details', async () => {
		const flow = {
			flowJson: {
				name: 'Root Flow',
				dispositionNodes: [{ id: 3, name: 'Leaf Node', children: [] }],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		const leaf = screen.getByLabelText(/Outcome node: Leaf Node/i);
		// ensure it is focusable
		leaf.focus();
		fireEvent.keyDown(leaf, { key: 'Enter', code: 'Enter', charCode: 13 });
		expect(mockSetRightComponent).toHaveBeenCalledTimes(1);

		// Press space, it should open again
		fireEvent.keyDown(leaf, { key: ' ', code: 'Space', charCode: 32 });
		expect(mockSetRightComponent).toHaveBeenCalledTimes(2);
	});

	it('shows icons for invalidates number and requires reschedule on leaf nodes', () => {
		const flow = {
			flowJson: {
				name: 'Icon Flow',
				dispositionNodes: [
					{
						id: 7,
						name: 'Icons Leaf',
						children: [],
						isInvalidatesNumber: true,
						requiresReschedule: true,
					},
				],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);
		const nodeCard = screen.getByLabelText(/Outcome node: Icons Leaf/i);
		const svgs = nodeCard?.querySelectorAll('svg') || [];
		// There should be at least 3 svgs: document icon + 2 side icons
		expect(svgs.length).toBeGreaterThanOrEqual(3);
	});

	it('shows do not call badge when doNotCall is true', () => {
		const flow = {
			flowJson: {
				name: 'DNC Flow',
				dispositionNodes: [
					{
						id: 8,
						name: 'DNC Leaf',
						children: [],
						doNotCall: true,
					},
				],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		expect(screen.getByLabelText(/Do not call/i)).toBeInTheDocument();
	});

	it('applies node style classes based on name content', () => {
		const names = [
			{ name: 'Effective contact - root', expected: 'effective' },
			{ name: 'No effective outcome', expected: 'noEffective' },
			{ name: 'No contact', expected: 'noContact' },
			{ name: 'Whatever name', expected: 'default' },
		];

		const nodes = names.map((n, idx) => ({
			id: idx + 11,
			name: n.name,
			children: [],
		}));
		const flow = {
			flowJson: { name: 'Style Flow', dispositionNodes: nodes },
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		for (const n of names) {
			const card = screen.getByLabelText(new RegExp(`Outcome node: ${n.name}`));
			// statusPill is the first span inside the card with data-type attribute
			const pill = card.querySelector('span[data-type]');
			expect(pill?.getAttribute('data-type')).toBe(n.expected);
		}
	});

	it('renders nodes and opens NodeDetailPanel on leaf click', () => {
		const flow = {
			flowJson: {
				name: 'Flow',
				dispositionNodes: [{ id: 1, name: 'Leaf', children: [] }],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		expect(screen.getByText('Flow')).toBeInTheDocument();
		const leaf = screen.getByLabelText(/Outcome node: Leaf/i);
		fireEvent.click(leaf);
		expect(mockSetRightComponent).toHaveBeenCalled();
	});

	it('sets card offset style and data-level for nested children', () => {
		const flow = {
			flowJson: {
				name: 'Offset Flow',
				dispositionNodes: [
					{
						id: 21,
						name: 'Parent',
						children: [{ id: 22, name: 'Child Level 1', children: [] }],
					},
				],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		const child = screen.getByLabelText(/Outcome node: Child Level 1/i);
		// card should have data-level=1
		expect(child.getAttribute('data-level')).toBe('1');

		// style should include the offset custom property
		expect(
			(child as HTMLElement).style.getPropertyValue('--node-offset')
		).toBeTruthy();
	});

	it('does not open NodeDetailPanel for non-clickable group via keyboard', () => {
		const flow = {
			flowJson: {
				name: 'Group Flow',
				dispositionNodes: [
					{
						id: 31,
						name: 'Parent Group',
						children: [{ id: 32, name: 'Child Leaf', children: [] }],
					},
				],
			},
		} as any;

		renderWithProviders(<DispositionViewer flow={flow} />);

		const group = screen.getByLabelText(/Outcome node: Parent Group/i);
		group.focus();
		fireEvent.keyDown(group, { key: 'Enter', code: 'Enter', charCode: 13 });
		expect(mockSetRightComponent).not.toHaveBeenCalled();
	});
});

export {};
