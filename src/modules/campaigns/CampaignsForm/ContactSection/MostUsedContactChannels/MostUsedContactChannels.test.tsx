import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { MostUsedContactChannels } from './MostUsedContactChannels';

describe('MostUsedContactChannels', () => {
	it('renders with default score values', () => {
		renderWithProviders(<MostUsedContactChannels />);

		expect(screen.getByText('82/100')).toBeInTheDocument();
	});

	it('renders with custom score values', () => {
		renderWithProviders(<MostUsedContactChannels score={75} maxScore={100} />);

		expect(screen.getByText('75/100')).toBeInTheDocument();
	});

	it('displays the title from translations', () => {
		renderWithProviders(<MostUsedContactChannels />);

		expect(
			screen.getByText('form.contacts.mostUsedChannels.title')
		).toBeInTheDocument();
	});

	it('displays the subtitle from translations', () => {
		renderWithProviders(<MostUsedContactChannels />);

		expect(
			screen.getByText('form.contacts.mostUsedChannels.subtitle')
		).toBeInTheDocument();
	});

	it('renders the green indicator dot', () => {
		const { container } = renderWithProviders(<MostUsedContactChannels />);

		const greenDot = container.querySelector('[class*="greenDot"]');
		expect(greenDot).toBeInTheDocument();
	});
});
