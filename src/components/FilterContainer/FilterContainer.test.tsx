import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FilterContainer from './FilterContainer';

describe('FilterContainer', () => {
	describe('Rendering', () => {
		it('renders children correctly', () => {
			render(
				<FilterContainer>
					<span data-testid='child-element'>Filter content</span>
				</FilterContainer>
			);

			expect(screen.getByTestId('child-element')).toBeInTheDocument();
			expect(screen.getByText('Filter content')).toBeInTheDocument();
		});

		it('renders multiple children', () => {
			render(
				<FilterContainer>
					<input data-testid='search-input' placeholder='Search' />
					<button data-testid='filter-button'>Filter</button>
					<select data-testid='sort-select'>
						<option>Sort by</option>
					</select>
				</FilterContainer>
			);

			expect(screen.getByTestId('search-input')).toBeInTheDocument();
			expect(screen.getByTestId('filter-button')).toBeInTheDocument();
			expect(screen.getByTestId('sort-select')).toBeInTheDocument();
		});

		it('applies wrapper class', () => {
			const { container } = render(
				<FilterContainer>
					<span>Content</span>
				</FilterContainer>
			);

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper.className).toContain('filtersWrapper');
		});
	});
});
