import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolsPage from './ToolsPage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock child components
vi.mock('../ToolsList', () => ({
	default: ({ onCreate, onEdit }: any) => (
		<div data-testid='tools-list'>
			<button onClick={onCreate} data-testid='create-btn'>
				Create Tool
			</button>
			<button onClick={() => onEdit(123)} data-testid='edit-btn'>
				Edit Tool 123
			</button>
		</div>
	),
}));

vi.mock('./ToolsModal', () => ({
	default: ({ opened, onClose, toolId }: any) =>
		opened ? (
			<div data-testid='tools-modal'>
				Modal Open. Tool: {toolId || 'New'}
				<button onClick={onClose} data-testid='close-modal-btn'>
					Close
				</button>
			</div>
		) : null,
}));

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({ title, description, children, titleRight }: any) => (
		<div data-testid='content-container'>
			<h1>{title}</h1>
			<p>{description}</p>
			<div data-testid='title-right'>{titleRight}</div>
			{children}
		</div>
	),
}));

// Mock queries
vi.mock('~/queries/toolCategoryQueries', () => ({
	useToolCategories: vi.fn(() => ({
		data: [
			{ id: 1, name: 'Webhook' },
			{ id: 2, name: 'Others' },
		],
		isLoading: false,
	})),
}));

// Mock store
const mockSetToolsCategory = vi.fn();
vi.mock('~/stores/toolsStore', () => ({
	default: vi.fn(() => ({
		selectedToolCategory: null,
		setToolsCategory: mockSetToolsCategory,
	})),
}));

describe('ToolsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders correctly and attempts to set default category', () => {
		renderWithProviders(<ToolsPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();
		// Should attempt to set webhook category
		expect(mockSetToolsCategory).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Webhook' })
		);
	});

	it('opens modal when create is clicked', async () => {
		renderWithProviders(<ToolsPage />);

		fireEvent.click(screen.getByTestId('create-btn'));

		await waitFor(() => {
			expect(screen.getByTestId('tools-modal')).toBeInTheDocument();
			expect(screen.getByText('Modal Open. Tool: New')).toBeInTheDocument();
		});
	});

	it('opens modal with toolId when edit is clicked', async () => {
		renderWithProviders(<ToolsPage />);

		fireEvent.click(screen.getByTestId('edit-btn'));

		await waitFor(() => {
			expect(screen.getByTestId('tools-modal')).toBeInTheDocument();
			expect(screen.getByText('Modal Open. Tool: 123')).toBeInTheDocument();
		});
	});
});
