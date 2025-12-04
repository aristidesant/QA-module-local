import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import UserFormSkeleton from './UserFormSkeleton';

describe('UserFormSkeleton', () => {
	it('renders without crashing', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		expect(container.firstChild).toBeInTheDocument();
	});

	it('renders the form container with correct class', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const formElement = container.querySelector('[class*="form"]');
		expect(formElement).toBeInTheDocument();
	});

	it('renders body section', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const bodyElement = container.querySelector('[class*="body"]');
		expect(bodyElement).toBeInTheDocument();
	});

	it('renders content grid layout', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const gridElement = container.querySelector('[class*="contentGrid"]');
		expect(gridElement).toBeInTheDocument();
	});

	it('renders multiple skeleton elements', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const skeletons = container.querySelectorAll('[class*="mantine-Skeleton"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('renders section elements', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const sections = container.querySelectorAll('[class*="section"]');
		expect(sections.length).toBeGreaterThan(0);
	});

	it('renders form column for main content', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const formColumn = container.querySelector('[class*="formColumn"]');
		expect(formColumn).toBeInTheDocument();
	});

	it('renders meta header section', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const metaHeader = container.querySelector('[class*="metaHeader"]');
		expect(metaHeader).toBeInTheDocument();
	});

	it('renders actions section', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const actions = container.querySelector('[class*="actions"]');
		expect(actions).toBeInTheDocument();
	});

	it('renders password card skeleton', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const passwordCard = container.querySelector('[class*="passwordCard"]');
		expect(passwordCard).toBeInTheDocument();
	});

	it('renders security card skeleton', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const securityCard = container.querySelector('[class*="securityCard"]');
		expect(securityCard).toBeInTheDocument();
	});

	it('renders roles section', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const rolesSection = container.querySelector('[class*="rolesSection"]');
		expect(rolesSection).toBeInTheDocument();
	});

	it('renders row elements for form fields', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const rows = container.querySelectorAll('[class*="row"]');
		expect(rows.length).toBeGreaterThan(0);
	});

	it('renders section headers', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);
		const sectionHeaders = container.querySelectorAll(
			'[class*="sectionHeader"]'
		);
		expect(sectionHeaders.length).toBeGreaterThan(0);
	});

	it('matches expected structure layout', () => {
		const { container } = renderWithProviders(<UserFormSkeleton />);

		const form = container.querySelector('[class*="form"]');
		expect(form).toBeInTheDocument();

		const body = form?.querySelector('[class*="body"]');
		expect(body).toBeInTheDocument();

		const contentGrid = body?.querySelector('[class*="contentGrid"]');
		expect(contentGrid).toBeInTheDocument();
	});
});

export {};
