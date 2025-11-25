import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import KnowledgeBaseForm from './KnowledgeBaseForm';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';

// Mock dependencies
vi.mock('~/queries/knowledgeBaseQueries', () => ({
	useCreateKnowledgeBase: vi.fn(),
	useUpdateKnowledgeBase: vi.fn(),
	useKnowledgeBase: vi.fn(),
}));

vi.mock('../store/knowledgeBaseStore', () => ({
	default: vi.fn(),
}));

// Mock RightSectionCard
vi.mock('~/components/RightSectionCard/RightSectionCard', () => ({
	default: ({
		children,
		title,
		rightSection,
	}: {
		children: React.ReactNode;
		title: string;
		rightSection?: React.ReactNode;
	}) => (
		<div data-testid='right-section-card'>
			<h1>{title}</h1>
			{rightSection && <div data-testid='header-status'>{rightSection}</div>}
			{children}
		</div>
	),
}));

// Mock FormSelect
vi.mock('~/components/ui/FormSelect/FormSelect', () => ({
	default: ({ label, onChange, data, value, error, ...props }: any) => (
		<div>
			<label>{label}</label>
			<select
				data-testid='form-select'
				onChange={(e) => onChange(e.target.value)}
				value={value}
				{...props}
			>
				<option value=''>Select</option>
				{data.map((item: any) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
			{error && <div data-testid='select-error'>{error}</div>}
		</div>
	),
}));

// Mock FileInput
vi.mock('@mantine/core', async (importOriginal) => {
	const actual: any = await importOriginal();
	return {
		...actual,
		FileInput: ({
			onChange,
			error,
			value,
			leftSection,
			rightSection,
			clearable,
			label,
			description,
			...props
		}: any) => (
			<div data-testid='file-input-wrapper'>
				{label && <label>{label}</label>}
				<input
					data-testid='file-input'
					type='file'
					onChange={(e) => onChange(e.target.files?.[0] || null)}
					{...props}
				/>
				{description && <span>{description}</span>}
				{error && <div data-testid='file-error'>{error}</div>}
			</div>
		),
	};
});

import {
	useCreateKnowledgeBase,
	useUpdateKnowledgeBase,
	useKnowledgeBase,
} from '~/queries/knowledgeBaseQueries';
import useKnowledgeBaseStore from '../store/knowledgeBaseStore';

describe('KnowledgeBaseForm', () => {
	const mockCreateMutateAsync = vi.fn();
	const mockUpdateMutateAsync = vi.fn();
	const mockClearRight = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();

		(useCreateKnowledgeBase as any).mockReturnValue({
			mutateAsync: mockCreateMutateAsync,
			status: 'idle',
			error: null,
		});

		(useUpdateKnowledgeBase as any).mockReturnValue({
			mutateAsync: mockUpdateMutateAsync,
			status: 'idle',
			error: null,
		});

		(useKnowledgeBase as any).mockReturnValue({
			data: null,
			isLoading: false,
		});

		(useKnowledgeBaseStore as any).mockImplementation(() => mockClearRight);
	});

	const renderComponent = (props = {}) => {
		return render(
			<MantineProvider>
				<KnowledgeBaseForm {...props} />
			</MantineProvider>
		);
	};

	describe('Rendering', () => {
		it('renders the form with basic fields', () => {
			renderComponent();
			expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
			expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
			expect(screen.getByText(/Type/i)).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /Cancel/i })
			).toBeInTheDocument();
		});

		it('shows correct status badge for new form', () => {
			renderComponent();
			const status = screen.getByTestId('header-status');
			expect(status).toHaveTextContent('INACTIVE');
		});
	});

	describe('Validation', () => {
		it('validates required name', async () => {
			renderComponent();
			const saveButton = screen.getByRole('button', { name: /Save/i });

			// Name is required, so button should be disabled initially if touched or we can check error
			// The form validation runs on change/blur.
			const nameInput = screen.getByLabelText(/Name/i);
			fireEvent.focus(nameInput);
			fireEvent.blur(nameInput);

			expect(await screen.findByText('Name is required.')).toBeInTheDocument();
			expect(saveButton).toBeDisabled();
		});

		it('validates type selection', async () => {
			renderComponent();
			const nameInput = screen.getByLabelText(/Name/i);
			fireEvent.change(nameInput, { target: { value: 'Test' } });

			// Type is empty initially
			const typeSelect = screen.getByTestId('form-select');
			fireEvent.focus(typeSelect);
			fireEvent.blur(typeSelect); // Trigger validation if possible, or submit

			// Since FormSelect is mocked, we might not trigger blur easily on the select element itself in a way that mantine-form catches if not wired perfectly in mock.
			// But we can try submitting.

			// Actually, let's just check if button is disabled when type is empty
			const saveButton = screen.getByRole('button', { name: /Save/i });
			expect(saveButton).toBeDisabled();
		});

		it('validates URL format for URL type', async () => {
			renderComponent();
			const nameInput = screen.getByLabelText(/Name/i);
			fireEvent.change(nameInput, { target: { value: 'Test' } });

			const typeSelect = screen.getByTestId('form-select');
			fireEvent.change(typeSelect, {
				target: { value: KnowledgeBaseType.URL },
			});

			const urlInput = screen.getByLabelText(/Source URL/i);
			fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
			fireEvent.blur(urlInput);

			expect(await screen.findByText(/Enter a valid URL/i)).toBeInTheDocument();
		});

		it('validates file requirement for FILE type', async () => {
			renderComponent();
			const nameInput = screen.getByLabelText(/Name/i);
			fireEvent.change(nameInput, { target: { value: 'Test' } });

			const typeSelect = screen.getByTestId('form-select');
			fireEvent.change(typeSelect, {
				target: { value: KnowledgeBaseType.FILE },
			});

			// No file selected
			const saveButton = screen.getByRole('button', { name: /Save/i });
			expect(saveButton).toBeDisabled();

			// To trigger error message we might need to touch the field or submit (but submit is disabled)
			// Mantine form validation usually runs on change.
			// Let's try to set a file and then remove it to trigger validation?
			// Or just check that we can't save.
		});

		it('validates text content for TEXT type', async () => {
			renderComponent();
			const nameInput = screen.getByLabelText(/Name/i);
			fireEvent.change(nameInput, { target: { value: 'Test' } });

			const typeSelect = screen.getByTestId('form-select');
			fireEvent.change(typeSelect, {
				target: { value: KnowledgeBaseType.TEXT },
			});

			const textArea = screen.getByLabelText(/Text Content/i);
			fireEvent.change(textArea, { target: { value: '   ' } }); // Empty/whitespace
			fireEvent.blur(textArea);

			expect(
				await screen.findByText(/Add text or upload/i)
			).toBeInTheDocument();
		});
	});

	describe('Interactions', () => {
		it('handles URL type submission', async () => {
			renderComponent();

			fireEvent.change(screen.getByLabelText(/Name/i), {
				target: { value: 'URL KB' },
			});
			fireEvent.change(screen.getByTestId('form-select'), {
				target: { value: KnowledgeBaseType.URL },
			});
			fireEvent.change(screen.getByLabelText(/Source URL/i), {
				target: { value: 'https://google.com' },
			});

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'URL KB',
					description: '',
					type: KnowledgeBaseType.URL,
					sourceUrl: 'https://google.com',
					textContent: undefined,
					file: undefined,
				});
			});
			expect(mockClearRight).toHaveBeenCalled();
		});

		it('handles Text type submission', async () => {
			renderComponent();

			fireEvent.change(screen.getByLabelText(/Name/i), {
				target: { value: 'Text KB' },
			});
			fireEvent.change(screen.getByTestId('form-select'), {
				target: { value: KnowledgeBaseType.TEXT },
			});
			fireEvent.change(screen.getByLabelText(/Text Content/i), {
				target: { value: 'Some content' },
			});

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'Text KB',
					description: '',
					type: KnowledgeBaseType.TEXT,
					sourceUrl: undefined,
					textContent: 'Some content',
					file: undefined,
				});
			});
		});

		it('handles File type submission', async () => {
			renderComponent();

			fireEvent.change(screen.getByLabelText(/Name/i), {
				target: { value: 'File KB' },
			});
			fireEvent.change(screen.getByTestId('form-select'), {
				target: { value: KnowledgeBaseType.FILE },
			});

			const file = new File(['dummy content'], 'test.pdf', {
				type: 'application/pdf',
			});
			const fileInput = screen.getByTestId('file-input');

			fireEvent.change(fileInput, { target: { files: [file] } });

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'File KB',
					description: '',
					type: KnowledgeBaseType.FILE,
					sourceUrl: undefined,
					textContent: undefined,
					file: file,
				});
			});
		});

		it('clears right section on cancel', () => {
			renderComponent();
			fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
			expect(mockClearRight).toHaveBeenCalled();
		});
	});

	describe('Edit Mode', () => {
		const mockKB = {
			id: 123,
			name: 'Existing KB',
			description: 'Desc',
			type: KnowledgeBaseType.URL,
			sourceUrl: 'https://existing.com',
			textContent: '',
			file: null,
			status: 'ACTIVE',
		};

		beforeEach(() => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockKB,
				isLoading: false,
			});
		});

		it('populates form with existing data', () => {
			renderComponent({ id: 123 });

			expect(screen.getByLabelText(/Name/i)).toHaveValue('Existing KB');
			expect(screen.getByLabelText(/Description/i)).toHaveValue('Desc');
			expect(screen.getByLabelText(/Source URL/i)).toHaveValue(
				'https://existing.com'
			);
			expect(screen.getByTestId('form-select')).toHaveValue(
				KnowledgeBaseType.URL
			);
		});

		it('calls update mutation on save', async () => {
			renderComponent({ id: 123 });

			const nameInput = screen.getByLabelText(/Name/i);
			fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
					id: 123,
					data: expect.objectContaining({
						name: 'Updated Name',
						type: KnowledgeBaseType.URL,
					}),
				});
			});
		});

		it('shows correct status for existing KB', () => {
			renderComponent({ id: 123 });
			const status = screen.getByTestId('header-status');
			expect(status).toHaveTextContent('ACTIVE');
		});
	});

	describe('Error Handling', () => {
		it('displays mutation error', async () => {
			const errorMsg = 'Failed to create';
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'idle',
				error: new Error(errorMsg),
			});

			renderComponent();
			// We need to force a re-render or just check if the error prop is used.
			// The component uses `createMutation.error` to derive `mutationError`.
			// If we render with the error already present (simulating after a failed submission):
			expect(screen.getByText(errorMsg)).toBeInTheDocument();
		});
	});
});
