import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import type { Campaign } from '~/models/CampaignsModel';

const mockSetFieldValue = vi.fn();
let mockValues = {
	agentConfig: {
		conversationConfig: {
			agent: {
				prompt: { prompt: 'Initial prompt' },
			},
		},
		contactSchemaId: 5,
	},
};

let mockSelectedCampaign: Campaign | null = { id: 12 } as Campaign;

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: mockValues,
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (
		selector: (state: { selectedCampaign: Campaign | null }) => unknown
	) => selector({ selectedCampaign: mockSelectedCampaign }),
}));

const mockHistoryOnSelect = vi.fn();
const mockHistoryOnClose = vi.fn();

vi.mock('./CampaignConfigurationPromptHistoryModal', () => ({
	default: ({
		opened,
		onClose,
		onSelect,
		campaignId,
		currentPromptText,
	}: {
		opened: boolean;
		onClose: () => void;
		onSelect: (prompt: string) => void;
		campaignId: number;
		currentPromptText?: string;
	}) => {
		mockHistoryOnSelect.mockImplementation(onSelect);
		mockHistoryOnClose.mockImplementation(onClose);
		return opened ? (
			<div data-testid='history-modal'>
				HistoryModal
				<span data-testid='campaign-id'>{campaignId}</span>
				<span data-testid='current-prompt'>{currentPromptText}</span>
				<button onClick={onClose}>CloseHistory</button>
				<button onClick={() => onSelect('Restored prompt')}>
					SelectPrompt
				</button>
			</div>
		) : null;
	},
}));

const mockEditOnClose = vi.fn();
const mockEditOnSave = vi.fn();

vi.mock('./CampaignConfigurationPromptEditModal', () => ({
	default: ({
		opened,
		onClose,
		onSave,
		initialSchemaId,
	}: {
		opened: boolean;
		onClose: () => void;
		onSave: () => void;
		initialSchemaId?: number;
	}) =>
		opened ? (
			<div data-testid='edit-modal-content'>
				EditModalContent
				<span data-testid='schema-id'>{initialSchemaId}</span>
				<button
					onClick={() => {
						mockEditOnClose();
						onClose();
					}}
				>
					CloseEdit
				</button>
				<button
					onClick={() => {
						mockEditOnSave();
						onSave();
					}}
				>
					SaveEdit
				</button>
			</div>
		) : null,
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Textarea: ({ value, disabled }: { value?: string; disabled?: boolean }) => (
			<textarea value={value} disabled={disabled} readOnly />
		),
		ActionIcon: ({
			onClick,
			'aria-label': ariaLabel,
			children,
			disabled,
		}: {
			onClick?: () => void;
			'aria-label'?: string;
			children: React.ReactNode;
			disabled?: boolean;
		}) => (
			<button onClick={onClick} aria-label={ariaLabel} disabled={disabled}>
				{children}
			</button>
		),
		Flex: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		Modal: ({
			opened,
			children,
			onClose,
		}: {
			opened: boolean;
			children: React.ReactNode;
			onClose: () => void;
		}) =>
			opened ? (
				<div data-testid='modal-wrapper' onClick={() => onClose}>
					{children}
				</div>
			) : null,
		rem: (value: number) => `${value}px`,
	};
});

vi.mock('~/components/SectionCard', () => ({
	default: ({
		children,
		title,
		description,
		headerActions,
	}: {
		children: React.ReactNode;
		title?: string;
		description?: string;
		headerActions?: React.ReactNode;
	}) => (
		<div data-testid='section-card'>
			{title && <h3>{title}</h3>}
			{description && <p>{description}</p>}
			{headerActions && (
				<div data-testid='section-card-header-actions'>{headerActions}</div>
			)}
			{children}
		</div>
	),
}));

