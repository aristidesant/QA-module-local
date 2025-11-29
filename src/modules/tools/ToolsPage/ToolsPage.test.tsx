import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ToolsPage from './ToolsPage';
import useToolsStore from '~/stores/toolsStore';
import { MantineProvider } from '@mantine/core';

// Mock child components
vi.mock('../ToolsList/ToolsCategories', () => ({
	default: () => <div data-testid='tools-categories'>ToolsCategories</div>,
}));

vi.mock('../ToolsList', () => ({
	default: () => <div data-testid='tools-list'>ToolsList</div>,
}));

// Mock ContentContainer
vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({ title, description, rightSection, children }: any) => (
		<div data-testid='content-container'>
			<h1>{title}</h1>
			<p>{description}</p>
			<div data-testid='right-section'>{rightSection}</div>
			{children}
		</div>
	),
}));

// Mock store
vi.mock('~/stores/toolsStore', () => ({
	default: vi.fn(),
}));

const renderWithProvider = (component: React.ReactNode) => {
	return render(<MantineProvider>{component}</MantineProvider>);
};

describe('ToolsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders correctly with default state', () => {
		// Mock store return value
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			rightComponent: null,
		});

		renderWithProvider(<ToolsPage />);

		expect(screen.getByTestId('content-container')).toBeInTheDocument();
		expect(screen.getByText('Tools')).toBeInTheDocument();
		expect(
			screen.getByText('Manage your tools and integrations')
		).toBeInTheDocument();
		expect(screen.getByTestId('tools-categories')).toBeInTheDocument();
		expect(screen.getByTestId('tools-list')).toBeInTheDocument();
		expect(screen.getByTestId('right-section')).toBeEmptyDOMElement();
	});

	it('renders rightComponent when present in store', () => {
		const MockRightComponent = (
			<div data-testid='mock-right-component'>Right Component</div>
		);

		// Mock store return value with rightComponent
		(useToolsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			rightComponent: MockRightComponent,
		});

		renderWithProvider(<ToolsPage />);

		expect(screen.getByTestId('right-section')).toContainElement(
			screen.getByTestId('mock-right-component')
		);
	});
});
