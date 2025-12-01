import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AgentCampaignPreview from './AgentCampaignPreview';

const mockUseGetAgent = vi.fn();
const mockMutate = vi.fn();
const mockSetRightComponent = vi.fn();
const mockOpenConfirmModal = vi.fn((options: any) => options?.onConfirm?.());

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Loader: () => <div data-testid='loader' />,
		Button: ({
			children,
			onClick,
			disabled,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			disabled?: boolean;
		}) => (
			<button onClick={onClick} disabled={disabled}>
				{children}
			</button>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Text: ({ children }: { children: React.ReactNode }) => (
			<span>{children}</span>
		),
		ActionIcon: ({
			children,
			onClick,
			'aria-label': ariaLabel,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			'aria-label'?: string;
		}) => (
			<button aria-label={ariaLabel} onClick={onClick}>
				{children}
			</button>
		),
		Tooltip: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

vi.mock('@mantine/modals', () => ({
	modals: { open: vi.fn(), close: vi.fn() },
	openConfirmModal: (...args: [unknown]) => mockOpenConfirmModal(...args),
}));

vi.mock('~/queries/agentQueries', () => ({
	useGetAgent: (...args: any[]) => mockUseGetAgent(...args),
}));

vi.mock('~/queries/campaignAgentsQueries', () => ({
	useDeleteCampaignAgent: () => ({
		mutate: mockMutate,
		isPending: false,
	}),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (selector: any = (state: any) => state) =>
		selector({ setRightComponent: mockSetRightComponent }),
}));

vi.mock('../AgentCampaignList', () => ({
	default: () => <div>AgentCampaignListMock</div>,
}));

vi.mock(
	'~/modules/campaigns/CampaignsForm/AgentSection/AgentCampaignPreview/AgentProfile',
	() => ({
		default: ({ agent }: { agent: { name?: string } }) => (
			<div>Profile-{agent?.name}</div>
		),
	})
);

vi.mock('~/components/VoicePlayer', () => ({
	VoicePlayer: ({ voiceName }: { voiceName?: string }) => (
		<div>Voice-{voiceName}</div>
	),
}));

vi.mock('~/components/RightSectionCard', () => ({
	default: ({
		children,
		rightSection,
	}: {
		children: React.ReactNode;
		rightSection?: React.ReactNode;
	}) => (
		<div>
			{rightSection ? <div>{rightSection}</div> : null}
			{children}
		</div>
	),
}));

describe('AgentCampaignPreview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		agentId: 'agent-1',
		campaignAgentId: 3,
		campaignId: 9,
	};

	it('renders loader when agent data is loading', () => {
		mockUseGetAgent.mockReturnValue({
			data: undefined,
			isLoading: true,
			refetch: vi.fn(),
		});

		renderWithProviders(<AgentCampaignPreview {...defaultProps} />);

		expect(screen.getByTestId('loader')).toBeInTheDocument();
	});

	it('shows agent information and handles deletion flow', async () => {
		mockUseGetAgent.mockReturnValue({
			data: {
				name: 'Test Agent',
				voice: { name: 'Voice One', previewUrl: 'url' },
				config: { conversationConfig: { tts: { voiceId: 'v1' } } },
			},
			isLoading: false,
			refetch: vi.fn(),
		});

		renderWithProviders(<AgentCampaignPreview {...defaultProps} />);

		expect(screen.getByText('Profile-Test Agent')).toBeVisible();

		await userEvent.click(
			screen.getByRole('button', { name: /Remove Agent from campaign/i })
		);

		expect(mockOpenConfirmModal).toHaveBeenCalled();
		expect(mockMutate).toHaveBeenCalledWith(
			{ campaignId: 9, id: 3 },
			expect.objectContaining({
				onSuccess: expect.any(Function),
			})
		);

		mockMutate.mock.calls[0][1].onSuccess?.();
		expect(mockSetRightComponent).toHaveBeenCalled();
	});

	it('opens voice edit modal and triggers refetch on success', async () => {
		const refetch = vi.fn();

		mockUseGetAgent.mockReturnValue({
			data: {
				name: 'Voice Agent',
				voice: { name: 'Voice One', previewUrl: 'url', id: 'voice-123' },
				config: { conversationConfig: { tts: { voiceId: 'voice-999' } } },
			},
			isLoading: false,
			refetch,
		});

		renderWithProviders(<AgentCampaignPreview {...defaultProps} />);

		await userEvent.click(
			screen.getByRole('button', { name: /Edit agent voice/i })
		);

		const { modals } = await import('@mantine/modals');
		expect(modals.open).toHaveBeenCalledWith(
			expect.objectContaining({
				modalId: 'agent-voice-edit-modal',
				title: 'Change Agent Voice',
			})
		);

		const openCall = (modals.open as unknown as Mock).mock.calls[0]?.[0];
		const modalChildren = openCall?.children;

		if (React.isValidElement(modalChildren)) {
			(modalChildren.props as any).onSuccess?.();
		}

		expect(refetch).toHaveBeenCalled();
	});
});
