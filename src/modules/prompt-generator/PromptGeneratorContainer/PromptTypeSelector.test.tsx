import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PromptTypeSelector } from './PromptTypeSelector';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock query hooks
vi.mock('~/queries/promptTypesQueries', () => ({
	useGetAllPromptTypes: vi.fn(),
}));

vi.mock('~/queries/promptCategoryQueries', () => ({
	useGetAllPromptCategories: vi.fn(),
}));

// Mock getIcon utility
vi.mock('~/utils/iconUtils', () => ({
	default: vi.fn(() => <div data-testid='icon' />),
}));

import { useGetAllPromptTypes } from '~/queries/promptTypesQueries';
import { useGetAllPromptCategories } from '~/queries/promptCategoryQueries';

describe('PromptTypeSelector', () => {
	const mockUseGetAllPromptTypes = vi.mocked(useGetAllPromptTypes);
	const mockUseGetAllPromptCategories = vi.mocked(useGetAllPromptCategories);
	const mockOnSelect = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows loader when categories or types are loading', () => {
		mockUseGetAllPromptCategories.mockReturnValue({
			data: [],
			isLoading: true,
			isFetching: false,
		} as any);

		mockUseGetAllPromptTypes.mockReturnValue({
			data: [],
			isLoading: false,
			isFetching: false,
		} as any);

		renderWithProviders(
			<PromptTypeSelector
				types={[]}
				selectedType={null}
				onSelect={mockOnSelect}
			/>
		);

		// Mantine Loader doesn't have role="progressbar", check for the loader element
		expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
	});

	it('renders categories by default and allows selecting a category to show types', async () => {
		const categories = [
			{ id: 1, name: 'Category 1', description: 'Desc 1', icon: 'icon1' },
		];
		const types = [
			{ id: 10, name: 'Type 1', description: 'Type Desc', icon: 'typeIcon' },
		];

		mockUseGetAllPromptCategories.mockReturnValue({
			data: categories,
			isLoading: false,
			isFetching: false,
		} as any);

		mockUseGetAllPromptTypes.mockReturnValue({
			data: types,
			isLoading: false,
			isFetching: false,
		} as any);

		renderWithProviders(
			<PromptTypeSelector
				types={[]}
				selectedType={null}
				onSelect={mockOnSelect}
			/>
		);

		// Initially shows categories
		expect(screen.getByText('Category 1')).toBeInTheDocument();

		// Click category
		const categoryCard = screen.getByRole('button', { name: /category 1/i });
		await userEvent.click(categoryCard);

		// Now shows types
		expect(screen.getByText('Type 1')).toBeInTheDocument();
	});

	it('clicking a type card calls onSelect with type id', async () => {
		const categories = [
			{ id: 1, name: 'Category 1', description: 'Desc 1', icon: 'icon1' },
		];
		const types = [
			{ id: 10, name: 'Type 1', description: 'Type Desc', icon: 'typeIcon' },
		];

		mockUseGetAllPromptCategories.mockReturnValue({
			data: categories,
			isLoading: false,
			isFetching: false,
		} as any);

		mockUseGetAllPromptTypes.mockReturnValue({
			data: types,
			isLoading: false,
			isFetching: false,
		} as any);

		renderWithProviders(
			<PromptTypeSelector
				types={[]}
				selectedType={null}
				onSelect={mockOnSelect}
			/>
		);

		// Select category first
		const categoryCard = screen.getByRole('button', { name: /category 1/i });
		await userEvent.click(categoryCard);

		// Click type
		const typeCard = screen.getByRole('button', { name: /type 1/i });
		await userEvent.click(typeCard);

		expect(mockOnSelect).toHaveBeenCalledWith(10);
	});

	it('supports keyboard selection with Enter and Space', async () => {
		const categories = [
			{ id: 1, name: 'Category 1', description: 'Desc 1', icon: 'icon1' },
		];
		const types = [
			{ id: 10, name: 'Type 1', description: 'Type Desc', icon: 'typeIcon' },
		];

		mockUseGetAllPromptCategories.mockReturnValue({
			data: categories,
			isLoading: false,
			isFetching: false,
		} as any);

		mockUseGetAllPromptTypes.mockReturnValue({
			data: types,
			isLoading: false,
			isFetching: false,
		} as any);

		renderWithProviders(
			<PromptTypeSelector
				types={[]}
				selectedType={null}
				onSelect={mockOnSelect}
			/>
		);

		// Select category
		const categoryCard = screen.getByRole('button', { name: /category 1/i });
		await userEvent.click(categoryCard);

		// Keyboard select type with Enter
		const typeCard = screen.getByRole('button', { name: /type 1/i });
		typeCard.focus();
		fireEvent.keyDown(typeCard, { key: 'Enter' });

		expect(mockOnSelect).toHaveBeenCalledWith(10);

		// Reset mock
		mockOnSelect.mockClear();

		// Keyboard select with Space
		fireEvent.keyDown(typeCard, { key: ' ' });
		expect(mockOnSelect).toHaveBeenCalledWith(10);
	});

	it('sets aria-pressed for selected type', async () => {
		const categories = [
			{ id: 1, name: 'Category 1', description: 'Desc 1', icon: 'icon1' },
		];
		const types = [
			{ id: 10, name: 'Type 1', description: 'Type Desc', icon: 'typeIcon' },
			{ id: 11, name: 'Type 2', description: 'Type Desc 2', icon: 'typeIcon2' },
		];

		mockUseGetAllPromptCategories.mockReturnValue({
			data: categories,
			isLoading: false,
			isFetching: false,
		} as any);

		mockUseGetAllPromptTypes.mockReturnValue({
			data: types,
			isLoading: false,
			isFetching: false,
		} as any);

		renderWithProviders(
			<PromptTypeSelector
				types={[]}
				selectedType={10}
				onSelect={mockOnSelect}
			/>
		);

		// Select category
		const categoryCard = screen.getByRole('button', { name: /category 1/i });
		await userEvent.click(categoryCard);

		// Check aria-pressed
		const typeCard = screen.getByRole('button', { name: /type 1/i });
		expect(typeCard).toHaveAttribute('aria-pressed', 'true');

		const typeCard2 = screen.getByRole('button', { name: /type 2/i });
		expect(typeCard2).toHaveAttribute('aria-pressed', 'false');
	});
});
