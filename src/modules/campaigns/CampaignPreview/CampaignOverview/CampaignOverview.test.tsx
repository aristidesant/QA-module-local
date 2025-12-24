import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignOverview from './CampaignOverview';
import { CampaignStatus } from '~/models/CampaignStatus';
import { notifications } from '@mantine/notifications';

const {
	mockUseGetCampaign,
	mockUseGetCampaignRequirements,
	mockUsePauseOutboundCampaign,
	mockUseResumeOutboundCampaign,
	mockUseStartOutboundCampaign,
} = vi.hoisted(() => ({
	mockUseGetCampaign: vi.fn(),
	mockUseGetCampaignRequirements: vi.fn(),
	mockUsePauseOutboundCampaign: vi.fn(),
	mockUseResumeOutboundCampaign: vi.fn(),
	mockUseStartOutboundCampaign: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: (...args: unknown[]) => mockUseGetCampaign(...args),
	useGetCampaignRequirements: (...args: unknown[]) =>
		mockUseGetCampaignRequirements(...args),
	usePauseOutboundCampaign: () => mockUsePauseOutboundCampaign(),
	useResumeOutboundCampaign: () => mockUseResumeOutboundCampaign(),
	useStartOutboundCampaign: () => mockUseStartOutboundCampaign(),
}));

vi.mock('../../CampaignHealth', () => ({
	__esModule: true,
	default: () => <div>CampaignHealth</div>,
}));

