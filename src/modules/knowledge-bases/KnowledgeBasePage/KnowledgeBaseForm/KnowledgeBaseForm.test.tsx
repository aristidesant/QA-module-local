import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import userEvent from '@testing-library/user-event';
import KnowledgeBaseForm, {
	isValidUrl,
	inferType,
	normalizeUrl,
} from './KnowledgeBaseForm';
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

// Mock FileInput - Mantine's FileInput renders as a button, not a native input
// We need a custom mock that allows programmatic file selection
let mockOnChange: ((file: File | null) => void) | null = null;

vi.mock('@mantine/core', async (importOriginal) => {
	const actual: any = await importOriginal();
	return {
		...actual,
		FileInput: ({
			onChange,
			error,
			value,
			label,
			description,
			disabled,
		}: any) => {
			// Store onChange for test access
			mockOnChange = onChange;
			return (
				<div data-testid='file-input-wrapper'>
					{label && <label htmlFor='mock-file-input'>{label}</label>}
					<button
						id='mock-file-input'
						type='button'
						data-testid='file-input'
						onClick={() => {}}
						disabled={disabled}
						aria-disabled={disabled}
					>
						{value ? value.name : 'Select file'}
					</button>
					{description && (
						<span data-testid='file-description'>{description}</span>
					)}
					{error && <div data-testid='file-error'>{error}</div>}
				</div>
			);
		},
	};
});

