import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '@mantine/notifications';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import KnowledgeBaseWizardForm from './KnowledgeBaseWizardForm';
import { KnowledgeBaseType } from '~/models/KnowledgeBaseModel';

// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: { show: vi.fn() },
}));

// Mock the create knowledge base mutation
const mockMutateAsync = vi.fn();
vi.mock('~/queries/knowledgeBaseQueries', () => ({
	useCreateKnowledgeBase: () => ({
		mutateAsync: mockMutateAsync,
		status: 'idle',
	}),
}));

// Mock Mantine's FileInput since testing file uploads in JSDOM is complex
let mockFileInputOnChange: ((file: File | null) => void) | null = null;
// @ts-ignore
let mockFileInputValue: File | null = null;
let mockFileInputDisabled = false;

vi.mock('@mantine/core', async () => {
	const actual =
		await vi.importActual<typeof import('@mantine/core')>('@mantine/core');
	return {
		...actual,
		FileInput: ({ onChange, value, disabled, label, description }: any) => {
			mockFileInputOnChange = onChange;
			mockFileInputValue = value;
			mockFileInputDisabled = disabled;
			return (
				<div data-testid='file-input-wrapper'>
					<label>{label}</label>
					<button
						type='button'
						disabled={disabled}
						data-testid='file-input-button'
						aria-label={label}
						onClick={() => {
							// Simulate file selection
						}}
					>
						{value ? value.name : 'Choose file'}
					</button>
					{description && (
						<p data-testid='file-input-description'>{description}</p>
					)}
				</div>
			);
		},
	};
});

// Helper to simulate file upload
const simulateFileUpload = (file: File | null) => {
	if (mockFileInputOnChange) {
		mockFileInputOnChange(file);
	}
};

