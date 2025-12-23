import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import ReassignPromptTypeModal from './ReassignPromptTypeModal';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import type { CampaignPromptUsageModel } from '~/models/CampaignPromptUsageModel';
import campaignPromptTypeApi from '~/api/campaignPromptTypeApi';
import campaignPromptsApi from '~/api/campaignPromptApi';

// Mock APIs
vi.mock('~/api/campaignPromptTypeApi');
vi.mock('~/api/campaignPromptApi');
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

// Mock Mantine Select for easier testing
vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Select: ({ data, onChange, value, placeholder, ...props }: any) => (
			<select
				data-testid='mock-select'
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				{...props}
			>
				<option value=''>{placeholder}</option>
				{data.map((item: any) => (
					<option key={item.value} value={item.value}>
						{item.label}
					</option>
				))}
			</select>
		),
	};
});

const mockTypeToDelete: CampaignPromptTypeModel = {
	id: 1,
	name: 'Type To Delete',
	icon: 'icon',
	order: 1,
	createdAt: '2023-01-01',
};

const mockAffectedCampaigns: CampaignPromptUsageModel[] = [
	{
		campaignPromptId: 101,
		campaignTypeId: 1,
		campaignId: 201,
		campaignName: 'Campaign A',
		prompt: 'Original Prompt A',
	},
	{
		campaignPromptId: 102,
		campaignTypeId: 1,
		campaignId: 202,
		campaignName: 'Campaign B',
		prompt: 'Original Prompt B',
	},
];

const mockAvailableTypes: CampaignPromptTypeModel[] = [
	{
		id: 2,
		name: 'Type 2',
		icon: 'icon',
		order: 2,
		createdAt: '2023-01-01',
	},
	{
		id: 3,
		name: 'Type 3',
		icon: 'icon',
		order: 3,
		createdAt: '2023-01-01',
	},
];

describe('ReassignPromptTypeModal', () => {
	const mockOnClose = vi.fn();
	const mockOnDeleteType = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(campaignPromptTypeApi as any).mockReturnValue({
			getAvailableCampaignPromptTypes: vi
				.fn()
				.mockResolvedValue(mockAvailableTypes),
			reassignCampaignPromptType: vi.fn().mockResolvedValue({ success: true }),
		});
		(campaignPromptsApi as any).mockReturnValue({
			deleteCampaignPrompt: vi.fn().mockResolvedValue({ success: true }),
			getCampaignPromptsByType: vi.fn().mockResolvedValue([]),
		});
	});

	const renderModal = () => {
		return render(
			<MantineProvider>
				<ReassignPromptTypeModal
					opened={true}
					onClose={mockOnClose}
					typeToDelete={mockTypeToDelete}
					affectedCampaigns={mockAffectedCampaigns}
					onDeleteType={mockOnDeleteType}
				/>
			</MantineProvider>
		);
	};

	it('renders correctly with affected campaigns', async () => {
		renderModal();
		// Wait for loading to finish
		await waitFor(() =>
			expect(
				screen.queryByText('Checking campaign constraints...')
			).not.toBeInTheDocument()
		);

		const alert = screen.getByRole('alert');
		expect(alert).toHaveTextContent(
			'The prompt type Type To Delete is currently assigned to 2 campaigns'
		);

		expect(screen.getByText('Campaign A')).toBeInTheDocument();
		expect(screen.getByText('Campaign B')).toBeInTheDocument();
	});

	it('fetches available types for each campaign', async () => {
		renderModal();
		await waitFor(() => {
			const api = campaignPromptTypeApi();
			expect(api.getAvailableCampaignPromptTypes).toHaveBeenCalledTimes(2);
			expect(api.getAvailableCampaignPromptTypes).toHaveBeenCalledWith(201);
			expect(api.getAvailableCampaignPromptTypes).toHaveBeenCalledWith(202);
		});
	});

	it('allows selecting an action for a campaign', async () => {
		renderModal();

		// Wait for loading to finish
		await waitFor(() =>
			expect(
				screen.queryByText('Checking campaign constraints...')
			).not.toBeInTheDocument()
		);

		// Find the select for the first campaign
		const selects = screen.getAllByTestId('mock-select');
		expect(selects).toHaveLength(2);

		// Select "Delete Prompt"
		fireEvent.change(selects[0], { target: { value: 'delete_prompt' } });

		// Verify state update (button might still be disabled because not all are assigned)
		expect(selects[0]).toHaveValue('delete_prompt');
	});

	it('shows import button and textarea when reassigning', async () => {
		renderModal();
		await waitFor(() =>
			expect(
				screen.queryByText('Checking campaign constraints...')
			).not.toBeInTheDocument()
		);

		const selects = screen.getAllByTestId('mock-select');

		// Select a type to reassign (ID 2)
		fireEvent.change(selects[0], { target: { value: '2' } });

		// Check for textarea
		expect(
			screen.getByPlaceholderText('New prompt content')
		).toBeInTheDocument();
		// Check for import button (by title)
		expect(screen.getByTitle('Import existing prompt')).toBeInTheDocument();
	});

	it('calls onDeleteType when all campaigns are handled', async () => {
		renderModal();
		await waitFor(() =>
			expect(
				screen.queryByText('Checking campaign constraints...')
			).not.toBeInTheDocument()
		);

		const selects = screen.getAllByTestId('mock-select');

		// Set all to delete
		fireEvent.change(selects[0], { target: { value: 'delete_prompt' } });
		fireEvent.change(selects[1], { target: { value: 'delete_prompt' } });

		const confirmButton = screen.getByText('Confirm & Delete Type');
		expect(confirmButton).not.toBeDisabled();

		fireEvent.click(confirmButton);

		await waitFor(() => {
			expect(mockOnDeleteType).toHaveBeenCalledWith(mockTypeToDelete.id);
		});
	});
});
