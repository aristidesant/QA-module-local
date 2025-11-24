import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CampaignManagementPage from './CampaignManagementPage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock child components
vi.mock('./Categories/CampaignCategoriesPage', () => ({
	default: () => <div data-testid='categories-page'>Categories Page</div>,
}));
vi.mock('./Objectives/CampaignObjectivesPage', () => ({
	default: () => <div data-testid='objectives-page'>Objectives Page</div>,
}));
vi.mock('./Schemas/CampaignSchemasPage', () => ({
	default: () => <div data-testid='schemas-page'>Schemas Page</div>,
}));
vi.mock('./Outcomes/DispositionPage', () => ({
	default: () => <div data-testid='outcomes-page'>Outcomes Page</div>,
}));
vi.mock('./PromptTypes', () => ({
	default: () => <div data-testid='prompt-types-page'>Prompt Types Page</div>,
}));

describe('CampaignManagementPage', () => {
	it('renders tabs and default content', () => {
		renderWithProviders(<CampaignManagementPage />);

		expect(screen.getByText('Campaign Management')).toBeInTheDocument();
		expect(screen.getByText('Categories')).toBeInTheDocument();
		expect(screen.getByText('Objectives')).toBeInTheDocument();
		expect(screen.getByText('Schemas')).toBeInTheDocument();
		expect(screen.getByText('Outcomes')).toBeInTheDocument();
		expect(screen.getByText('Prompt Types')).toBeInTheDocument();

		// Default tab content
		expect(screen.getByTestId('categories-page')).toBeInTheDocument();
	});

	it('switches tabs correctly', () => {
		renderWithProviders(<CampaignManagementPage />);

		// Switch to Objectives
		fireEvent.click(screen.getByText('Objectives'));
		expect(screen.getByTestId('objectives-page')).toBeInTheDocument();

		// Switch to Schemas
		fireEvent.click(screen.getByText('Schemas'));
		expect(screen.getByTestId('schemas-page')).toBeInTheDocument();

		// Switch to Outcomes
		fireEvent.click(screen.getByText('Outcomes'));
		expect(screen.getByTestId('outcomes-page')).toBeInTheDocument();

		// Switch to Prompt Types
		fireEvent.click(screen.getByText('Prompt Types'));
		expect(screen.getByTestId('prompt-types-page')).toBeInTheDocument();
	});
});
