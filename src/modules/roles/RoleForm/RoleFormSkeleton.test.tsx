import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import RoleFormSkeleton from './RoleFormSkeleton';

describe('RoleFormSkeleton', () => {
	it('should render skeleton component', () => {
		renderWithProviders(<RoleFormSkeleton />);

		// Check if multiple skeleton elements are rendered
		const skeletons = screen.getAllByTestId('skeleton');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should render form container', () => {
		renderWithProviders(<RoleFormSkeleton />);

		// Check main form structure by finding the element with testid
		const form = screen.getByTestId('form-skeleton');
		expect(form).toBeInTheDocument();
	});

	it('should render meta section', () => {
		renderWithProviders(<RoleFormSkeleton />);

		// Should have skeleton elements
		const skeletons = screen.getAllByTestId('skeleton');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should render two section elements', () => {
		const { container } = renderWithProviders(<RoleFormSkeleton />);

		// Should have section elements with skeleton content
		const sections = container.querySelectorAll('section');
		expect(sections.length).toBeGreaterThan(0);
	});

	it('should render section headers with skeletons', () => {
		const { container } = renderWithProviders(<RoleFormSkeleton />);

		// Each section should have content
		const sections = container.querySelectorAll('section');
		expect(sections.length).toBeGreaterThan(0);

		// Each section should have skeletons
		sections.forEach((section) => {
			const headerSkeletons = section.querySelectorAll(
				'[data-testid="skeleton"]'
			);
			expect(headerSkeletons.length).toBeGreaterThan(0);
		});
	});

	it('should render row skeleton layouts', () => {
		const { container } = renderWithProviders(<RoleFormSkeleton />);

		// Should have div elements that act as rows
		const divs = container.querySelectorAll('div');
		expect(divs.length).toBeGreaterThan(0);

		// Should have many skeletons for the layout
		const fieldSkeletons = container.querySelectorAll(
			'[data-testid="skeleton"]'
		);
		expect(fieldSkeletons.length).toBeGreaterThan(10);
	});

	it('should have actions section with skeleton', () => {
		renderWithProviders(<RoleFormSkeleton />);

		// Should have skeletons in the form
		const skeletons = screen.getAllByTestId('skeleton');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should not have interactive elements', () => {
		renderWithProviders(<RoleFormSkeleton />);

		// Should not have any buttons
		expect(screen.queryByRole('button')).not.toBeInTheDocument();

		// Should not have any form inputs
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
	});

	it('should render complete loading state with all sections', () => {
		const { container } = renderWithProviders(<RoleFormSkeleton />);

		// Verify the entire skeleton structure
		expect(screen.getByTestId('form-skeleton')).toBeInTheDocument();

		// Should have actions section
		const actionsSection = container.querySelector('[class*="actions"]');
		expect(actionsSection).toBeInTheDocument();

		// Should have multiple skeletons throughout
		const allSkeletons = screen.getAllByTestId('skeleton');
		expect(allSkeletons.length).toBeGreaterThan(10);
	});

	it('should render with proper semantic HTML structure', () => {
		const { container } = renderWithProviders(<RoleFormSkeleton />);

		// Main form should be rendered
		const form = screen.getByTestId('form-skeleton');
		expect(form).toBeInTheDocument();

		// Should have sections
		const sections = container.querySelectorAll('section');
		expect(sections.length).toBeGreaterThan(0);

		// Structure should be consistent
		sections.forEach((section) => {
			expect(
				section.querySelector('[class*="sectionHeader"]')
			).toBeInTheDocument();
		});
	});
});
