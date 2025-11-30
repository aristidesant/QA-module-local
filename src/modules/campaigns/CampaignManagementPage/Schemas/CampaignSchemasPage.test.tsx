import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CampaignSchemasPage from './CampaignSchemasPage';

// Mock the child components
vi.mock(
	'~/modules/campaigns/CampaignManagementPage/Schemas/components/CampaignSchemasContent',
	() => ({
		default: ({
			createModalOpened,
			setCreateModalOpened,
		}: {
			createModalOpened: boolean;
			setCreateModalOpened: (opened: boolean) => void;
		}) => (
			<div data-testid='campaign-schemas-content'>
				<span data-testid='modal-state'>
					{createModalOpened ? 'open' : 'closed'}
				</span>
				<button
					data-testid='close-modal'
					onClick={() => setCreateModalOpened(false)}
				>
					Close Modal
				</button>
			</div>
		),
	})
);

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({
		children,
		title,
		description,
		titleRight,
	}: {
		children: React.ReactNode;
		title: string;
		description: string;
		titleIcon?: React.ReactNode;
		titleRight?: React.ReactNode;
	}) => (
		<div data-testid='content-container'>
			<h1>{title}</h1>
			<p>{description}</p>
			{titleRight && <div data-testid='title-right'>{titleRight}</div>}
			{children}
		</div>
	),
}));

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: { retry: false },
		},
	});

const renderWithProviders = (ui: React.ReactNode) => {
	const queryClient = createTestQueryClient();
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>{ui}</MantineProvider>
		</QueryClientProvider>
	);
};

describe('CampaignSchemasPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Non-embedded mode', () => {
		it('renders the page with ContentContainer wrapper', () => {
			renderWithProviders(<CampaignSchemasPage />);

			expect(screen.getByTestId('content-container')).toBeInTheDocument();
			expect(screen.getByText('Campaign Schemas')).toBeInTheDocument();
			expect(
				screen.getByText(
					'Define and manage contact data schemas for your campaigns'
				)
			).toBeInTheDocument();
		});

		it('renders Create Schema button in title right section', () => {
			renderWithProviders(<CampaignSchemasPage />);

			const titleRight = screen.getByTestId('title-right');
			expect(titleRight).toBeInTheDocument();
			expect(screen.getByText('Create Schema')).toBeInTheDocument();
		});

		it('opens create modal when Create Schema button is clicked', () => {
			renderWithProviders(<CampaignSchemasPage />);

			expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');

			const createButton = screen.getByRole('button', {
				name: /create schema/i,
			});
			fireEvent.click(createButton);

			expect(screen.getByTestId('modal-state')).toHaveTextContent('open');
		});

		it('renders the content component', () => {
			renderWithProviders(<CampaignSchemasPage />);

			expect(
				screen.getByTestId('campaign-schemas-content')
			).toBeInTheDocument();
		});
	});

	describe('Embedded mode', () => {
		it('renders without ContentContainer wrapper when embedded is true', () => {
			renderWithProviders(<CampaignSchemasPage embedded />);

			expect(screen.queryByTestId('content-container')).not.toBeInTheDocument();
			expect(
				screen.getByTestId('campaign-schemas-content')
			).toBeInTheDocument();
		});

		it('does not render title or description in embedded mode', () => {
			renderWithProviders(<CampaignSchemasPage embedded />);

			expect(screen.queryByText('Campaign Schemas')).not.toBeInTheDocument();
		});
	});

	describe('Modal state management', () => {
		it('can close the modal from child component', () => {
			renderWithProviders(<CampaignSchemasPage />);

			// Open modal
			const createButton = screen.getByRole('button', {
				name: /create schema/i,
			});
			fireEvent.click(createButton);
			expect(screen.getByTestId('modal-state')).toHaveTextContent('open');

			// Close modal from child
			const closeButton = screen.getByTestId('close-modal');
			fireEvent.click(closeButton);
			expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');
		});
	});
});
