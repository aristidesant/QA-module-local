import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import CampaignConfigurationPromptEditModal from './CampaignConfigurationPromptEditModal';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import type { CampaignPromptModel } from '~/models/CampaignPromptModel';

const mockSaveBatch = vi.fn();
const mockTypes: CampaignPromptTypeModel[] = [
	{
		id: 1,
		name: 'Greeting',
		icon: 'icon-greeting',
		order: 1,
		createdAt: '2024-01-01',
	},
	{
		id: 2,
		name: 'Farewell',
		icon: 'icon-farewell',
		order: 2,
		createdAt: '2024-01-01',
	},
	{
		id: 3,
		name: 'Objection',
		icon: 'icon-objection',
		order: 3,
		createdAt: '2024-01-01',
	},
];

const mockExistingPrompts: CampaignPromptModel[] = [
	{ id: 1, typeId: 1, campaignId: 123, prompt: 'Hello! Welcome!', order: 1 },
	{ id: 2, typeId: 2, campaignId: 123, prompt: 'Goodbye! Thanks!', order: 2 },
];

let mockIsLoadingPrompts = false;
let mockIsSaving = false;

vi.mock('react-router', () => ({
	useParams: () => ({ campaignId: '123' }),
}));

vi.mock('~/queries/campaignPromptTypeQueries', () => ({
	useGetAllCampaignPromptTypes: () => ({
		data: mockTypes,
		isLoading: false,
	}),
}));

vi.mock('~/queries/campaignPromptQueries', () => ({
	useGetCampaignPrompts: () => ({
		data: mockExistingPrompts,
		isLoading: mockIsLoadingPrompts,
	}),
	useCreateCampaignPromptsBatch: () => ({
		mutate: mockSaveBatch,
		isPending: mockIsSaving,
	}),
}));

vi.mock('./PromptTypeAccordionItem', () => ({
	default: ({
		type,
		value,
		onChange,
	}: {
		type: CampaignPromptTypeModel;
		value?: string;
		onChange: (val: string) => void;
	}) => (
		<div data-testid={`accordion-item-${type.id}`}>
			<span data-testid={`type-name-${type.id}`}>{type.name}</span>
			<input
				data-testid={`prompt-input-${type.id}`}
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	),
}));

