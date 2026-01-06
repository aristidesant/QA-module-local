import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import CampaignPromptTypesPage from './CampaignPromptTypesPage';

const mockCanPerformAction = vi.fn(
	(_module: ModuleEnum, _permission: PermissionEnum) => true
);
const mockCanAccessModule = vi.fn((_module: ModuleEnum) => true);

vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
		canAccessModule: mockCanAccessModule,
	}),
}));

// Mock the child components
vi.mock('../components/CampaignPromptTypesContent', () => ({
	default: ({
		createModalOpened,
		setCreateModalOpened,
	}: {
		createModalOpened: boolean;
		setCreateModalOpened: (opened: boolean) => void;
	}) => (
		<div data-testid='campaign-prompt-types-content'>
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
}));

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

describe('CampaignPromptTypesPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCanPerformAction.mockReturnValue(true);
		mockCanAccessModule.mockReturnValue(true);
	});

	describe('Non-embedded mode', () => {
		it('renders the page with ContentContainer wrapper', () => {
			renderWithProviders(<CampaignPromptTypesPage />);

			expect(screen.getByTestId('content-container')).toBeInTheDocument();
			expect(screen.getByText('Prompt Types')).toBeInTheDocument();
			expect(
				screen.getByText(
					'Label and organize the prompt templates used by campaigns.'
				)
			).toBeInTheDocument();
		});

		it('renders Create Prompt Type button in title right section when user has CREATE permission', () => {
			renderWithProviders(<CampaignPromptTypesPage />);

			const titleRight = screen.getByTestId('title-right');
			expect(titleRight).toBeInTheDocument();
			expect(screen.getByText('Create Prompt Type')).toBeInTheDocument();
		});

		it('hides Create Prompt Type button in title right section when user lacks CREATE permission', () => {
			mockCanPerformAction.mockImplementation(
				(module: ModuleEnum, permission: PermissionEnum) => {
					return !(
						module === ModuleEnum.SETTINGS &&
						permission === PermissionEnum.CREATE
					);
				}
			);

			renderWithProviders(<CampaignPromptTypesPage />);

			expect(screen.queryByTestId('title-right')).not.toBeInTheDocument();
			expect(screen.queryByText('Create Prompt Type')).not.toBeInTheDocument();
		});

		it('opens create modal when Create Prompt Type button is clicked', () => {
			renderWithProviders(<CampaignPromptTypesPage />);

			expect(screen.getByTestId('modal-state')).toHaveTextContent('closed');

			const createButton = screen.getByRole('button', {
				name: /create prompt type/i,
			});
			fireEvent.click(createButton);

			expect(screen.getByTestId('modal-state')).toHaveTextContent('open');
		});

		it('renders the content component', () => {
			renderWithProviders(<CampaignPromptTypesPage />);

			expect(
				screen.getByTestId('campaign-prompt-types-content')
			).toBeInTheDocument();
		});
	});

	describe('Embedded mode', () => {
		it('renders without ContentContainer wrapper when embedded is true', () => {
			renderWithProviders(<CampaignPromptTypesPage embedded />);

			expect(screen.queryByTestId('content-container')).not.toBeInTheDocument();
			expect(
				screen.getByTestId('campaign-prompt-types-content')
			).toBeInTheDocument();
		});

		it('does not render title or description in embedded mode', () => {
			renderWithProviders(<CampaignPromptTypesPage embedded />);

			expect(screen.queryByText('Prompt Types')).not.toBeInTheDocument();
		});
	});

	describe('Modal state management', () => {
		it('can close the modal from child component', () => {
			renderWithProviders(<CampaignPromptTypesPage />);

			// Open modal
			const createButton = screen.getByRole('button', {
				name: /create prompt type/i,
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
