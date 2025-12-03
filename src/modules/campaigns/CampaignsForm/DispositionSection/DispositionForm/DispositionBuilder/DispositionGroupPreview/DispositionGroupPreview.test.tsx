import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DispositionGroupPreview, {
	collectNodeStats,
	renderNode,
} from './DispositionGroupPreview';
import { getNodeStyle } from '~/utils/dispositionNodeStyles';

describe('DispositionGroupPreview', () => {
	it('shows aggregated stats and node tree', () => {
		const node = {
			id: 1,
			name: 'Root',
			children: [
				{ id: 2, name: 'Child 1', isFinal: true, children: [] },
				{ id: 3, name: 'Child 2', requiresReschedule: true, children: [] },
				{ id: 4, name: 'Child 3', isInvalidatesNumber: true, children: [] },
			],
		} as any;

		renderWithProviders(<DispositionGroupPreview node={node} />);

		expect(screen.getByText('Root')).toBeInTheDocument();
		const totalCard = screen.getByText('Total nodes').closest('div');
		expect(totalCard).toBeTruthy();
		expect(within(totalCard!).getByText('4')).toBeInTheDocument();

		const finalCard = screen.getByText('Final outcomes').closest('div');
		expect(within(finalCard!).getByText('1')).toBeInTheDocument();

		const rescheduleCard = screen.getByText('Reschedule').closest('div');
		expect(within(rescheduleCard!).getByText('1')).toBeInTheDocument();

		const blockedCard = screen.getByText('Do not retry').closest('div');
		expect(within(blockedCard!).getByText('1')).toBeInTheDocument();
		// The tree rendering is not included in the preview; ensure stats are present
		expect(screen.getByText(/4 nodes across/)).toBeInTheDocument();
	});

	it('renders leaf outcome with description and final badge (via renderNode)', () => {
		const node = {
			id: 10,
			name: 'Solo Node',
			description: 'Some helpful text',
			isFinal: true,
			children: [],
		} as any;

		renderWithProviders(<ul>{renderNode(node)}</ul>);

		expect(screen.getByText('Solo Node')).toBeInTheDocument();
		expect(screen.getByText('Some helpful text')).toBeInTheDocument();
		expect(screen.getByText('Leaf outcome')).toBeInTheDocument();
		expect(screen.getByText('Final outcome')).toBeInTheDocument();

		// Ensure stats show correct values using the top-level preview
		renderWithProviders(<DispositionGroupPreview node={node} />);
		expect(screen.getByText('1 node across 1 level.')).toBeInTheDocument();
		expect(
			within(screen.getByText('Final outcomes').closest('div')!).getByText('1')
		).toBeInTheDocument();
	});

	it('renders nested children, pluralization and level badges (via renderNode)', () => {
		const node = {
			id: 20,
			name: 'Effective contact group',
			children: [
				{
					id: 21,
					name: 'Child A',
					children: [{ id: 22, name: 'Grandchild' }],
					requiresReschedule: true,
				},
				{ id: 23, name: 'Child B', children: [], isInvalidatesNumber: true },
			],
		} as any;

		renderWithProviders(<ul>{renderNode(node)}</ul>);

		// Node name and meta
		expect(screen.getByText('Effective contact group')).toBeInTheDocument();

		// Child meta: Child A has 1 linked outcome and Child B is Leaf
		expect(screen.getByText('Child A')).toBeInTheDocument();
		expect(screen.getByText('1 linked outcome')).toBeInTheDocument();
		expect(screen.getByText('Child B')).toBeInTheDocument();
		expect(screen.getAllByText('Leaf outcome').length).toBeGreaterThan(0);

		// Badges for reschedule and do not retry
		expect(screen.getByText('Requires reschedule')).toBeInTheDocument();
		expect(screen.getByText('Do not retry')).toBeInTheDocument();

		// Ensure level badges render for non-root nodes
		expect(screen.getAllByText(/Level 1/).length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('Root group')).toBeInTheDocument();
	});

	it('collectNodeStats returns correct counts and depth', () => {
		const node = {
			id: 100,
			name: 'Root',
			children: [
				{ id: 101, name: 'One', isFinal: true, children: [] },
				{ id: 102, name: 'Two', requiresReschedule: true, children: [] },
				{
					id: 103,
					name: 'Family',
					children: [
						{ id: 104, name: 'Child', isInvalidatesNumber: true, children: [] },
					],
				},
			],
		} as any;

		const stats = collectNodeStats(node);
		expect(stats.total).toBe(5);
		expect(stats.final).toBe(1);
		expect(stats.reschedule).toBe(1);
		expect(stats.blocked).toBe(1);
		expect(stats.depth).toBe(2);
	});

	it('renderNode produces the expected elements for a node', () => {
		const node = {
			id: 200,
			name: 'Test Node',
			description: 'Description present',
			children: [{ id: 201, name: 'Child', children: [] }],
			requiresReschedule: true,
		} as any;

		// Render returned node element inside a list
		renderWithProviders(<ul>{renderNode(node)}</ul>);

		expect(screen.getByText('Test Node')).toBeInTheDocument();
		expect(screen.getByText('Description present')).toBeInTheDocument();
		expect(screen.getByText('Requires reschedule')).toBeInTheDocument();
		expect(screen.getByText('1 linked outcome')).toBeInTheDocument();
		// Root-level badge
		expect(screen.getByText('Root group')).toBeInTheDocument();
	});

	it('applies node style classes for effective/no effective/no contact names', () => {
		const names = ['Effective Contact', 'No effective contact', 'No contact'];

		names.forEach((name) => {
			const node = { id: Math.random(), name, children: [] } as any;
			// ensure getNodeStyle returns the expected style string
			const lower = name.toLowerCase();
			if (lower.includes('effective') && !lower.includes('no')) {
				expect(getNodeStyle(node, 0)).toBe('effective');
			} else if (lower.includes('no effective')) {
				expect(getNodeStyle(node, 0)).toBe('noEffective');
			} else if (lower.includes('no contact')) {
				expect(getNodeStyle(node, 0)).toBe('noContact');
			}
		});
	});

	it('shows all badges if flags present', () => {
		const node = {
			id: 300,
			name: 'Flags',
			children: [],
			requiresReschedule: true,
			isInvalidatesNumber: true,
			isFinal: true,
		} as any;
		renderWithProviders(<ul>{renderNode(node)}</ul>);
		expect(screen.getByText('Requires reschedule')).toBeInTheDocument();
		expect(screen.getByText('Do not retry')).toBeInTheDocument();
		expect(screen.getByText('Final outcome')).toBeInTheDocument();
	});

	it('node with undefined children renders leaf outcome', () => {
		const node = {
			id: 400,
			name: 'Undefined children',
			// children: undefined
		} as any;
		renderWithProviders(<ul>{renderNode(node)}</ul>);
		expect(screen.getByText('Leaf outcome')).toBeInTheDocument();
	});

	it('renders deep nested nodes to exercise deeper branches', () => {
		const node = {
			id: 500,
			name: 'No contact root',
			children: [
				{
					id: 501,
					name: 'Level1',
					children: [
						{
							id: 502,
							name: 'Level2',
							isFinal: true,
							isInvalidatesNumber: true,
							children: [{ id: 503, name: 'Level3', children: [] }],
						},
					],
				},
			],
		} as any;

		renderWithProviders(<ul>{renderNode(node)}</ul>);
		expect(screen.getByText('No contact root')).toBeInTheDocument();
		expect(screen.getByText('Level1')).toBeInTheDocument();
		expect(screen.getByText('Level2')).toBeInTheDocument();
		expect(screen.getAllByText('Leaf outcome').length).toBeGreaterThan(0);
		expect(screen.getByText('Final outcome')).toBeInTheDocument();
		expect(screen.getByText('Do not retry')).toBeInTheDocument();
	});
});

export {};
