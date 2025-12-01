import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CampaignConfigurationPrompt from './CampaignConfigurationPrompt';

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

let mockSelectedCampaign: { id: number } | null = { id: 12 };

vi.mock('~/modules/campaigns/campaignFormFunctions', () => ({
	useCampaignFormContext: () => ({
		values: mockValues,
		setFieldValue: mockSetFieldValue,
	}),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (
		selector: (state: {
			selectedCampaign: typeof mockSelectedCampaign;
		}) => unknown
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
		onClose,
		onSave,
		initialSchemaId,
	}: {
		onClose: () => void;
		onSave: () => void;
		initialSchemaId?: number;
	}) => {
		mockEditOnClose.mockImplementation(onClose);
		mockEditOnSave.mockImplementation(onSave);
		return (
			<div data-testid='edit-modal-content'>
				EditModalContent
				<span data-testid='schema-id'>{initialSchemaId}</span>
				<button onClick={onClose}>CloseEdit</button>
				<button onClick={onSave}>SaveEdit</button>
			</div>
		);
	},
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
	}: {
		children: React.ReactNode;
		title?: string;
		description?: string;
	}) => (
		<div data-testid='section-card'>
			{title && <h3>{title}</h3>}
			{description && <p>{description}</p>}
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
		mockSelectedCampaign = { id: 12 };
	});

	describe('Rendering', () => {
		it('displays the current prompt text', () => {
			render(<CampaignConfigurationPrompt />);

			expect(screen.getByDisplayValue('Initial prompt')).toBeInTheDocument();
		});

		it('renders the section card with correct title and description', () => {
			render(<CampaignConfigurationPrompt />);

			expect(screen.getByText('Agent Prompt')).toBeInTheDocument();
			expect(
				screen.getByText(/Define the core behavior and tone of your AI agent/i)
			).toBeInTheDocument();
		});

		it('renders all action buttons', () => {
			render(<CampaignConfigurationPrompt />);

			expect(
				screen.getByRole('button', { name: /restore from history/i })
			).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /remove/i })
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

			render(<CampaignConfigurationPrompt />);

			expect(screen.getByDisplayValue('')).toBeInTheDocument();
		});

		it('handles missing agentConfig gracefully', () => {
			mockValues = {} as typeof mockValues;

			render(<CampaignConfigurationPrompt />);

			expect(screen.getByDisplayValue('')).toBeInTheDocument();
		});

		it('handles missing conversationConfig gracefully', () => {
			mockValues = {
				agentConfig: {} as typeof mockValues.agentConfig,
			};

			render(<CampaignConfigurationPrompt />);

			expect(screen.getByDisplayValue('')).toBeInTheDocument();
		});

		it('handles missing agent config gracefully', () => {
			mockValues = {
				agentConfig: {
					conversationConfig:
						{} as typeof mockValues.agentConfig.conversationConfig,
					contactSchemaId: 5,
				},
			};

			render(<CampaignConfigurationPrompt />);

			expect(screen.getByDisplayValue('')).toBeInTheDocument();
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

			render(<CampaignConfigurationPrompt />);

			expect(screen.getByDisplayValue('')).toBeInTheDocument();
		});
	});

	describe('Remove Prompt Action', () => {
		it('clears the prompt when remove is clicked', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /remove/i }));

			expect(mockSetFieldValue).toHaveBeenCalledWith(
				'agentConfig',
				expect.objectContaining({
					conversationConfig: expect.objectContaining({
						agent: expect.objectContaining({
							prompt: expect.objectContaining({ prompt: '' }),
						}),
					}),
				})
			);
		});

		it('preserves other agentConfig properties when clearing prompt', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /remove/i }));

			const call = mockSetFieldValue.mock.calls[0];
			expect(call[0]).toBe('agentConfig');
			expect(call[1]).toHaveProperty('contactSchemaId', 5);
		});
	});

	describe('History Modal', () => {
		it('opens restore history modal when restore is clicked', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);

			expect(screen.getByTestId('history-modal')).toBeInTheDocument();
			expect(screen.getByText('HistoryModal')).toBeInTheDocument();
		});

		it('passes correct campaignId to history modal', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);

			expect(screen.getByTestId('campaign-id')).toHaveTextContent('12');
		});

		it('passes current prompt text to history modal', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);

			expect(screen.getByTestId('current-prompt')).toHaveTextContent(
				'Initial prompt'
			);
		});

		it('closes history modal when close is triggered', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);
			expect(screen.getByTestId('history-modal')).toBeInTheDocument();

			fireEvent.click(screen.getByRole('button', { name: /CloseHistory/i }));
			expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
		});

		it('updates prompt when a prompt is selected from history', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);
			fireEvent.click(screen.getByRole('button', { name: /SelectPrompt/i }));

			expect(mockSetFieldValue).toHaveBeenCalledWith(
				'agentConfig',
				expect.objectContaining({
					conversationConfig: expect.objectContaining({
						agent: expect.objectContaining({
							prompt: expect.objectContaining({ prompt: 'Restored prompt' }),
						}),
					}),
				})
			);
		});

		it('closes history modal after selecting a prompt', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);
			fireEvent.click(screen.getByRole('button', { name: /SelectPrompt/i }));

			expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
		});

		it('disables restore button when no campaign is selected', () => {
			mockSelectedCampaign = null;

			render(<CampaignConfigurationPrompt />);

			const restoreButton = screen.getByRole('button', {
				name: /restore from history/i,
			});
			expect(restoreButton).toBeDisabled();
		});

		it('does not open history modal when campaign id is 0', () => {
			mockSelectedCampaign = null;

			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);

			expect(screen.queryByTestId('history-modal')).not.toBeInTheDocument();
		});
	});

	describe('Edit Modal', () => {
		it('opens edit modal when edit is clicked', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /edit/i }));

			expect(screen.getByTestId('edit-modal-content')).toBeInTheDocument();
			expect(screen.getByText('EditModalContent')).toBeInTheDocument();
		});

		it('passes initialSchemaId to edit modal', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /edit/i }));

			expect(screen.getByTestId('schema-id')).toHaveTextContent('5');
		});

		it('closes edit modal when onClose is triggered', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /edit/i }));
			expect(screen.getByTestId('edit-modal-content')).toBeInTheDocument();

			fireEvent.click(screen.getByRole('button', { name: /CloseEdit/i }));
			expect(
				screen.queryByTestId('edit-modal-content')
			).not.toBeInTheDocument();
		});

		it('closes edit modal when onSave is triggered', () => {
			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /edit/i }));
			expect(screen.getByTestId('edit-modal-content')).toBeInTheDocument();

			fireEvent.click(screen.getByRole('button', { name: /SaveEdit/i }));
			expect(
				screen.queryByTestId('edit-modal-content')
			).not.toBeInTheDocument();
		});

		it('handles undefined contactSchemaId', () => {
			mockValues = {
				agentConfig: {
					conversationConfig: {
						agent: {
							prompt: { prompt: 'Test' },
						},
					},
				} as typeof mockValues.agentConfig,
			};

			render(<CampaignConfigurationPrompt />);

			fireEvent.click(screen.getByRole('button', { name: /edit/i }));

			expect(screen.getByTestId('schema-id')).toBeEmptyDOMElement();
		});
	});

	describe('Campaign Selection', () => {
		it('uses campaign id from store', () => {
			mockSelectedCampaign = { id: 99 };

			render(<CampaignConfigurationPrompt />);

			fireEvent.click(
				screen.getByRole('button', { name: /restore from history/i })
			);

			expect(screen.getByTestId('campaign-id')).toHaveTextContent('99');
		});

		it('handles null selectedCampaign', () => {
			mockSelectedCampaign = null;

			render(<CampaignConfigurationPrompt />);

			const restoreButton = screen.getByRole('button', {
				name: /restore from history/i,
			});
			expect(restoreButton).toBeDisabled();
		});
	});
});
