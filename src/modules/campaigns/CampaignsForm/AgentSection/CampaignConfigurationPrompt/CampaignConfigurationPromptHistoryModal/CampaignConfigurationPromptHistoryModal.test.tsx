import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignConfigurationPromptHistoryModal from './CampaignConfigurationPromptHistoryModal';

const mockOnSelect = vi.fn();

vi.mock('~/modules/campaigns/CampaignPromptHistory', () => ({
	default: ({
		campaignId,
		campaignPromptTypeId,
		currentPromptText,
		onSelect,
	}: {
		campaignId: number;
		campaignPromptTypeId?: number;
		currentPromptText?: string;
		onSelect: (prompt: string) => void;
	}) => {
		mockOnSelect.mockImplementation(onSelect);
		return (
			<div data-testid='campaign-prompt-history'>
				<span data-testid='history-campaign-id'>{campaignId}</span>
				<span data-testid='history-prompt-type-id'>{campaignPromptTypeId}</span>
				<span data-testid='history-current-prompt'>{currentPromptText}</span>
				<button onClick={() => onSelect('Selected prompt from history')}>
					Select Prompt
				</button>
			</div>
		);
	},
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Modal: ({
			opened,
			onClose,
			title,
			children,
		}: {
			opened: boolean;
			onClose: () => void;
			title?: string;
			children: React.ReactNode;
		}) =>
			opened ? (
				<div data-testid='modal-container'>
					<h2 data-testid='modal-title'>{title}</h2>
					<button data-testid='modal-close' onClick={onClose}>
						Close
					</button>
					{children}
				</div>
			) : null,
	};
});

describe('CampaignConfigurationPromptHistoryModal', () => {
	const mockOnClose = vi.fn();
	const mockOnSelectProp = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders modal when opened is true', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.getByTestId('modal-container')).toBeInTheDocument();
		});

		it('does not render modal when opened is false', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={false}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
		});

		it('displays the correct modal title', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.getByTestId('modal-title')).toHaveTextContent(
				'Restore Prompt from History'
			);
		});

		it('renders CampaignPromptHistory component', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.getByTestId('campaign-prompt-history')).toBeInTheDocument();
		});
	});

	describe('Props Passing', () => {
		it('passes campaignId to CampaignPromptHistory', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={456}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.getByTestId('history-campaign-id')).toHaveTextContent(
				'456'
			);
		});

		it('passes campaignPromptTypeId to CampaignPromptHistory', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={456}
					campaignPromptTypeId={99}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.getByTestId('history-prompt-type-id')).toHaveTextContent(
				'99'
			);
		});

		it('passes currentPromptText to CampaignPromptHistory', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					currentPromptText='Current prompt text here'
					onSelect={mockOnSelectProp}
				/>
			);

			expect(screen.getByTestId('history-current-prompt')).toHaveTextContent(
				'Current prompt text here'
			);
		});

		it('handles undefined currentPromptText', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			expect(
				screen.getByTestId('history-current-prompt')
			).toBeEmptyDOMElement();
		});

		it('passes onSelect to CampaignPromptHistory', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			screen.getByText('Select Prompt').click();

			expect(mockOnSelectProp).toHaveBeenCalledWith(
				'Selected prompt from history'
			);
		});
	});

	describe('Close Behavior', () => {
		it('calls onClose when close button is clicked', () => {
			render(
				<CampaignConfigurationPromptHistoryModal
					opened={true}
					onClose={mockOnClose}
					campaignId={123}
					onSelect={mockOnSelectProp}
				/>
			);

			screen.getByTestId('modal-close').click();

			expect(mockOnClose).toHaveBeenCalledTimes(1);
		});
	});

	describe('Different Campaign IDs', () => {
		it.each([0, 1, 999, 12345])(
			'correctly passes campaignId %i',
			(campaignId) => {
				render(
					<CampaignConfigurationPromptHistoryModal
						opened={true}
						onClose={mockOnClose}
						campaignId={campaignId}
						onSelect={mockOnSelectProp}
					/>
				);

				expect(screen.getByTestId('history-campaign-id')).toHaveTextContent(
					String(campaignId)
				);
			}
		);
	});
});