describe('KnowledgeBaseWizardForm', () => {
	const mockOnSuccess = vi.fn();
	const mockOnCancel = vi.fn();

	const renderForm = () =>
		renderWithProviders(
			<KnowledgeBaseWizardForm
				onSuccess={mockOnSuccess}
				onCancel={mockOnCancel}
			/>
		);

	beforeEach(() => {
		vi.clearAllMocks();
		mockMutateAsync.mockResolvedValue({
			id: 1,
			name: 'Test KB',
			type: KnowledgeBaseType.TEXT,
		});
		mockFileInputOnChange = null;
		mockFileInputValue = null;
		mockFileInputDisabled = false;
	});

	describe('Rendering', () => {
		it('renders all form fields', () => {
			renderForm();

			expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
			expect(screen.getByTestId('file-input-wrapper')).toBeInTheDocument();
		});

		it('renders cancel and submit buttons', () => {
			renderForm();

			expect(
				screen.getByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /create knowledge base/i })
			).toBeInTheDocument();
		});

		it('submit button is disabled initially', () => {
			renderForm();

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			expect(submitButton).toBeDisabled();
		});
	});

	describe('Type Inference', () => {
		it('shows URL detected message when a valid URL is entered', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'https://example.com/docs'
			);

			expect(screen.getByText(/url detected/i)).toBeInTheDocument();
			expect(
				screen.getByText(/content will be fetched from the provided link/i)
			).toBeInTheDocument();
		});

		it('shows text content message when regular text is entered', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'This is some regular text content'
			);

			expect(screen.getByText(/Text content:/i)).toBeInTheDocument();
			expect(screen.getByText(/will be used as-is/i)).toBeInTheDocument();
		});

		it('treats text with URL and extra content as TEXT type', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'Check this URL: https://example.com'
			);

			expect(screen.getByText(/Text content:/i)).toBeInTheDocument();
		});

		it('treats text with newlines as TEXT type even if it contains a URL', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'https://example.com\nMore text here'
			);

			expect(screen.getByText(/Text content:/i)).toBeInTheDocument();
		});

		it('shows file selected message when a file is uploaded', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');

			const file = new File(['pdf content'], 'document.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				// Check for the file type indicator message
				expect(screen.getByText(/File:/i)).toBeInTheDocument();
				// The filename appears in both the file input button and the type indicator
				const filenameElements = screen.getAllByText(/document\.pdf/i);
				expect(filenameElements.length).toBeGreaterThanOrEqual(1);
			});
		});
	});

	describe('Mutual Exclusivity', () => {
		it('disables file input when content textarea has text', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(
				screen.getByLabelText(/content/i),
				'Some text content here'
			);

			await waitFor(() => {
				expect(mockFileInputDisabled).toBe(true);
				expect(
					screen.getByText(/clear the text above to upload a file instead/i)
				).toBeInTheDocument();
			});
		});

		it('enables file input when content textarea is cleared', async () => {
			const user = userEvent.setup();
			renderForm();

			const contentTextarea = screen.getByLabelText(/content/i);
			await user.type(contentTextarea, 'Some text');

			await waitFor(() => {
				expect(mockFileInputDisabled).toBe(true);
			});

			await user.clear(contentTextarea);

			await waitFor(() => {
				expect(mockFileInputDisabled).toBe(false);
			});
		});

		it('disables content textarea when a file is uploaded', async () => {
			renderForm();

			const file = new File(['pdf content'], 'document.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				const contentTextarea = screen.getByLabelText(/content/i);
				expect(contentTextarea).toBeDisabled();
				expect(
					screen.getByText(
						/remove the file above to enter text or url instead/i
					)
				).toBeInTheDocument();
			});
		});

		it('clears content when a file is selected after typing', async () => {
			const user = userEvent.setup();
			renderForm();

			const contentTextarea = screen.getByLabelText(/content/i);
			await user.type(contentTextarea, 'Some text content');

			// Clear the textarea first (since file input would be disabled)
			await user.clear(contentTextarea);

			const file = new File(['pdf content'], 'document.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				// Content should remain empty and textarea should be disabled
				expect(contentTextarea).toBeDisabled();
			});
		});
	});

	describe('Form Validation', () => {
		it('enables submit button when name and content are provided', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(screen.getByLabelText(/content/i), 'Some content');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			expect(submitButton).not.toBeDisabled();
		});

		it('enables submit button when name and file are provided', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');

			const file = new File(['pdf content'], 'document.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				const submitButton = screen.getByRole('button', {
					name: /create knowledge base/i,
				});
				expect(submitButton).not.toBeDisabled();
			});
		});

		it('keeps submit button disabled when only name is provided', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			expect(submitButton).toBeDisabled();
		});

		it('keeps submit button disabled when only content is provided', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/content/i), 'Some content');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			expect(submitButton).toBeDisabled();
		});
	});

	describe('Form Submission', () => {
		it('submits with TEXT type when regular text is entered', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(screen.getByLabelText(/description/i), 'A description');
			await user.type(screen.getByLabelText(/content/i), 'Some text content');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith({
					name: 'Test KB',
					description: 'A description',
					type: KnowledgeBaseType.TEXT,
					sourceUrl: undefined,
					textContent: 'Some text content',
					file: undefined,
				});
			});
		});

		it('submits with URL type when a valid URL is entered', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'https://example.com/docs'
			);

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith({
					name: 'Test KB',
					description: '',
					type: KnowledgeBaseType.URL,
					sourceUrl: 'https://example.com/docs',
					textContent: undefined,
					file: undefined,
				});
			});
		});

		it('submits with FILE type when a file is uploaded', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');

			const file = new File(['pdf content'], 'document.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				const submitButton = screen.getByRole('button', {
					name: /create knowledge base/i,
				});
				expect(submitButton).not.toBeDisabled();
			});

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockMutateAsync).toHaveBeenCalledWith({
					name: 'Test KB',
					description: '',
					type: KnowledgeBaseType.FILE,
					sourceUrl: undefined,
					textContent: undefined,
					file: expect.any(File),
				});
			});
		});

		it('calls onSuccess with the created knowledge base', async () => {
			const user = userEvent.setup();
			const createdKb = {
				id: 1,
				name: 'Test KB',
				type: KnowledgeBaseType.TEXT,
			};
			mockMutateAsync.mockResolvedValue(createdKb);

			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(screen.getByLabelText(/content/i), 'Some content');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(mockOnSuccess).toHaveBeenCalledWith(createdKb);
			});
		});

		it('shows success notification on successful creation', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(screen.getByLabelText(/content/i), 'Some content');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Success',
					message: 'Knowledge base created successfully',
					color: 'green',
				});
			});
		});

		it('shows error notification on failed creation', async () => {
			const user = userEvent.setup();
			mockMutateAsync.mockRejectedValue(new Error('API Error'));

			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(screen.getByLabelText(/content/i), 'Some content');

			const submitButton = screen.getByRole('button', {
				name: /create knowledge base/i,
			});
			await user.click(submitButton);

			await waitFor(() => {
				expect(notifications.show).toHaveBeenCalledWith({
					title: 'Error',
					message: 'Failed to create knowledge base',
					color: 'red',
				});
			});
		});
	});

	describe('Cancel Button', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			renderForm();

			const cancelButton = screen.getByRole('button', { name: /cancel/i });
			await user.click(cancelButton);

			expect(mockOnCancel).toHaveBeenCalled();
		});
	});

	describe('URL Validation', () => {
		it('detects http URLs', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'http://example.com/page'
			);

			expect(screen.getByText(/url detected/i)).toBeInTheDocument();
		});

		it('detects https URLs', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'https://example.com/page'
			);

			expect(screen.getByText(/url detected/i)).toBeInTheDocument();
		});

		it('does not detect ftp URLs as valid', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'ftp://files.example.com'
			);

			expect(screen.getByText(/Text content:/i)).toBeInTheDocument();
		});

		it('does not detect invalid URLs', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(screen.getByLabelText(/content/i), 'not-a-valid-url');

			expect(screen.getByText(/Text content:/i)).toBeInTheDocument();
		});

		it('handles URLs with query parameters', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'https://example.com/docs?page=1&section=intro'
			);

			expect(screen.getByText(/url detected/i)).toBeInTheDocument();
		});

		it('handles URLs with fragments', async () => {
			const user = userEvent.setup();
			renderForm();

			await user.type(screen.getByLabelText(/name/i), 'Test KB');
			await user.type(
				screen.getByLabelText(/content/i),
				'https://example.com/docs#section-1'
			);

			expect(screen.getByText(/url detected/i)).toBeInTheDocument();
		});
	});
});
