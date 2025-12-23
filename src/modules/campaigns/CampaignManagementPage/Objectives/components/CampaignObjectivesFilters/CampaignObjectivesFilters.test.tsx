import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import {
	CampaignObjectivesFilters,
	ObjectiveFilters,
} from './CampaignObjectivesFilters';

vi.mock('~/queries/campaignCategoriesQueries', () => ({
	useGetCampaignCategories: () => ({
		data: {
			data: [
				{ id: 1, name: 'Sales' },
				{ id: 2, name: 'Retention' },
			],
		},
	}),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Group: ({ children }: { children: React.ReactNode }) => (
			<div data-testid='group'>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<span>{children}</span>
		),
		Badge: ({ children }: { children: React.ReactNode }) => (
			<span data-testid='badge'>{children}</span>
		),
		TextInput: ({
			value,
			onChange,
			placeholder,
		}: {
			value: string;
			onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
			placeholder: string;
		}) => (
			<input
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				data-testid='text-input'
			/>
		),
		Select: ({
			value,
			onChange,
			data,
			placeholder,
		}: {
			value: string;
			onChange: (value: string | null) => void;
			data: { value: string; label: string }[];
			placeholder: string;
		}) => (
			<select
				aria-label={placeholder}
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				data-testid={`select-${placeholder}`}
			>
				{data.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		),
		ActionIcon: ({
			onClick,
			children,
		}: {
			onClick: () => void;
			children: React.ReactNode;
		}) => (
			<button type='button' onClick={onClick} data-testid='clear-action'>
				{children}
			</button>
		),
		IconFilter: () => <span>Filter</span>,
		IconFilterOff: () => <span>Clear</span>,
		IconSearch: () => <span>Search</span>,
	};
});

const baseFilters: ObjectiveFilters = {
	search: '',
	status: 'all',
	categoryId: null,
	sortBy: 'name',
	sortOrder: 'asc',
};

describe('CampaignObjectivesFilters', () => {
	const onFiltersChange = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders filters with defaults and no active badge', () => {
		renderWithProviders(
			<CampaignObjectivesFilters
				filters={baseFilters}
				onFiltersChange={onFiltersChange}
			/>
		);

		expect(
			screen.getByPlaceholderText('Search by name or description...')
		).toBeInTheDocument();
		expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
	});

	it('calls onFiltersChange when search changes', async () => {
		renderWithProviders(
			<CampaignObjectivesFilters
				filters={baseFilters}
				onFiltersChange={onFiltersChange}
			/>
		);

		fireEvent.change(
			screen.getByPlaceholderText('Search by name or description...'),
			{ target: { value: 'goal' } }
		);

		expect(onFiltersChange).toHaveBeenCalledWith({
			...baseFilters,
			search: 'goal',
		});
	});

	it('shows active badge and clears filters', async () => {
		const filtersWithStatus: ObjectiveFilters = {
			...baseFilters,
			status: 'active',
		};

		renderWithProviders(
			<CampaignObjectivesFilters
				filters={filtersWithStatus}
				onFiltersChange={onFiltersChange}
			/>
		);

		expect(screen.getByTestId('badge')).toHaveTextContent('1 active');

		await userEvent.click(screen.getByTestId('clear-action'));

		expect(onFiltersChange).toHaveBeenLastCalledWith(baseFilters);
	});

	it('changes select values', async () => {
		renderWithProviders(
			<CampaignObjectivesFilters
				filters={baseFilters}
				onFiltersChange={onFiltersChange}
			/>
		);

		await userEvent.selectOptions(screen.getByLabelText('Category'), '1');
		expect(onFiltersChange).toHaveBeenCalledWith({
			...baseFilters,
			categoryId: 1,
		});

		await userEvent.selectOptions(screen.getByLabelText('Status'), 'inactive');
		expect(onFiltersChange).toHaveBeenCalledWith({
			...baseFilters,
			status: 'inactive',
		});
	});
});
