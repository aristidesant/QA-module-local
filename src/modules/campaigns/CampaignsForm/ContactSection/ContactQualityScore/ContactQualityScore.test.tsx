import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ContactQualityScore } from './ContactQualityScore';

describe('ContactQualityScore', () => {
	it('renders with default score values', () => {
		renderWithProviders(<ContactQualityScore />);

		expect(screen.getByText('82/100')).toBeInTheDocument();
	});

	it('renders with custom score values', () => {
		renderWithProviders(<ContactQualityScore score={95} maxScore={100} />);

		expect(screen.getByText('95/100')).toBeInTheDocument();
	});

	it('displays the title from translations', () => {
		renderWithProviders(<ContactQualityScore />);

		expect(
			screen.getByText('form.contacts.qualityScore.title')
		).toBeInTheDocument();
	});

	it('displays the subtitle from translations', () => {
		renderWithProviders(<ContactQualityScore />);

		expect(
			screen.getByText('form.contacts.qualityScore.subtitle')
		).toBeInTheDocument();
	});

	it('renders the green indicator dot', () => {
		const { container } = renderWithProviders(<ContactQualityScore />);

		const greenDot = container.querySelector('[class*="greenDot"]');
		expect(greenDot).toBeInTheDocument();
	});
});
