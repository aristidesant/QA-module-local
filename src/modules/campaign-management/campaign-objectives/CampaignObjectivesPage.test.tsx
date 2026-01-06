import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignObjectivesPage from './CampaignObjectivesPage';
import renderWithProviders from '~/test-utils/renderWithProviders';

// Mock usePermissions
const mockCanPerformAction = vi.fn(() => true);
const mockCanAccessModule = vi.fn(() => true);
vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canPerformAction: mockCanPerformAction,
		canAccessModule: mockCanAccessModule,
	}),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Button: ({
			children,
			onClick,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
		}) => (
			<button type='button' onClick={onClick}>
				{children}
			</button>
		),
	};
});

vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({
		children,
		title,
		titleRight,
	}: {
		children: React.ReactNode;
		title: string;
		titleRight: React.ReactNode;
	}) => (
		<div data-testid='content-container'>
			<h1>{title}</h1>
			<div>{titleRight}</div>
			{children}
		</div>
	),
}));

const mockContentToggle = vi.fn();

vi.mock('./components/CampaignObjectivesContent', () => ({
	__esModule: true,
	default: ({
		createModalOpened,
		setCreateModalOpened,
	}: {
		createModalOpened: boolean;
		setCreateModalOpened: (open: boolean) => void;
	}) => (
		<div data-testid='objectives-content'>
			<span data-testid='create-opened'>
				{createModalOpened ? 'open' : 'closed'}
			</span>
			<button
				type='button'
				onClick={() => {
					mockContentToggle();
					setCreateModalOpened(!createModalOpened);
				}}
			>
				Toggle
			</button>
		</div>
	),
}));

describe('CampaignObjectivesPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders embedded content without container', () => {
		renderWithProviders(<CampaignObjectivesPage embedded />);

		expect(screen.getByTestId('objectives-content')).toBeInTheDocument();
		expect(screen.queryByTestId('content-container')).not.toBeInTheDocument();
	});

	it('shows container and opens create modal through header button', () => {
		renderWithProviders(<CampaignObjectivesPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();
		expect(screen.getByText('Campaign Objectives')).toBeInTheDocument();
		expect(screen.getByTestId('create-opened')).toHaveTextContent('closed');

		fireEvent.click(screen.getByText('Create Objective'));

		expect(screen.getByTestId('create-opened')).toHaveTextContent('open');
	});
});