// Helper to simulate file upload
const simulateFileUpload = (file: File) => {
	if (mockOnChange) {
		mockOnChange(file);
	}
};

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
		mockOnChange = null;

		mockCreateMutateAsync.mockResolvedValue({});
		mockUpdateMutateAsync.mockResolvedValue({});

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

	// ===== Helper Functions Tests =====
	describe('isValidUrl helper', () => {
		it('returns true for valid http URLs', () => {
			expect(isValidUrl('http://example.com')).toBe(true);
			expect(isValidUrl('http://example.com/path')).toBe(true);
		});

		it('returns true for valid https URLs', () => {
			expect(isValidUrl('https://example.com')).toBe(true);
			expect(isValidUrl('https://example.com/docs/article')).toBe(true);
			expect(isValidUrl('https://sub.domain.example.com')).toBe(true);
		});

		it('returns true for URLs without protocol (common TLDs)', () => {
			expect(isValidUrl('example.com')).toBe(true);
			expect(isValidUrl('hello.dev')).toBe(true);
			expect(isValidUrl('myapp.io')).toBe(true);
			expect(isValidUrl('test.ai')).toBe(true);
			expect(isValidUrl('site.co')).toBe(true);
			expect(isValidUrl('app.cloud')).toBe(true);
		});

		it('returns true for URLs without protocol (country TLDs)', () => {
			expect(isValidUrl('example.uk')).toBe(true);
			expect(isValidUrl('site.de')).toBe(true);
			expect(isValidUrl('test.mx')).toBe(true);
			expect(isValidUrl('app.fr')).toBe(true);
		});

		it('returns true for URLs with subdomains and paths', () => {
			expect(isValidUrl('docs.example.com')).toBe(true);
			expect(isValidUrl('api.hello.dev/v1')).toBe(true);
			expect(isValidUrl('sub.domain.example.io/path/to/resource')).toBe(true);
		});

		it('returns false for invalid URLs', () => {
			expect(isValidUrl('not-a-url')).toBe(false);
			expect(isValidUrl('just some text')).toBe(false);
			expect(isValidUrl('ftp://example.com')).toBe(false);
			expect(isValidUrl('javascript:alert(1)')).toBe(false);
			expect(isValidUrl('hello')).toBe(false);
			expect(isValidUrl('hello.x')).toBe(false); // Single letter TLD
		});

		it('returns false for empty or whitespace strings', () => {
			expect(isValidUrl('')).toBe(false);
			expect(isValidUrl('   ')).toBe(false);
			expect(isValidUrl('\n\t')).toBe(false);
		});

		it('trims whitespace before checking', () => {
			expect(isValidUrl('  https://example.com  ')).toBe(true);
			expect(isValidUrl('  hello.dev  ')).toBe(true);
		});
	});

	describe('normalizeUrl helper', () => {
		it('returns URL unchanged if it has https protocol', () => {
			expect(normalizeUrl('https://example.com')).toBe('https://example.com');
			expect(normalizeUrl('https://hello.dev/path')).toBe(
				'https://hello.dev/path'
			);
		});

		it('returns URL unchanged if it has http protocol', () => {
			expect(normalizeUrl('http://example.com')).toBe('http://example.com');
		});

		it('adds https:// to URLs without protocol', () => {
			expect(normalizeUrl('example.com')).toBe('https://example.com');
			expect(normalizeUrl('hello.dev')).toBe('https://hello.dev');
			expect(normalizeUrl('docs.example.com/path')).toBe(
				'https://docs.example.com/path'
			);
		});

		it('trims whitespace', () => {
			expect(normalizeUrl('  example.com  ')).toBe('https://example.com');
		});

		it('returns empty string for empty input', () => {
			expect(normalizeUrl('')).toBe('');
			expect(normalizeUrl('   ')).toBe('');
		});
	});

	describe('inferType helper', () => {
		it('returns FILE when a file is provided', () => {
			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			expect(inferType('', file)).toBe(KnowledgeBaseType.FILE);
		});

		it('returns FILE even when URL content is also provided (file takes priority)', () => {
			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			expect(inferType('https://example.com', file)).toBe(
				KnowledgeBaseType.FILE
			);
		});

		it('returns URL when content is a valid URL and no file', () => {
			expect(inferType('https://example.com', null)).toBe(
				KnowledgeBaseType.URL
			);
		});

		it('returns TEXT when content is plain text and no file', () => {
			expect(inferType('Some text content', null)).toBe(KnowledgeBaseType.TEXT);
		});

		it('returns null when no content and no file', () => {
			expect(inferType('', null)).toBe(null);
			expect(inferType('   ', null)).toBe(null);
		});
	});

	// ===== Rendering Tests =====
	describe('Rendering', () => {
		it('renders the form with basic fields', () => {
			renderComponent();
			expect(screen.getByText('Knowledge Base')).toBeInTheDocument();
			expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
			expect(screen.getByLabelText(/URL or Text Content/i)).toBeInTheDocument();
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

		it('shows file input in create mode', () => {
			renderComponent();
			// File input label should be present - use getByLabelText
			expect(screen.getByLabelText(/Or upload a file/i)).toBeInTheDocument();
		});

		it('shows auto-detection hint', () => {
			renderComponent();
			expect(
				screen.getByText(/Enter a URL, paste text, or upload a file/i)
			).toBeInTheDocument();
		});
	});

	// ===== Type Inference & Detection Tests =====
	describe('Type Inference', () => {
		it('shows URL detected badge when entering a valid URL with protocol', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'https://example.com/docs');

			expect(screen.getByText('URL detected')).toBeInTheDocument();
		}, 10000);

		it('shows URL detected badge when entering a URL without protocol', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'hello.dev');

			expect(screen.getByText('URL detected')).toBeInTheDocument();
		});

		it('shows URL detected badge for common TLDs like .io, .ai, .app', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'myapp.io');

			expect(screen.getByText('URL detected')).toBeInTheDocument();
		});

		it('shows Text detected badge when entering plain text', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'Some plain text content');

			expect(screen.getByText('Text detected')).toBeInTheDocument();
		});

		it('shows File detected badge when uploading a file', async () => {
			renderComponent();

			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				expect(screen.getByText('File detected')).toBeInTheDocument();
			});
		});

		it('does not show detection badge when form is empty', () => {
			renderComponent();

			// The type indicator badges show "URL detected", "Text detected", "File detected"
			// When empty, none of these should appear
			expect(screen.queryByText('URL detected')).not.toBeInTheDocument();
			expect(screen.queryByText('Text detected')).not.toBeInTheDocument();
			expect(screen.queryByText('File detected')).not.toBeInTheDocument();
		});
	});

	// ===== Mutual Exclusivity Tests =====
	describe('Mutual Exclusivity', () => {
		it('disables file input when content textarea has text', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'Some content');

			const fileInput = screen.getByTestId('file-input');
			expect(fileInput).toBeDisabled();
		});

		it('disables textarea when file is selected', async () => {
			renderComponent();

			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				const textarea = screen.getByLabelText(/URL or Text Content/i);
				expect(textarea).toBeDisabled();
			});
		});

		it('clears content when file is selected', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'Some content');
			expect(textarea).toHaveValue('Some content');

			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				expect(textarea).toHaveValue('');
			});
		});

		it('shows helpful description when file is selected', async () => {
			renderComponent();

			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				expect(
					screen.getByText(/Clear the file to enter text/i)
				).toBeInTheDocument();
			});
		});

		it('shows helpful description when content has text', async () => {
			renderComponent();
			const textarea = screen.getByLabelText(/URL or Text Content/i);

			await userEvent.type(textarea, 'Some content');

			expect(
				screen.getByText(/Clear the text to upload a file/i)
			).toBeInTheDocument();
		});
	});

	// ===== Validation Tests =====
	describe('Validation', () => {
		it('validates required name', async () => {
			renderComponent();
			const nameInput = screen.getByLabelText(/Name/i);

			fireEvent.focus(nameInput);
			fireEvent.blur(nameInput);

			expect(await screen.findByText('Name is required.')).toBeInTheDocument();
		});

		it('validates that content or file is required for new KB', async () => {
			renderComponent();
			const nameInput = screen.getByLabelText(/Name/i);

			await userEvent.type(nameInput, 'Test KB');

			// Content textarea still empty, no file - save button should remain disabled
			const saveButton = screen.getByRole('button', { name: /Save/i });
			expect(saveButton).toBeDisabled();
		});

		it('save button is disabled when form is invalid', () => {
			renderComponent();
			const saveButton = screen.getByRole('button', { name: /Save/i });
			expect(saveButton).toBeDisabled();
		});

		it('save button is enabled when form is valid with URL', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'Test KB');
			await userEvent.type(
				screen.getByLabelText(/URL or Text Content/i),
				'https://example.com'
			);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());
		});

		it('save button is enabled when form is valid with text', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'Test KB');
			await userEvent.type(
				screen.getByLabelText(/URL or Text Content/i),
				'Some text content'
			);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());
		});

		it('save button is enabled when form is valid with file', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'Test KB');

			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());
		});
	});

	// ===== Submission Tests =====
	describe('Submission', () => {
		it('submits URL type correctly with full URL', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'URL KB');
			await userEvent.type(
				screen.getByLabelText(/URL or Text Content/i),
				'https://example.com/docs'
			);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'URL KB',
					description: '',
					type: KnowledgeBaseType.URL,
					sourceUrl: 'https://example.com/docs',
				});
			});
			expect(mockClearRight).toHaveBeenCalled();
		}, 10000);

		it('normalizes URL without protocol by adding https://', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'URL KB');
			await userEvent.type(
				screen.getByLabelText(/URL or Text Content/i),
				'hello.dev'
			);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'URL KB',
					description: '',
					type: KnowledgeBaseType.URL,
					sourceUrl: 'https://hello.dev',
				});
			});
		});

		it('submits TEXT type correctly', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'Text KB');
			await userEvent.type(
				screen.getByLabelText(/URL or Text Content/i),
				'Some text content for the knowledge base'
			);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'Text KB',
					description: '',
					type: KnowledgeBaseType.TEXT,
					textContent: 'Some text content for the knowledge base',
				});
			});
		});

		it('submits FILE type correctly', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'File KB');

			const file = new File(['dummy content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith({
					name: 'File KB',
					description: '',
					type: KnowledgeBaseType.FILE,
					file: file,
				});
			});
		});

		it('includes description when provided', async () => {
			renderComponent();

			await userEvent.type(screen.getByLabelText(/Name/i), 'Test KB');
			await userEvent.type(
				screen.getByLabelText(/Description/i),
				'A helpful description'
			);
			await userEvent.type(
				screen.getByLabelText(/URL or Text Content/i),
				'https://example.com'
			);

			const saveButton = screen.getByRole('button', { name: /Save/i });
			await waitFor(() => expect(saveButton).not.toBeDisabled());

			fireEvent.click(saveButton);

			await waitFor(() => {
				expect(mockCreateMutateAsync).toHaveBeenCalledWith(
					expect.objectContaining({
						description: 'A helpful description',
					})
				);
			});
		});
	});

	// ===== Cancel Tests =====
	describe('Cancel', () => {
		it('clears right section on cancel', () => {
			renderComponent();
			fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
			expect(mockClearRight).toHaveBeenCalled();
		});
	});

	// ===== Edit Mode Tests =====
	describe('Edit Mode', () => {
		const mockUrlKB = {
			id: 123,
			name: 'Existing URL KB',
			description: 'Desc',
			type: KnowledgeBaseType.URL,
			sourceUrl: 'https://existing.com',
			textContent: '',
			file: null,
			status: 'ACTIVE',
		};

		const mockTextKB = {
			id: 456,
			name: 'Existing Text KB',
			description: 'Text description',
			type: KnowledgeBaseType.TEXT,
			sourceUrl: '',
			textContent: 'Existing text content',
			file: null,
			status: 'ACTIVE',
		};

		const mockFileKB = {
			id: 789,
			name: 'Existing File KB',
			description: 'File description',
			type: KnowledgeBaseType.FILE,
			sourceUrl: '',
			textContent: '',
			file: { name: 'existing-file.pdf' },
			fileId: 1,
			status: 'ACTIVE',
		};

		it('populates form with existing URL KB data', () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockUrlKB,
				isLoading: false,
			});

			renderComponent({ id: 123 });

			expect(screen.getByLabelText(/Name/i)).toHaveValue('Existing URL KB');
			expect(screen.getByLabelText(/Description/i)).toHaveValue('Desc');
			expect(screen.getByLabelText(/URL or Text Content/i)).toHaveValue(
				'https://existing.com'
			);
		});

		it('populates form with existing TEXT KB data', () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockTextKB,
				isLoading: false,
			});

			renderComponent({ id: 456 });

			expect(screen.getByLabelText(/Name/i)).toHaveValue('Existing Text KB');
			expect(screen.getByLabelText(/URL or Text Content/i)).toHaveValue(
				'Existing text content'
			);
		});

		it('shows existing file metadata for FILE KB', () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockFileKB,
				isLoading: false,
			});

			renderComponent({ id: 789 });

			expect(screen.getByText('Current file')).toBeInTheDocument();
			expect(screen.getByText('existing-file.pdf')).toBeInTheDocument();
		});

		it('hides file input in edit mode', () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockUrlKB,
				isLoading: false,
			});

			renderComponent({ id: 123 });

			// File input should not be present in edit mode
			expect(
				screen.queryByLabelText(/Or upload a file/i)
			).not.toBeInTheDocument();
			expect(screen.queryByTestId('file-input')).not.toBeInTheDocument();
		});

		it('shows existing type badge in edit mode', () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockUrlKB,
				isLoading: false,
			});

			renderComponent({ id: 123 });

			expect(screen.getByText('URL')).toBeInTheDocument();
		});

		it('calls update mutation on save', async () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: mockUrlKB,
				isLoading: false,
			});

			renderComponent({ id: 123 });

			const nameInput = screen.getByLabelText(/Name/i);
			await userEvent.clear(nameInput);
			await userEvent.type(nameInput, 'Updated Name');

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
			(useKnowledgeBase as any).mockReturnValue({
				data: mockUrlKB,
				isLoading: false,
			});

			renderComponent({ id: 123 });
			const status = screen.getByTestId('header-status');
			expect(status).toHaveTextContent('ACTIVE');
		});
	});

	// ===== Loading State Tests =====
	describe('Loading State', () => {
		it('disables form fields when loading', () => {
			(useKnowledgeBase as any).mockReturnValue({
				data: null,
				isLoading: true,
			});

			renderComponent({ id: 123 });

			expect(screen.getByLabelText(/Name/i)).toBeDisabled();
			expect(screen.getByLabelText(/URL or Text Content/i)).toBeDisabled();
		});
	});

	// ===== Error Handling Tests =====
	describe('Error Handling', () => {
		it('displays mutation error from Error object', () => {
			const errorMsg = 'Failed to create';
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'idle',
				error: new Error(errorMsg),
			});

			renderComponent();
			expect(screen.getByText(errorMsg)).toBeInTheDocument();
		});

		it('displays mutation error from string', () => {
			const errorMsg = 'String error message';
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'idle',
				error: errorMsg,
			});

			renderComponent();
			expect(screen.getByText(errorMsg)).toBeInTheDocument();
		});

		it('displays mutation error from API response', () => {
			const errorMsg = 'API error message';
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'idle',
				error: { response: { data: { message: errorMsg } } },
			});

			renderComponent();
			expect(screen.getByText(errorMsg)).toBeInTheDocument();
		});

		it('displays fallback error for unknown error type', () => {
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'idle',
				error: { unknown: 'structure' },
			});

			renderComponent();
			expect(
				screen.getByText(/Unable to save this knowledge base/i)
			).toBeInTheDocument();
		});
	});

	// ===== Saving State Tests =====
	describe('Saving State', () => {
		it('disables cancel button when saving', () => {
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'pending',
				error: null,
			});

			renderComponent();

			const cancelButton = screen.getByRole('button', { name: /Cancel/i });
			expect(cancelButton).toBeDisabled();
		});

		it('shows loading state on save button when creating', () => {
			(useCreateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockCreateMutateAsync,
				status: 'pending',
				error: null,
			});

			renderComponent();

			// The save button should have loading state (Mantine adds aria-busy or loading attribute)
			const saveButton = screen.getByRole('button', { name: /Save/i });
			expect(saveButton).toBeDisabled();
		});

		it('shows loading state on save button when updating', () => {
			const mockKB = {
				id: 123,
				name: 'KB',
				type: KnowledgeBaseType.URL,
				sourceUrl: 'https://example.com',
			};

			(useKnowledgeBase as any).mockReturnValue({
				data: mockKB,
				isLoading: false,
			});

			(useUpdateKnowledgeBase as any).mockReturnValue({
				mutateAsync: mockUpdateMutateAsync,
				status: 'pending',
				error: null,
			});

			renderComponent({ id: 123 });

			const saveButton = screen.getByRole('button', { name: /Save/i });
			expect(saveButton).toBeDisabled();
		});
	});

	// ===== File Selection Display Tests =====
	describe('File Selection Display', () => {
		it('displays selected file name', async () => {
			renderComponent();

			const file = new File(['content'], 'my-document.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				expect(screen.getByText('my-document.pdf')).toBeInTheDocument();
			});
		});

		it('displays "Selected:" prefix for file name', async () => {
			renderComponent();

			const file = new File(['content'], 'test.pdf', {
				type: 'application/pdf',
			});
			simulateFileUpload(file);

			await waitFor(() => {
				expect(screen.getByText(/Selected:/i)).toBeInTheDocument();
			});
		});
	});
});
