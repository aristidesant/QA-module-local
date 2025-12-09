import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { PromptInputForm } from './PromptInputForm';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

// Mock query hook
vi.mock('~/queries/promptFormQueries', () => ({
	useGetAllPromptForms: vi.fn(),
}));

import { useGetAllPromptForms } from '~/queries/promptFormQueries';

describe('PromptInputForm', () => {
	const mockUseGetAllPromptForms = vi.mocked(useGetAllPromptForms);
	const mockForm = {
		getInputProps: vi.fn((name: string) => ({
			name,
			value: '',
			onChange: vi.fn(),
			error: null,
		})),
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders loader when loading', () => {
		mockUseGetAllPromptForms.mockReturnValue({
			data: [],
			isLoading: true,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		expect(screen.getByText('Loading form definitions...')).toBeInTheDocument();
		expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument();
	});

	it('renders error UI and retry button when error', async () => {
		const mockRefetch = vi.fn();
		mockUseGetAllPromptForms.mockReturnValue({
			data: [],
			isLoading: false,
			isError: true,
			error: new Error('Test error'),
			refetch: mockRefetch,
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		expect(screen.getByText('Error loading forms')).toBeInTheDocument();
		expect(screen.getByText('Test error')).toBeInTheDocument();

		const retryButton = screen.getByRole('button', { name: /retry/i });
		expect(retryButton).toBeInTheDocument();

		await userEvent.click(retryButton);
		expect(mockRefetch).toHaveBeenCalled();
	});

	it('renders no forms available when array is empty', () => {
		mockUseGetAllPromptForms.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		expect(screen.getByText('No forms available')).toBeInTheDocument();
		expect(
			screen.getByText(
				'No form definitions found for this type. Please try another type or check back later.'
			)
		).toBeInTheDocument();
	});

	it('auto-selects single form and shows message', () => {
		const forms = [
			{
				id: 1,
				name: 'Single Form',
				type: { name: 'Type Name' },
				form: {
					fields: [
						{ name: 'field1', label: 'Field 1', placeholder: 'Enter value' },
					],
				},
			},
		];

		mockUseGetAllPromptForms.mockReturnValue({
			data: forms,
			isLoading: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		expect(
			screen.getByText(/One form has been automatically selected/)
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', { name: 'Single Form' })
		).toBeInTheDocument();
		expect(screen.getByLabelText('Field 1')).toBeInTheDocument();
	});

	it('renders segmented control for multiple forms and allows selection', async () => {
		const forms = [
			{
				id: 1,
				name: 'Form 1',
				type: { name: 'Type 1' },
				form: { fields: [{ name: 'field1', label: 'Field 1' }] },
			},
			{
				id: 2,
				name: 'Form 2',
				type: { name: 'Type 2' },
				form: { fields: [{ name: 'field2', label: 'Field 2' }] },
			},
		];

		mockUseGetAllPromptForms.mockReturnValue({
			data: forms,
			isLoading: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		// Segmented control should be present
		expect(screen.getByText('Form 1')).toBeInTheDocument();
		expect(screen.getByText('Form 2')).toBeInTheDocument();

		// Initially no form selected, shows "Please select a form"
		expect(
			screen.getByText('Please select a form to continue')
		).toBeInTheDocument();

		// Select Form 2
		const form2Segment = screen.getByText('Form 2');
		await userEvent.click(form2Segment);

		expect(screen.getByRole('heading', { name: 'Form 2' })).toBeInTheDocument();
		expect(screen.getByLabelText('Field 2')).toBeInTheDocument();
	});

	it('renders form fields as textareas with correct props', () => {
		const forms = [
			{
				id: 1,
				name: 'Test Form',
				type: { name: 'Type Name' },
				form: {
					fields: [
						{
							name: 'field1',
							label: 'Test Field',
							placeholder: 'Enter text',
							required: true,
							description: 'Field description',
						},
					],
				},
			},
		];

		mockUseGetAllPromptForms.mockReturnValue({
			data: forms,
			isLoading: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		const textarea = screen.getByLabelText(/Test Field/);
		expect(textarea).toBeInTheDocument();
		expect(textarea).toHaveAttribute('placeholder', 'Enter text');
		expect(textarea).toHaveAttribute('required');

		expect(screen.getByText('Field description')).toBeInTheDocument();

		// Check getInputProps was called
		expect(mockForm.getInputProps).toHaveBeenCalledWith('field1');
	});

	it('renders message when form has no fields', () => {
		const forms = [
			{
				id: 1,
				name: 'Empty Form',
				type: { name: 'Type Name' },
				form: { fields: [] },
			},
		];

		mockUseGetAllPromptForms.mockReturnValue({
			data: forms,
			isLoading: false,
			isError: false,
			error: null,
			refetch: vi.fn(),
		} as any);

		renderWithProviders(<PromptInputForm form={mockForm as any} type={1} />);

		expect(
			screen.getByText('This form has no input fields defined.')
		).toBeInTheDocument();
	});
});