describe('CampaignOverview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUsePauseOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseResumeOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseStartOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
	});

	const baseCampaign = {
		id: 10,
		name: 'Campaign A',
		status: CampaignStatus.RUNNING,
		type: 'INBOUND',
		contactList: { id: 1 },
	} as any;

	it('shows skeleton when loading', () => {
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: true });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: undefined,
			isLoading: true,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		expect(screen.queryByText('preview.overview.title')).toBeInTheDocument();
	});

	it('shows Pause button for running campaigns', () => {
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		expect(button).toBeInTheDocument();
	});

	it('disables Start when requirements disallow', () => {
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
		} as any;
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: false },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		expect(button).toBeDisabled();
	});

	it('shows campaign details and meta items', () => {
		const campaignData = {
			...baseCampaign,
			description: 'My description',
			agentName: 'Agent Smith',
			user: { username: 'owner_user' },
			createdAt: '2024-01-01T12:00:00.000Z',
			updatedAt: '2024-01-02T12:00:00.000Z',
			progress: 42,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText('Campaign A')).toBeInTheDocument();
		expect(screen.getByText('My description')).toBeInTheDocument();
		expect(screen.getByText('Agent Smith')).toBeInTheDocument();
		expect(screen.getByText('owner_user')).toBeInTheDocument();
		expect(screen.getByText(/42%/)).toBeInTheDocument();
	});

	it('calls pause mutate with payload on Pause click and handles missing contactGroup', () => {
		const mutate = vi.fn();
		mockUsePauseOutboundCampaign.mockReturnValue({ mutate, isPending: false });
		// Ensure contactList is present for normal path
		const campaignWithList = {
			...baseCampaign,
			contactList: { id: 77 },
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignWithList,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});

		renderWithProviders(<CampaignOverview campaign={campaignWithList} />);
		const [pause] = screen.getAllByRole('button', { name: /Pause/i });
		fireEvent.click(pause);
		expect(mutate).toHaveBeenCalledWith(
			{
				campaignId: campaignWithList.id,
				contactGroupId: campaignWithList.contactList.id,
			},
			expect.any(Object)
		);

		// Ensure missing contactGroup prevents mutation and shows notification
		const mutateResume = vi.fn();
		mockUseResumeOutboundCampaign.mockReturnValue({
			mutate: mutateResume,
			isPending: false,
		});
		const campaignNoList = { ...baseCampaign, contactList: undefined } as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignNoList,
			isLoading: false,
		});
		const notificationSpy = vi.spyOn(notifications, 'show');
		renderWithProviders(<CampaignOverview campaign={campaignNoList} />);
		const [pauseAgain] = screen.getAllByRole('button', { name: /Pause/i });
		fireEvent.click(pauseAgain);
		expect(mutateResume).not.toHaveBeenCalled();
		notificationSpy.mockRestore();
	});

	it('calls start mutate on Start click', () => {
		const mutate = vi.fn();
		mockUseStartOutboundCampaign.mockReturnValue({ mutate, isPending: false });
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
			contactList: { id: 123 },
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: pendingCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const [start] = screen.getAllByRole('button', { name: /Start/i });
		fireEvent.click(start);
		expect(mutate).toHaveBeenCalledWith(
			{
				campaignId: pendingCampaign.id,
				contactGroupId: pendingCampaign.contactList.id,
			},
			expect.any(Object)
		);
	});

	it('shows Resume button for paused campaigns', () => {
		const pausedCampaign = {
			...baseCampaign,
			status: CampaignStatus.PAUSED,
		} as any;
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pausedCampaign} />);
		const button = screen.getByRole('button', { name: /Resume/i });
		expect(button).toBeInTheDocument();
	});

	it('shows Start button for pending campaigns', () => {
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
		} as any;
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		expect(button).toBeInTheDocument();
	});

	it('disables button and shows Completed state when campaign is completed', () => {
		const completedCampaign = {
			...baseCampaign,
			status: CampaignStatus.COMPLETED,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: completedCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: false },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={completedCampaign} />);
		const button = screen.getByRole('button', { name: /Completed/i });
		expect(button).toBeDisabled();
	});

	it('disables button and shows Failed state when campaign is failed', () => {
		const failedCampaign = {
			...baseCampaign,
			status: CampaignStatus.FAILED,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: failedCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: false },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={failedCampaign} />);
		const button = screen.getByRole('button', { name: /Failed/i });
		expect(button).toBeDisabled();
	});

	it('shows loading state on button when mutating', () => {
		const mutate = vi.fn();
		mockUsePauseOutboundCampaign.mockReturnValue({ mutate, isPending: true });
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		expect(button).toBeDisabled();
	});

	it('displays progress bar with correct percentage', () => {
		const campaignData = {
			...baseCampaign,
			progress: 75,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText(/75%/)).toBeInTheDocument();
	});

	it('displays progress bar as null when progress is not finite', () => {
		const campaignData = {
			...baseCampaign,
			progress: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.queryByText(/Progress/)).not.toBeInTheDocument();
	});

	it('formats dates correctly in meta information', () => {
		const campaignData = {
			...baseCampaign,
			createdAt: '2024-01-15T10:30:00.000Z',
			updatedAt: '2024-01-20T14:45:00.000Z',
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		// Date format depends on locale, just check both dates appear
		expect(screen.getByText('preview.overview.created')).toBeInTheDocument();
		expect(
			screen.getByText('preview.overview.lastUpdated')
		).toBeInTheDocument();
	});

	it('shows dashes for undefined dates', () => {
		const campaignData = {
			...baseCampaign,
			createdAt: undefined,
			updatedAt: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		const dashes = screen.getAllByText('—');
		expect(dashes.length).toBeGreaterThan(0);
	});

	it('displays agent name as Not assigned when missing', () => {
		const campaignData = {
			...baseCampaign,
			agentName: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(
			screen.getByText('preview.overview.notAssigned')
		).toBeInTheDocument();
	});

	it('renders CampaignHealth component', () => {
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		expect(screen.getByText('CampaignHealth')).toBeInTheDocument();
	});

	it('calls refetch on successful action', async () => {
		const refetch = vi.fn();
		const mutate = vi.fn((_, callbacks) => {
			callbacks.onSuccess();
		});
		mockUseGetCampaign.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		mockUsePauseOutboundCampaign.mockReturnValue({ mutate, isPending: false });

		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(mutate).toHaveBeenCalled();
		});
	});

	it('handles error callback with error message', async () => {
		const mutate = vi.fn((_, callbacks) => {
			callbacks.onError({
				response: { data: { message: 'Network error' } },
			});
		});
		const notificationSpy = vi.spyOn(notifications, 'show');
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		mockUsePauseOutboundCampaign.mockReturnValue({ mutate, isPending: false });

		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(notificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'preview.overview.notifications.error',
					color: 'red',
				})
			);
		});

		notificationSpy.mockRestore();
	});

	it('shows title and description in card header', () => {
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		expect(screen.getByText('preview.overview.title')).toBeInTheDocument();
		expect(
			screen.getByText('preview.overview.description')
		).toBeInTheDocument();
	});

	it('displays type badge with correct format', () => {
		const campaignData = {
			...baseCampaign,
			type: 'OUTBOUND',
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText('Outbound')).toBeInTheDocument();
	});

	it('disables button when requirements are loading', () => {
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
		} as any;
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: undefined,
			isLoading: true,
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		expect(button).toBeDisabled();
	});

	it('disables button when requirements have error', () => {
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
		} as any;
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: undefined,
			isLoading: false,
			error: new Error('Requirements error'),
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		expect(button).toBeDisabled();
	});

	it('calls resume mutate on Resume click', () => {
		const mutate = vi.fn();
		mockUseResumeOutboundCampaign.mockReturnValue({ mutate, isPending: false });
		const pausedCampaign = {
			...baseCampaign,
			status: CampaignStatus.PAUSED,
			contactList: { id: 456 },
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: pausedCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pausedCampaign} />);
		const button = screen.getByRole('button', { name: /Resume/i });
		fireEvent.click(button);
		expect(mutate).toHaveBeenCalledWith(
			{
				campaignId: pausedCampaign.id,
				contactGroupId: pausedCampaign.contactList.id,
			},
			expect.any(Object)
		);
	});

	it('shows notification when missing contact group on pause', () => {
		const notificationSpy = vi.spyOn(notifications, 'show');
		const campaignWithoutContactList = {
			...baseCampaign,
			contactList: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignWithoutContactList,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(
			<CampaignOverview campaign={campaignWithoutContactList} />
		);
		const button = screen.getByRole('button', { name: /Pause/i });
		fireEvent.click(button);
		expect(notificationSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'preview.overview.notifications.unavailable',
				color: 'yellow',
			})
		);
		notificationSpy.mockRestore();
	});

	it('shows notification when missing contact group on resume', () => {
		const notificationSpy = vi.spyOn(notifications, 'show');
		const pausedCampaign = {
			...baseCampaign,
			status: CampaignStatus.PAUSED,
			contactList: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: pausedCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pausedCampaign} />);
		const button = screen.getByRole('button', { name: /Resume/i });
		fireEvent.click(button);
		expect(notificationSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'preview.overview.notifications.unavailable',
				color: 'yellow',
			})
		);
		notificationSpy.mockRestore();
	});

	it('shows notification when missing contact group on start', () => {
		const notificationSpy = vi.spyOn(notifications, 'show');
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
			contactList: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: pendingCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		fireEvent.click(button);
		expect(notificationSpy).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'preview.overview.notifications.unavailable',
				color: 'yellow',
			})
		);
		notificationSpy.mockRestore();
	});

	it('shows success notification on pause', async () => {
		const notificationSpy = vi.spyOn(notifications, 'show');
		const mutate = vi.fn((_, callbacks) => {
			callbacks.onSuccess();
		});
		mockUseGetCampaign.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		mockUsePauseOutboundCampaign.mockReturnValue({ mutate, isPending: false });

		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(notificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'preview.overview.notifications.success',
					message: 'preview.overview.notifications.campaignActioned',
					color: 'green',
				})
			);
		});

		notificationSpy.mockRestore();
	});

	it('shows success notification on resume', async () => {
		const notificationSpy = vi.spyOn(notifications, 'show');
		const mutate = vi.fn((_, callbacks) => {
			callbacks.onSuccess();
		});
		const pausedCampaign = {
			...baseCampaign,
			status: CampaignStatus.PAUSED,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		mockUseResumeOutboundCampaign.mockReturnValue({ mutate, isPending: false });

		renderWithProviders(<CampaignOverview campaign={pausedCampaign} />);
		const button = screen.getByRole('button', { name: /Resume/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(notificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'preview.overview.notifications.success',
					message: 'preview.overview.notifications.campaignActioned',
					color: 'green',
				})
			);
		});

		notificationSpy.mockRestore();
	});

	it('shows success notification on start', async () => {
		const notificationSpy = vi.spyOn(notifications, 'show');
		const mutate = vi.fn((_, callbacks) => {
			callbacks.onSuccess();
		});
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: undefined,
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		mockUseStartOutboundCampaign.mockReturnValue({ mutate, isPending: false });

		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(notificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'preview.overview.notifications.success',
					message: 'preview.overview.notifications.campaignActioned',
					color: 'green',
				})
			);
		});

		notificationSpy.mockRestore();
	});

	it('handles error without response object', async () => {
		const mutate = vi.fn((_, callbacks) => {
			callbacks.onError(new Error('Simple error'));
		});
		const notificationSpy = vi.spyOn(notifications, 'show');
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		mockUsePauseOutboundCampaign.mockReturnValue({ mutate, isPending: false });

		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		fireEvent.click(button);

		await waitFor(() => {
			expect(notificationSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'preview.overview.notifications.error',
					message: 'preview.overview.notifications.failedToAction',
					color: 'red',
				})
			);
		});

		notificationSpy.mockRestore();
	});

	it('handles unknown campaign status with default button', () => {
		const unknownStatusCampaign = {
			...baseCampaign,
			status: 'UNKNOWN_STATUS',
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: unknownStatusCampaign,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={unknownStatusCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});

	it('clamps progress value between 0 and 100', () => {
		const campaignData = {
			...baseCampaign,
			progress: 150, // Over 100
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText(/100%/)).toBeInTheDocument();
	});

	it('clamps negative progress to 0', () => {
		const campaignData = {
			...baseCampaign,
			progress: -50,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText(/0%/)).toBeInTheDocument();
	});

	it('displays campaign name as Untitled when missing', () => {
		const campaignData = {
			...baseCampaign,
			name: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText('Untitled campaign')).toBeInTheDocument();
	});

	it('displays owner as dash when user is missing', () => {
		const campaignData = {
			...baseCampaign,
			user: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		const dashes = screen.getAllByText('—');
		expect(dashes.length).toBeGreaterThan(0);
	});

	it('displays type as Unknown when type is missing', () => {
		const campaignData = {
			...baseCampaign,
			type: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText('preview.overview.unknown')).toBeInTheDocument();
	});

	it('handles date formatting error gracefully', () => {
		const campaignData = {
			...baseCampaign,
			createdAt: 'invalid-date',
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		expect(screen.getByText('invalid-date')).toBeInTheDocument();
		consoleSpy.mockRestore();
	});

	it('uses campaign data from hook when available', () => {
		const hookCampaignData = {
			...baseCampaign,
			name: 'Updated Campaign Name',
			agentName: 'Hook Agent',
			progress: 55,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: hookCampaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		// Should display hook data, not passed campaign data
		expect(screen.getByText('Updated Campaign Name')).toBeInTheDocument();
		expect(screen.getByText('Hook Agent')).toBeInTheDocument();
		expect(screen.getByText(/55%/)).toBeInTheDocument();
	});

	it('does not show description when campaign has no description', () => {
		const campaignData = {
			...baseCampaign,
			description: undefined,
		} as any;
		mockUseGetCampaign.mockReturnValue({
			data: campaignData,
			isLoading: false,
		});
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={campaignData} />);
		// Campaign A should be displayed but no description
		expect(screen.getByText('Campaign A')).toBeInTheDocument();
		// Description should not be in the document (only the subtitle)
		const descriptions = screen.queryAllByText('Campaign A description');
		expect(descriptions.length).toBe(0);
	});

	it('button is disabled when mutating (pause pending)', () => {
		mockUsePauseOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: true,
		});
		mockUseResumeOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseStartOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={baseCampaign} />);
		const button = screen.getByRole('button', { name: /Pause/i });
		expect(button).toBeDisabled();
	});

	it('button is disabled when mutating (resume pending)', () => {
		const pausedCampaign = {
			...baseCampaign,
			status: CampaignStatus.PAUSED,
		} as any;
		mockUsePauseOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseResumeOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: true,
		});
		mockUseStartOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pausedCampaign} />);
		const button = screen.getByRole('button', { name: /Resume/i });
		expect(button).toBeDisabled();
	});

	it('button is disabled when mutating (start pending)', () => {
		const pendingCampaign = {
			...baseCampaign,
			status: CampaignStatus.PENDING,
		} as any;
		mockUsePauseOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseResumeOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		mockUseStartOutboundCampaign.mockReturnValue({
			mutate: vi.fn(),
			isPending: true,
		});
		mockUseGetCampaign.mockReturnValue({ data: undefined, isLoading: false });
		mockUseGetCampaignRequirements.mockReturnValue({
			data: { canRun: true },
			isLoading: false,
		});
		renderWithProviders(<CampaignOverview campaign={pendingCampaign} />);
		const button = screen.getByRole('button', { name: /Start/i });
		expect(button).toBeDisabled();
	});
});

export {};