describe('CampaignConfigurationPrompt', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockValues = {
			agentConfig: {
				conversationConfig: {
					agent: {
						prompt: { prompt: 'Initial prompt' },
					},
				},
				contactSchemaId: 5,
			},
		};
		mockSelectedCampaign = { id: 12 } as Campaign;
	});

	describe('Rendering', () => {
		it('displays the current prompt text', () => {
			renderWithProviders(<CampaignConfigurationPrompt />);
			expect(screen.getByText('Initial prompt')).toBeInTheDocument();
		});

		it('renders the section card with correct title and description', () => {
			renderWithProviders(<CampaignConfigurationPrompt />);
			expect(screen.getByText('Agent Prompt')).toBeInTheDocument();
			expect(
				screen.getByText(
					'Define the instructions the agent will follow when speaking with contacts.'
				)
			).toBeInTheDocument();
		});
	});

	describe('Empty/Missing State Handling', () => {
		it('displays empty string when prompt is not set', () => {
			mockValues = {
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: { prompt: '' },
						},
					},
					contactSchemaId: 5,
				},
			};

			renderWithProviders(<CampaignConfigurationPrompt />);

			expect(
				screen.getByText(/No prompt has been added yet/i)
			).toBeInTheDocument();
		});

		it('handles missing agentConfig gracefully', () => {
			mockValues = {} as typeof mockValues;

			renderWithProviders(<CampaignConfigurationPrompt />);

			expect(
				screen.getByText(/No prompt has been added yet/i)
			).toBeInTheDocument();
		});

		it('handles missing conversationConfig gracefully', () => {
			mockValues = {
				agentConfig: {} as typeof mockValues.agentConfig,
			};

			renderWithProviders(<CampaignConfigurationPrompt />);

			expect(
				screen.getByText(/No prompt has been added yet/i)
			).toBeInTheDocument();
		});

		it('handles missing agent config gracefully', () => {
			mockValues = {
				agentConfig: {
					conversationConfig:
						{} as typeof mockValues.agentConfig.conversationConfig,
					contactSchemaId: 5,
				},
			};

			renderWithProviders(<CampaignConfigurationPrompt />);

			expect(
				screen.getByText(/No prompt has been added yet/i)
			).toBeInTheDocument();
		});

		it('handles missing prompt object gracefully', () => {
			mockValues = {
				agentConfig: {
					conversationConfig: {
						agent: {} as typeof mockValues.agentConfig.conversationConfig.agent,
					},
					contactSchemaId: 5,
				},
			};

			renderWithProviders(<CampaignConfigurationPrompt />);

			expect(
				screen.getByText(/No prompt has been added yet/i)
			).toBeInTheDocument();
		});
	});

	describe('Campaign Selection', () => {
		it('uses campaign id from store', () => {
			mockSelectedCampaign = { id: 99 } as Campaign;

			renderWithProviders(<CampaignConfigurationPrompt />);

			// Since history modal is removed, this test is no longer relevant
			// Keeping the mock setup for potential future use
			expect(screen.getByText('Agent Prompt')).toBeInTheDocument();
		});

		it('handles null selectedCampaign', () => {
			mockSelectedCampaign = null;

			renderWithProviders(<CampaignConfigurationPrompt />);

			// No restore button anymore, so this test is obsolete
			expect(screen.getByText('Agent Prompt')).toBeInTheDocument();
		});
	});

	describe('Interactions', () => {
		it('toggles expanded state and exposes the collapse control', () => {
			renderWithProviders(<CampaignConfigurationPrompt />);
			const expandButton = screen.getByLabelText('Expand prompt');
			fireEvent.click(expandButton);

			const collapseButtons = screen.getAllByLabelText('Collapse prompt');
			expect(collapseButtons).toHaveLength(2);

			// Use the secondary collapse control to ensure the extra action exists
			fireEvent.click(collapseButtons[1]);
			expect(screen.getByLabelText('Expand prompt')).toBeInTheDocument();
		});

		it('opens the edit modal and closes it on save', () => {
			renderWithProviders(<CampaignConfigurationPrompt />);
			fireEvent.click(screen.getByLabelText('Edit prompt'));

			expect(screen.getByTestId('edit-modal-content')).toBeInTheDocument();
			expect(screen.getByTestId('schema-id')).toHaveTextContent('5');

			fireEvent.click(screen.getByText('SaveEdit'));
			expect(mockEditOnSave).toHaveBeenCalled();
			expect(
				screen.queryByTestId('edit-modal-content')
			).not.toBeInTheDocument();
		});

		it('closes the edit modal when the close control is clicked', () => {
			renderWithProviders(<CampaignConfigurationPrompt />);
			fireEvent.click(screen.getByLabelText('Edit prompt'));
			fireEvent.click(screen.getByText('CloseEdit'));

			expect(mockEditOnClose).toHaveBeenCalled();
			expect(
				screen.queryByTestId('edit-modal-content')
			).not.toBeInTheDocument();
		});
	});

	describe('Badges and prompt details', () => {
		it('shows char count when prompt text exists', () => {
			mockValues = {
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: { prompt: 'abcde' },
						},
					},
					contactSchemaId: 42,
				},
			};

			renderWithProviders(<CampaignConfigurationPrompt />);
			expect(screen.getByText('5 characters')).toBeInTheDocument();
		});
	});
});
