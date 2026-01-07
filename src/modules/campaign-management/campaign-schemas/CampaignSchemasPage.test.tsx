import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import renderWithProviders from '~/test-utils/renderWithProviders';
import CampaignSchemasPage from './CampaignSchemasPage';

// Mock the child components
vi.mock(
	'~/modules/campaign-management/campaign-schemas/components/CampaignSchemasContent',
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

const mockCanAccessModule = vi.fn(() => true);
const mockCanPerformAction = vi.fn(() => true);
const mockHasAnyPermission = vi.fn(() => true);
const mockHasAllPermissions = vi.fn(() => true);

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		activeClientId: 1,
		permissionMap: {},
		canAccessModule: mockCanAccessModule,
		canPerformAction: mockCanPerformAction,
		hasAnyPermission: mockHasAnyPermission,
		hasAllPermissions: mockHasAllPermissions,
	}),
}));

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({
		children,
		title,
		description,
		titleRight,
	}: {
		children: ReactNode;
		title: string;
		description: string;
		titleIcon?: ReactNode;
		titleRight?: ReactNode;
	}) => (
		<div data-testid='content-container'>
			<h1>{title}</h1>
			<p>{description}</p>
			{titleRight && <div data-testid='title-right'>{titleRight}</div>}
			{children}
		</div>
	),
}));

describe('CampaignSchemasPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCanAccessModule.mockReturnValue(true);
		mockCanPerformAction.mockReturnValue(true);
		mockHasAnyPermission.mockReturnValue(true);
		mockHasAllPermissions.mockReturnValue(true);
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
				name: 'Create Schema',
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
				name: 'Create Schema',
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
