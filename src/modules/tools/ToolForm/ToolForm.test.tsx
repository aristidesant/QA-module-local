import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ToolForm from './ToolForm';
import { notifications } from '@mantine/notifications';

// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Stable mock data
const MOCK_TOOL_DATA = {
	id: 1,
	name: 'Test Tool',
	description: 'Test Description',
	prompt: 'Test Prompt',
	identifier: 'test-tool',
	categoryId: 1,
	status: 'active',
	config: {
		id: 'config-1',
		toolConfig: {
			name: 'Test Tool',
			apiSchema: {
				url: 'https://example.com/api',
				method: 'POST',
				requestHeaders: { 'Content-Type': 'application/json' },
				pathParamsSchema: { id: 'ID parameter' },
				requestBodySchema: {
					required: ['name'],
					properties: {
						name: { type: 'string', description: 'User name' },
					},
				},
			},
		},
	},
};

// Mock queries
const mockCreateTool = vi.fn();
const mockUpdateTool = vi.fn();
const mockRefetchTool = vi.fn();

vi.mock('~/queries/toolQueries', () => ({
	useToolById: (id?: string | number) => ({
		data: id ? MOCK_TOOL_DATA : undefined,
		isLoading: false,
		error: null,
		refetch: mockRefetchTool,
	}),
	useCreateTool: () => ({
		mutateAsync: mockCreateTool,
		isPending: false,
	}),
	useUpdateTool: () => ({
		mutateAsync: mockUpdateTool,
		isPending: false,
	}),
}));

vi.mock('~/queries/toolCategoryQueries', () => ({
	useToolCategories: () => ({
		data: [
			{ id: 1, name: 'Category 1' },
			{ id: 2, name: 'Category 2' },
		],
		isLoading: false,
	}),
}));

describe('ToolForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders create form correctly', () => {
		renderWithProviders(<ToolForm />);
		expect(screen.getByText('Create New Tool')).toBeInTheDocument();
		expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
	});

	it('renders edit form correctly', async () => {
		renderWithProviders(<ToolForm toolId={1} />);
		expect(await screen.findByDisplayValue('Test Tool')).toBeInTheDocument();
		expect(screen.getByText('Edit Tool')).toBeInTheDocument();
	});

	it('navigates through sections', async () => {
		const user = userEvent.setup();
		renderWithProviders(<ToolForm />);

		const apiSection = screen.getByTestId('section-menu-api');
		await user.click(apiSection);
		expect(screen.getByLabelText(/Endpoint URL/i)).toBeInTheDocument();
	});

	it('displays validation errors', async () => {
		const { container } = renderWithProviders(<ToolForm />);

		// Use fireEvent.submit to force submission
		const form = container.querySelector('#tool-form');
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		fireEvent.submit(form!);

		await waitFor(
			() => {
				expect(screen.getByText('Name is required')).toBeInTheDocument();
				expect(screen.getByText('Description is required')).toBeInTheDocument();
				expect(screen.getByText('Category is required')).toBeInTheDocument();
			},
			{ timeout: 2000 }
		);

		// Check API section validation indicator in menu
		// Sometimes update is slightly delayed
		await waitFor(() => {
			const apiSectionMenu = screen.getByTestId('section-menu-api');
			// The error attribute is on a child status dot element
			const errorDot = apiSectionMenu.querySelector('[data-error="true"]');
			expect(errorDot).toBeInTheDocument();
		});
	});

	it('handles form submission for creation', async () => {
		const user = userEvent.setup();
		const onSuccess = vi.fn();
		renderWithProviders(<ToolForm onSuccess={onSuccess} categoryId={1} />);

		await user.type(screen.getByLabelText(/Name/i), 'New Tool');
		await user.type(screen.getByLabelText(/Description/i), 'Description');

		await user.click(screen.getByTestId('section-menu-api'));
		await user.type(
			screen.getByLabelText(/Endpoint URL/i),
			'https://api.test.com'
		);

		// Submit via click first, if fails use submit
		const submitButton = screen.getByTestId('submit-tool-btn');
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockCreateTool).toHaveBeenCalled();
		});
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Success',
				message: 'Tool created successfully!',
			})
		);
		expect(onSuccess).toHaveBeenCalled();
	});

	it('handles form submission for update', async () => {
		const user = userEvent.setup();
		const onSuccess = vi.fn();
		renderWithProviders(<ToolForm toolId={1} onSuccess={onSuccess} />);

		await screen.findByDisplayValue('Test Tool');

		await user.clear(screen.getByLabelText(/Name/i));
		await user.type(screen.getByLabelText(/Name/i), 'Updated Tool');

		const submitButton = screen.getByTestId('submit-tool-btn');
		await user.click(submitButton);

		await waitFor(() => {
			expect(mockUpdateTool).toHaveBeenCalled();
		});
		expect(notifications.show).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Success',
				message: 'Tool updated successfully!',
			})
		);
		expect(onSuccess).toHaveBeenCalled();
	});

	it('manages headers', async () => {
		const user = userEvent.setup();
		renderWithProviders(<ToolForm />);

		await user.click(screen.getByTestId('section-menu-headers'));
		await user.click(screen.getByText('Add Header'));

		const keyInput = screen.getByPlaceholderText('Header name');
		await user.type(keyInput, 'Authorization');

		expect(keyInput).toHaveValue('Authorization');

		const removeBtn = screen.getByTestId('remove-header-btn-0');
		await user.click(removeBtn);

		await waitFor(() => {
			expect(
				screen.queryByPlaceholderText('Header name')
			).not.toBeInTheDocument();
		});
	});

	it('manages parameters', async () => {
		const user = userEvent.setup();
		renderWithProviders(<ToolForm />);

		await user.click(screen.getByTestId('section-menu-parameters'));

		const addBtns = screen.getAllByText('Add');
		const addPathBtn = addBtns[0];
		await user.click(addPathBtn);

		const pKey = screen.getByPlaceholderText('Parameter name');
		await user.type(pKey, 'id');
		expect(pKey).toHaveValue('id');

		const removeBtn = screen.getByTestId('remove-path-param-btn-0');
		await user.click(removeBtn);

		await waitFor(() => {
			expect(
				screen.queryByPlaceholderText('Parameter name')
			).not.toBeInTheDocument();
		});
	});

	it('shows api body section only for appropriate methods', async () => {
		renderWithProviders(<ToolForm toolId={1} />);
		await waitFor(() => screen.getByTestId('section-menu-body'));
		expect(screen.getByTestId('section-menu-body')).toBeInTheDocument();
	});

	it('handles calling onCancel', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		renderWithProviders(<ToolForm onCancel={onCancel} />);

		const cancelButton = screen.getByText('Cancel');
		await user.click(cancelButton);
		expect(onCancel).toHaveBeenCalled();
	});
});
