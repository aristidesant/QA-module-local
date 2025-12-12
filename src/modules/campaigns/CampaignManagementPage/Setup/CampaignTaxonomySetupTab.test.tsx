import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignTaxonomySetupTab from './CampaignTaxonomySetupTab';

vi.mock('../Categories/CampaignCategoriesPage', () => ({
	default: () => <div data-testid='categories-page'>Categories Page</div>,
}));

vi.mock('../Objectives/CampaignObjectivesPage', () => ({
	default: () => <div data-testid='objectives-page'>Objectives Page</div>,
}));

vi.mock('../Schemas/CampaignSchemasPage', () => ({
	default: () => <div data-testid='schemas-page'>Schemas Page</div>,
}));

describe('CampaignTaxonomySetupTab', () => {
	it('renders schemas by default and switches sections', () => {
		renderWithProviders(<CampaignTaxonomySetupTab />);

		expect(screen.getByTestId('schemas-page')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Objectives'));
		expect(screen.getByTestId('objectives-page')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Categories'));
		expect(screen.getByTestId('categories-page')).toBeInTheDocument();
	});
});
