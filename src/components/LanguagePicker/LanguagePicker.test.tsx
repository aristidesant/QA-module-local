import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import LanguagePicker from './LanguagePicker';

describe('LanguagePicker', () => {
	it('renders with current language label', () => {
		renderWithProviders(<LanguagePicker />);
		expect(screen.getByText('English')).toBeInTheDocument();
	});

	it('opens menu when clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(<LanguagePicker />);

		const trigger = screen.getByRole('button');
		await user.click(trigger);

		// Use findByText to wait for Portal/Menu animation
		expect(await screen.findByText('English')).toBeInTheDocument();
		expect(await screen.findByText('Español')).toBeInTheDocument();
	});

	it('changes language when option is selected', async () => {
		const user = userEvent.setup();
		renderWithProviders(<LanguagePicker />);

		const trigger = screen.getByRole('button');
		await user.click(trigger);

		const spanishOption = await screen.findByText('Español');
		await user.click(spanishOption);

		// Verify the language updated on the trigger
		expect(await screen.findByText('Español')).toBeInTheDocument();
	});
});
