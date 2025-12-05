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
let mockTypesData: CampaignPromptTypeModel[] | undefined = mockTypes;

vi.mock('react-router', () => ({
	useParams: () => ({ campaignId: '123' }),
}));

vi.mock('~/queries/campaignPromptTypeQueries', () => ({
	useGetAllCampaignPromptTypes: () => ({
		data: mockTypesData,
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

vi.mock('./PromptTypeAccordionItem/PromptEditor', () => ({
	default: ({
		type,
		value,
		onChange,
	}: {
		type: CampaignPromptTypeModel;
		value?: string;
		onChange: (val: string) => void;
		campaignId: number;
	}) => (
		<div>
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
		mockTypesData = mockTypes;
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
				screen.getByText(/Configure prompts for each interaction type/i)
			).toBeInTheDocument();
		});

		it('renders all prompt types in the navigation menu', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByTestId('prompt-menu-item-1')).toBeInTheDocument();
			expect(screen.getByTestId('prompt-menu-item-2')).toBeInTheDocument();
			expect(screen.getByTestId('prompt-menu-item-3')).toBeInTheDocument();
		});

		it('displays type names correctly', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByTestId('prompt-menu-item-1')).toHaveTextContent(
				'Greeting'
			);
			expect(screen.getByTestId('prompt-menu-item-2')).toHaveTextContent(
				'Farewell'
			);
			expect(screen.getByTestId('prompt-menu-item-3')).toHaveTextContent(
				'Objection'
			);
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
				screen.getByRole('button', { name: /^Save$/i })
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
				screen.getByText(/Save to apply prompts across this campaign/i)
			).toBeInTheDocument();
		});

		it('renders types count badge', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByText('Types')).toBeInTheDocument();
			expect(screen.getByText('3')).toBeInTheDocument();
		});

		it('renders active type name in editor header', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			// First type should be active by default, shown in both menu and editor
			const greetingTexts = screen.getAllByText('Greeting');
			expect(greetingTexts.length).toBeGreaterThanOrEqual(2);
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

			fireEvent.click(screen.getByTestId('prompt-menu-item-2'));

			expect(screen.getByTestId('prompt-input-2')).toHaveValue(
				'Goodbye! Thanks!'
			);

			fireEvent.click(screen.getByTestId('prompt-menu-item-3'));
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

			fireEvent.click(screen.getByTestId('prompt-menu-item-3'));

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

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

			expect(mockSaveBatch).toHaveBeenCalledWith(
				expect.objectContaining({
					prompts: expect.arrayContaining([
						expect.objectContaining({
							typeId: 1,
							prompt: 'Hello! Welcome!',
							isChange: false,
						}),
						expect.objectContaining({
							typeId: 2,
							prompt: 'Goodbye! Thanks!',
							isChange: false,
						}),
					]),
				}),
				expect.any(Object)
			);
		});

		it('sets isChange to true when a prompt is modified', async () => {
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

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

			expect(mockSaveBatch).toHaveBeenCalledWith(
				expect.objectContaining({
					prompts: expect.arrayContaining([
						expect.objectContaining({
							typeId: 1,
							prompt: 'Updated greeting',
							isChange: true,
						}),
						expect.objectContaining({
							typeId: 2,
							prompt: 'Goodbye! Thanks!',
							isChange: false,
						}),
					]),
				}),
				expect.any(Object)
			);
		});

		it('sets isChange to true for new prompts', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			// Click on Objection (type 3) which is empty initially
			fireEvent.click(screen.getByTestId('prompt-menu-item-3'));

			const input = screen.getByTestId('prompt-input-3');
			fireEvent.change(input, { target: { value: 'New objection handling' } });

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

			expect(mockSaveBatch).toHaveBeenCalledWith(
				expect.objectContaining({
					prompts: expect.arrayContaining([
						expect.objectContaining({
							typeId: 3,
							prompt: 'New objection handling',
							isChange: true,
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

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

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

			fireEvent.click(screen.getByTestId('prompt-menu-item-3'));

			const input = screen.getByTestId('prompt-input-3');
			fireEvent.change(input, { target: { value: '   ' } });

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

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

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

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

			fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

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

		it('uses initialSchemaId when it matches a valid type', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
					initialSchemaId={2}
				/>
			);

			// Type 2 (Farewell) should be active
			expect(screen.getByTestId('prompt-menu-item-2')).toHaveAttribute(
				'data-active',
				'true'
			);
			expect(screen.getByTestId('prompt-menu-item-1')).toHaveAttribute(
				'data-active',
				'false'
			);
		});

		it('falls back to first type when initialSchemaId does not match any type', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
					initialSchemaId={999}
				/>
			);

			// Should fall back to first type (Greeting)
			expect(screen.getByTestId('prompt-menu-item-1')).toHaveAttribute(
				'data-active',
				'true'
			);
		});
	});

	describe('Edge Cases', () => {
		it('shows empty state when no types are available', () => {
			mockTypesData = [];

			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(
				screen.getByText(/Select a prompt type to start editing/i)
			).toBeInTheDocument();
		});

		it('handles undefined types gracefully', () => {
			mockTypesData = undefined;

			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			expect(screen.getByText('Prompt configuration')).toBeInTheDocument();
		});

		it('shows correct badge for menu items with content', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			// Menu items with content should show "Saved" badge
			const savedBadges = screen.getAllByText('Saved');
			expect(savedBadges.length).toBeGreaterThanOrEqual(2);
		});

		it('shows No changes badge in editor for unchanged prompts', async () => {
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

			// The active prompt has content but not edited, so it should show No changes
			expect(screen.getByText('No changes')).toBeInTheDocument();
		});

		it('shows Empty badge for prompts without content', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			// Click on Objection which has no content
			fireEvent.click(screen.getByTestId('prompt-menu-item-3'));

			await waitFor(() => {
				expect(screen.getByText('Empty')).toBeInTheDocument();
			});
		});

		it('allows clicking on different menu items to switch active type', () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			// Initially type 1 should be active
			expect(screen.getByTestId('prompt-menu-item-1')).toHaveAttribute(
				'data-active',
				'true'
			);

			// Click on type 2
			fireEvent.click(screen.getByTestId('prompt-menu-item-2'));

			// Type 2 should now be active
			expect(screen.getByTestId('prompt-menu-item-2')).toHaveAttribute(
				'data-active',
				'true'
			);
			expect(screen.getByTestId('prompt-menu-item-1')).toHaveAttribute(
				'data-active',
				'false'
			);
		});

		it('updates prompt value when changed with long text', async () => {
			renderWithProviders(
				<CampaignConfigurationPromptEditModal
					onClose={mockOnClose}
					onSave={mockOnSave}
				/>
			);

			const input = screen.getByTestId('prompt-input-1');
			fireEvent.change(input, {
				target: { value: 'This is a long prompt with detailed instructions' },
			});

			await waitFor(() => {
				expect(input).toHaveValue(
					'This is a long prompt with detailed instructions'
				);
			});
		});
	});
});
