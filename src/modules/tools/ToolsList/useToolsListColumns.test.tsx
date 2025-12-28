import { renderHook as rtlRenderHook, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import useToolsListColumns from './useToolsListColumns';
import type { ToolModel } from '~/models/ToolModel';
import {
	renderWithProviders,
	TestProviders,
} from '~/test-utils/renderWithProviders';

const renderHook: typeof rtlRenderHook = (callback, options) =>
	rtlRenderHook(callback, { wrapper: TestProviders, ...options });

const renderWithProvider = (component: React.ReactNode) => {
	return renderWithProviders(<>{component}</>);
};

describe('useToolsListColumns', () => {
	const mockTool: ToolModel = {
		id: 1,
		name: 'Test Tool',
		description: 'A test tool description',
		status: 'active',
		createdAt: '2023-01-15T12:00:00Z',
		updatedAt: '2023-01-15T12:00:00Z',
		userId: 1,
		categoryId: 1,
		config: {
			accessInfo: {
				creatorName: 'John Doe',
			},
		},
	} as unknown as ToolModel;

	it('returns correct columns configuration', () => {
		const { result } = renderHook(() => useToolsListColumns());
		const columns = result.current;

		expect(columns).toHaveLength(4);
		expect(columns[0].header).toBe('Name');
		expect((columns[1] as any).header).toBe('Status'); // accessorKey columns might need casting or check
		expect(columns[2].header).toBe('Created by');
		expect(columns[3].header).toBe('Created');
	});

	it('renders name cell correctly', () => {
		const { result } = renderHook(() => useToolsListColumns());
		const columns = result.current;
		const NameCell = columns[0].cell as any;

		renderWithProvider(<NameCell row={{ original: mockTool }} />);

		expect(screen.getByText('Test Tool')).toBeInTheDocument();
		// Tooltip might not be visible immediately, but the icon should be if description exists
		// We can check if the description is in the document (Mantine Tooltip renders in portal usually, but here we check existence)
	});

	it('renders status cell correctly', () => {
		const { result } = renderHook(() => useToolsListColumns());
		const columns = result.current;
		const StatusCell = columns[1].cell as any;

		renderWithProvider(<StatusCell row={{ original: mockTool }} />);

		expect(screen.getByText('Active')).toBeInTheDocument();
	});

	it('renders creator cell correctly', () => {
		const { result } = renderHook(() => useToolsListColumns());
		const columns = result.current;
		const CreatorCell = columns[2].cell as any;

		renderWithProvider(<CreatorCell row={{ original: mockTool }} />);

		expect(screen.getByText('John Doe')).toBeInTheDocument();
	});

	it('renders created at cell correctly', () => {
		const { result } = renderHook(() => useToolsListColumns());
		const columns = result.current;
		const CreatedAtCell = columns[3].cell as any;

		renderWithProvider(<CreatedAtCell row={{ original: mockTool }} />);

		// Date formatting might depend on locale, but let's check for parts of the date
		expect(screen.getByText(/Jan 15, 2023/)).toBeInTheDocument();
	});
});