describe('CampaignConfigurationPromptEditModal', () => {
	const mockOnClose = vi.fn();
	const mockOnSave = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockIsLoadingPrompts = false;
		mockIsSaving = false;
	});

	describe('Rendering', () => {
		it('renders the modal with header content', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByText('Prompt configuration')).toBeInTheDocument();
			expect(
				screen.getByText(/Curated, compact instructions/i)
			).toBeInTheDocument();
		});

		it('renders all prompt types as accordion items', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByTestId('accordion-item-1')).toBeInTheDocument();
			expect(screen.getByTestId('accordion-item-2')).toBeInTheDocument();
			expect(screen.getByTestId('accordion-item-3')).toBeInTheDocument();
		});

		it('displays type names correctly', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByTestId('type-name-1')).toHaveTextContent('Greeting');
			expect(screen.getByTestId('type-name-2')).toHaveTextContent('Farewell');
			expect(screen.getByTestId('type-name-3')).toHaveTextContent('Objection');
		});

		it('renders cancel and save buttons', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(
				screen.getByRole('button', { name: /cancel/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /save prompts/i })
			).toBeInTheDocument();
		});

		it('renders footer text', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(
				screen.getByText(/Save to share these prompts with every agent/i)
			).toBeInTheDocument();
		});

		it('renders info tooltip button', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(
				screen.getByRole('button', { name: /prompt tips/i })
			).toBeInTheDocument();
		});
	});

	describe('Loading States', () => {
		it('shows loading overlay when prompts are loading', () => {
			mockIsLoadingPrompts = true;

			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(
				document.querySelector('.mantine-LoadingOverlay-root')
			).toBeInTheDocument();
		});

		it('shows loading overlay when saving', () => {
			mockIsSaving = true;

			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(
				document.querySelector('.mantine-LoadingOverlay-root')
			).toBeInTheDocument();
		});
	});

	describe('Existing Prompts', () => {
		it('populates inputs with existing prompts', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			await waitFor(() => {
				expect(screen.getByTestId('prompt-input-1')).toHaveValue(
					'Hello! Welcome!'
				);
			});

			expect(screen.getByTestId('prompt-input-2')).toHaveValue(
				'Goodbye! Thanks!'
			);
			expect(screen.getByTestId('prompt-input-3')).toHaveValue('');
		});
	});

	describe('Editing Prompts', () => {
		it('allows editing prompts', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			const input = screen.getByTestId('prompt-input-3');
			fireEvent.change(input, { target: { value: 'New objection handling' } });

			expect(input).toHaveValue('New objection handling');
		});

		it('updates existing prompt values', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			await waitFor(() => {
				expect(screen.getByTestId('prompt-input-1')).toHaveValue(
					'Hello! Welcome!'
				);
			});

			const input = screen.getByTestId('prompt-input-1');
			fireEvent.change(input, { target: { value: 'Updated greeting' } });

			expect(input).toHaveValue('Updated greeting');
		});
	});

	describe('Cancel Action', () => {
		it('calls onClose when cancel is clicked', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Save Action', () => {
		it('calls saveBatch with non-empty prompts when save is clicked', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			await waitFor(() => {
				expect(screen.getByTestId('prompt-input-1')).toHaveValue(
					'Hello! Welcome!'
				);
			});

			fireEvent.click(screen.getByRole('button', { name: /save prompts/i }));

			expect(mockSaveBatch).toHaveBeenCalledWith(
				expect.objectContaining({
					prompts: expect.arrayContaining([
						expect.objectContaining({
							typeId: 1,
							prompt: 'Hello! Welcome!',
						}),
						expect.objectContaining({
							typeId: 2,
							prompt: 'Goodbye! Thanks!',
						}),
					]),
				}),
				expect.any(Object)
			);
		});

		it('filters out empty prompts when saving', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			await waitFor(() => {
				expect(screen.getByTestId('prompt-input-1')).toHaveValue(
					'Hello! Welcome!'
				);
			});

			fireEvent.click(screen.getByRole('button', { name: /save prompts/i }));

			const savedPrompts = mockSaveBatch.mock.calls[0][0].prompts;
			expect(savedPrompts).not.toContainEqual(
				expect.objectContaining({ typeId: 3 })
			);
		});

		it('filters out whitespace-only prompts when saving', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			await waitFor(() => {
				expect(screen.getByTestId('prompt-input-1')).toHaveValue(
					'Hello! Welcome!'
				);
			});

			const input = screen.getByTestId('prompt-input-3');
			fireEvent.change(input, { target: { value: '   ' } });

			fireEvent.click(screen.getByRole('button', { name: /save prompts/i }));

			const savedPrompts = mockSaveBatch.mock.calls[0][0].prompts;
			expect(savedPrompts).not.toContainEqual(
				expect.objectContaining({ typeId: 3, prompt: '   ' })
			);
		});

		it('calls onSave and onClose on successful save', async () => {
			mockSaveBatch.mockImplementation((_data, options) => {
				options.onSuccess?.();
			});

			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			await waitFor(() => {
				expect(screen.getByTestId('prompt-input-1')).toHaveValue(
					'Hello! Welcome!'
				);
			});

			fireEvent.click(screen.getByRole('button', { name: /save prompts/i }));

			expect(mockOnSave).toHaveBeenCalledTimes(1);
			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Campaign ID Handling', () => {
		it('uses campaignId from props over route params', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
					campaignId={456}
				/>
			);

			// First, add content to a prompt so it will be included in save
			const promptInput = screen.getByTestId('prompt-input-1');
			fireEvent.change(promptInput, {
				target: { value: 'Hello from campaign 456' },
			});

			fireEvent.click(screen.getByRole('button', { name: /save prompts/i }));

			expect(mockSaveBatch).toHaveBeenCalledWith(
				expect.objectContaining({
					prompts: expect.arrayContaining([
						expect.objectContaining({
							campaignId: 456,
						}),
					]),
				}),
				expect.any(Object)
			);
		});
	});

	describe('Initial Schema ID', () => {
		it('accepts initialSchemaId prop', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
					initialSchemaId={789}
				/>
			);

			expect(screen.getByText('Prompt configuration')).toBeInTheDocument();
		});
	});
});
