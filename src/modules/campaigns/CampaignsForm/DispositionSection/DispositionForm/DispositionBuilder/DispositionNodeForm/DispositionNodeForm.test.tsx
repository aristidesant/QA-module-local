import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import DispositionNodeForm from './DispositionNodeForm';

const mockUpdateNode = vi.fn();

vi.mock('../../../dispositionStore', () => ({
	useDispositionBuilderStore: (selector?: any) =>
		selector
			? selector({ updateNode: mockUpdateNode })
			: { updateNode: mockUpdateNode },
}));

describe('DispositionNodeForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders and calls updateNode on save', () => {
		const node = {
			id: 1,
			name: 'Foo',
			description: '',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		} as any;
		const onSubmit = vi.fn();
		const onCancel = vi.fn();

		renderWithProviders(
			<DispositionNodeForm
				node={node}
				onSubmit={onSubmit}
				onCancel={onCancel}
			/>
		);

		// Click save - it should call updateNode and onSubmit
		fireEvent.click(screen.getByRole('button', { name: /save/i }));
		expect(mockUpdateNode).toHaveBeenCalled();
		expect(onSubmit).toHaveBeenCalled();
	});

	it('renders parent label and header title', () => {
		const node = {
			id: 2,
			name: 'Parent Test',
			description: 'Some desc',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		} as any;
		const parent = { id: 10, name: 'Parent Name' } as any;

		renderWithProviders(
			<DispositionNodeForm node={node} parentNode={parent} />
		);

		// Header title
		expect(screen.getByText(node.name)).toBeInTheDocument();
		// Parent badge
		expect(screen.getByText(parent.name)).toBeInTheDocument();
	});

	it('shows root parent label when no parent provided', () => {
		const node = {
			id: 3,
			name: 'Root Node',
			description: '',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		} as any;

		renderWithProviders(<DispositionNodeForm node={node} />);

		expect(screen.getByText('Root level outcome')).toBeInTheDocument();
	});

	it('shows badge when isFinal is true and description fallback', () => {
		const node = {
			id: 4,
			name: 'Final Node',
			description: '',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: true,
		} as any;

		renderWithProviders(<DispositionNodeForm node={node} />);

		expect(screen.getByText(/Final outcome/i)).toBeInTheDocument();
		expect(
			screen.getByText('This outcome does not include a description yet.')
		).toBeInTheDocument();
	});

	it('toggles invalidates and requires reschedule switches and shows badges', () => {
		const node = {
			id: 5,
			name: 'Toggle Node',
			description: 'Has description',
			isInvalidatesNumber: false,
			doNotCall: false,
			requiresReschedule: false,
			isFinal: false,
		} as any;

		renderWithProviders(<DispositionNodeForm node={node} />);

		fireEvent.click(
			screen.getByRole('switch', { name: /invalidates number/i })
		);
		expect(screen.getByText(/Do not retry/i)).toBeInTheDocument();

		fireEvent.click(screen.getByRole('switch', { name: /do not call/i }));
		const doNotCallBadgeEls = screen
			.getAllByText(/Do not call/i)
			.filter((el) => el.tagName === 'SPAN');
		expect(doNotCallBadgeEls.length).toBeGreaterThan(0);

		fireEvent.click(
			screen.getByRole('switch', { name: /requires reschedule/i })
		);
		// There is a 'Requires reschedule' title and a badge. Ensure the badge exists by
		// finding the text whose element is a <span> (Mantine badge label renders as span).
		const badgeEls = screen
			.getAllByText(/Requires reschedule/i)
			.filter((el) => el.tagName === 'SPAN');
		expect(badgeEls.length).toBeGreaterThan(0);
	});

	it('calls onCancel when cancel clicked', () => {
		const node = {
			id: 6,
			name: 'Cancel Node',
			description: 'desc',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		} as any;
		const onCancel = vi.fn();

		renderWithProviders(
			<DispositionNodeForm node={node} onCancel={onCancel} />
		);

		fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
		expect(onCancel).toHaveBeenCalled();
	});

	it('calls updateNode with updated values on save', () => {
		const node = {
			id: 7,
			name: 'Save node',
			description: '',
			isInvalidatesNumber: false,
			doNotCall: false,
			requiresReschedule: false,
			isFinal: false,
		} as any;
		const onSubmit = vi.fn();

		renderWithProviders(
			<DispositionNodeForm node={node} onSubmit={onSubmit} />
		);

		fireEvent.click(
			screen.getByRole('switch', { name: /invalidates number/i })
		);
		fireEvent.click(screen.getByRole('switch', { name: /do not call/i }));
		// Save
		fireEvent.click(screen.getByRole('button', { name: /save/i }));

		expect(mockUpdateNode).toHaveBeenCalledTimes(1);
		expect(mockUpdateNode).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 7,
				isInvalidatesNumber: true,
				doNotCall: true,
			})
		);
		expect(onSubmit).toHaveBeenCalled();
	});
});

export {};
