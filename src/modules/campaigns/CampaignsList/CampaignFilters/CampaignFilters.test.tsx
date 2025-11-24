import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import CampaignFilters from './CampaignFilters';

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
		render(
			<MantineProvider>
				<CampaignFilters {...baseProps} searchValue={'abc'} />
			</MantineProvider>
		);

		const input = screen.getByPlaceholderText('Search campaigns...');
		expect(input).toBeInTheDocument();
		expect((input as HTMLInputElement).value).toBe('abc');
	});

	it('clears search when close button is clicked', () => {
		render(
			<MantineProvider>
				<CampaignFilters {...baseProps} searchValue={'a'} />
			</MantineProvider>
		);

		// Mantine CloseButton has no accessible name in DOM; query by class
		const closeBtn = document.querySelector(
			"[class*='CloseButton-root']"
		) as HTMLButtonElement;
		fireEvent.click(closeBtn);
		expect(onSearchChange).toHaveBeenCalledWith('');
	});

	it('toggles advanced and updates includeCompleted filter', async () => {
		render(
			<MantineProvider>
				<CampaignFilters {...baseProps} />
			</MantineProvider>
		);

		// Open advanced
		const advButton = screen.getByRole('button', { name: /advanced/i });
		fireEvent.click(advButton);

		const includeCompleted = await screen.findByText('Include completed');
		expect(includeCompleted).toBeInTheDocument();
		// Switch may not expose role in DOM consistently; use label text
		const switchEl = screen.getByLabelText(
			'Include completed'
		) as HTMLInputElement;
		fireEvent.click(switchEl);
		expect(onFiltersChange).toHaveBeenCalledWith({ includeCompleted: true });
	});
});
