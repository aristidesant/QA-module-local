import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignFilters from './CampaignFilters';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

describe('CampaignFilters', () => {
	const onSearchChange = vi.fn();
	const onSortChange = vi.fn();
	const onFiltersChange = vi.fn();

	const baseProps = {
		searchValue: '',
		onSearchChange,
		sortBy: 'createdAt',
		onSortChange,
		filters: {},
		onFiltersChange,
	} as any;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders and shows search value', () => {
		renderWithProviders(<CampaignFilters {...baseProps} searchValue={'abc'} />);

		const input = screen.getByPlaceholderText('filters.searchPlaceholder');
		expect(input).toBeInTheDocument();
		expect((input as HTMLInputElement).value).toBe('abc');
	});

	it('clears search when close button is clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CampaignFilters {...baseProps} searchValue={'a'} />);

		const closeBtn = screen.getByLabelText('actions.close');
		await user.click(closeBtn);
		expect(onSearchChange).toHaveBeenCalledWith('');
	});

	it('toggles advanced and updates includeCompleted filter', async () => {
		const user = userEvent.setup();
		renderWithProviders(<CampaignFilters {...baseProps} />);

		// Open advanced
		const advButton = screen.getByRole('button', { name: /filters.advanced/i });
		await user.click(advButton);

		const includeCompleted = await screen.findByText(
			'filters.includeCompleted'
		);
		expect(includeCompleted).toBeInTheDocument();
		// Switch may not expose role in DOM consistently; use label text
		const switchEl = screen.getByLabelText('filters.includeCompleted');
		await user.click(switchEl);
		expect(onFiltersChange).toHaveBeenCalledWith({ includeCompleted: true });
	});
});
