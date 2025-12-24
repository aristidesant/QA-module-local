import { screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import CampaignParameters from './CampaignParameters';

const { mockUseGetCampaignScheduleSummary, mockUseCampaignsStore } = vi.hoisted(
	() => ({
		mockUseGetCampaignScheduleSummary: vi.fn(),
		mockUseCampaignsStore: vi.fn(),
	})
);

vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaignScheduleSummary: (...args: unknown[]) =>
		mockUseGetCampaignScheduleSummary(...args),
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (selector: (state: any) => any) =>
		mockUseCampaignsStore(selector),
}));

describe('CampaignParameters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
	});

	it('shows skeleton when loading', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: undefined,
			isLoading: true,
			refetch: vi.fn(),
		});
		const { container } = renderWithProviders(<CampaignParameters />);
		expect(screen.getByText('preview.parameters.title')).toBeInTheDocument();
		expect(
			container.querySelector('.mantine-Skeleton-root')
		).toBeInTheDocument();
	});

	it('renders schedule and parameters when data present', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [{ dayOfWeek: 'Monday', startHour: '09:00', endHour: '12:00' }],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: {
					id: 1,
					parameters: { callRetries: 3, voicemailDetection: true },
					status: 'PENDING',
				},
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('preview.parameters.activeWindows')
		).toBeInTheDocument();
		expect(
			screen.getByText('preview.parameters.callHandling')
		).toBeInTheDocument();
		expect(
			screen.getByText(/preview.parameters.upToTimes/)
		).toBeInTheDocument();
		expect(screen.getByText('preview.parameters.enabled')).toBeInTheDocument();
	});

	it('shows empty state when no schedules and no parameters', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('preview.parameters.noSchedules')
		).toBeInTheDocument();
	});

	it('calls refetch when clicking refresh and is not completed', () => {
		const refetch = vi.fn();
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch,
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const button = screen.getByLabelText(
			'preview.parameters.refreshParameters'
		);
		expect(button).toBeInTheDocument();
		fireEvent.click(button);
		expect(refetch).toHaveBeenCalled();
	});

	it('disables refresh when campaign is completed', () => {
		const refetch = vi.fn();
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch,
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'COMPLETED' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const button = screen.getByLabelText(
			'preview.parameters.campaignCompleted'
		);
		expect(button).toBeInTheDocument();
		expect(button).toBeDisabled();
	});

	it('formats schedule days in order and uses abbreviations', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [
				{ dayOfWeek: 'Wednesday', startHour: '09:00', endHour: '11:00' },
				{ dayOfWeek: 'Monday', startHour: '09:00', endHour: '11:00' },
				{ dayOfWeek: 'Tuesday', startHour: '09:00', endHour: '11:00' },
			],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const mon = screen.getByText('Mon');
		const tue = screen.getByText('Tue');
		const wed = screen.getByText('Wed');
		// Ensure order: Mon, Tue, Wed
		expect(
			mon.compareDocumentPosition(tue) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			tue.compareDocumentPosition(wed) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('renders empty card when no campaign is selected', () => {
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({ selectedCampaign: undefined })
		);
		renderWithProviders(<CampaignParameters />);
		expect(screen.getByText('preview.parameters.title')).toBeInTheDocument();
	});

	it('formats times in 12-hour format with AM/PM', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [{ dayOfWeek: 'Monday', startHour: '14:00', endHour: '18:30' }],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
		expect(screen.getByText(/6:30 PM/)).toBeInTheDocument();
	});

	it('formats midnight correctly', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [{ dayOfWeek: 'Monday', startHour: '00:00', endHour: '08:00' }],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(screen.getByText(/12:00 AM/)).toBeInTheDocument();
	});

	it('displays all parameter types correctly', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: {
					id: 1,
					parameters: {
						voicemailDetection: true,
						callRetries: 5,
						maxConcurrentCalls: 10,
						answerMachineDetection: false,
					},
					status: 'PENDING',
				},
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('preview.parameters.voicemailDetection')
		).toBeInTheDocument();
		expect(
			screen.getByText('preview.parameters.callRetries')
		).toBeInTheDocument();
		expect(
			screen.getByText('preview.parameters.maxConcurrentCalls')
		).toBeInTheDocument();
		expect(
			screen.getByText('preview.parameters.answerMachineDetection')
		).toBeInTheDocument();
		expect(screen.getByText('preview.parameters.enabled')).toBeInTheDocument();
		expect(screen.getByText('preview.parameters.disabled')).toBeInTheDocument();
	});

	it('shows parameter values correctly', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: {
					id: 1,
					parameters: {
						callRetries: 7,
						maxConcurrentCalls: 15,
					},
					status: 'PENDING',
				},
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('preview.parameters.upToTimes')
		).toBeInTheDocument();
		expect(screen.getByText('preview.parameters.calls')).toBeInTheDocument();
	});

	it('handles multiple schedules on same day correctly', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [
				{ dayOfWeek: 'Monday', startHour: '09:00', endHour: '12:00' },
				{ dayOfWeek: 'Monday', startHour: '13:00', endHour: '17:00' },
			],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const monElements = screen.getAllByText('Mon');
		expect(monElements.length).toBeGreaterThanOrEqual(1);
	});

	it('displays active windows count correctly', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [
				{ dayOfWeek: 'Monday', startHour: '09:00', endHour: '12:00' },
				{ dayOfWeek: 'Tuesday', startHour: '09:00', endHour: '12:00' },
				{ dayOfWeek: 'Wednesday', startHour: '09:00', endHour: '12:00' },
			],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(screen.getByText('3 preview.parameters.day')).toBeInTheDocument();
	});

	it('displays call handling settings count correctly', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: {
					id: 1,
					parameters: {
						voicemailDetection: true,
						callRetries: 3,
						maxConcurrentCalls: 10,
					},
					status: 'PENDING',
				},
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('3 preview.parameters.setting')
		).toBeInTheDocument();
	});

	it('displays singular for single setting', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: {
					id: 1,
					parameters: {
						voicemailDetection: true,
					},
					status: 'PENDING',
				},
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('1 preview.parameters.setting')
		).toBeInTheDocument();
	});

	it('filters out undefined parameters', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: {
					id: 1,
					parameters: {
						voicemailDetection: undefined,
						callRetries: 3,
						maxConcurrentCalls: undefined,
					},
					status: 'PENDING',
				},
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(
			screen.getByText('preview.parameters.callRetries')
		).toBeInTheDocument();
		expect(
			screen.queryByText('preview.parameters.voicemailDetection')
		).not.toBeInTheDocument();
		expect(
			screen.queryByText('preview.parameters.maxConcurrentCalls')
		).not.toBeInTheDocument();
	});

	it('shows correct title and description in card header', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(screen.getByText('preview.parameters.title')).toBeInTheDocument();
		expect(
			screen.getByText('preview.parameters.description')
		).toBeInTheDocument();
	});

	it('disables refresh button when loading', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: undefined,
			isLoading: true,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const button = screen.getByLabelText(
			'preview.parameters.refreshParameters'
		);
		expect(button).toBeDisabled();
	});

	it('does not prevent refetch when clicking button with pending status', () => {
		const refetch = vi.fn();
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch,
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const button = screen.getByLabelText(
			'preview.parameters.refreshParameters'
		);
		fireEvent.click(button);
		expect(refetch).toHaveBeenCalled();
	});

	it('renders all days of week in correct order', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [
				{ dayOfWeek: 'Sunday', startHour: '09:00', endHour: '12:00' },
				{ dayOfWeek: 'Friday', startHour: '09:00', endHour: '12:00' },
				{ dayOfWeek: 'Monday', startHour: '09:00', endHour: '12:00' },
			],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 1, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		const mon = screen.getByText('Mon');
		const fri = screen.getByText('Fri');
		const sun = screen.getByText('Sun');
		expect(
			mon.compareDocumentPosition(fri) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			fri.compareDocumentPosition(sun) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

	it('passes campaign id correctly to query hook', () => {
		mockUseGetCampaignScheduleSummary.mockReturnValue({
			data: [],
			isLoading: false,
			refetch: vi.fn(),
		});
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({
				selectedCampaign: { id: 42, parameters: {}, status: 'PENDING' },
			})
		);
		renderWithProviders(<CampaignParameters />);
		expect(mockUseGetCampaignScheduleSummary).toHaveBeenCalledWith('42');
	});
});

export {};
