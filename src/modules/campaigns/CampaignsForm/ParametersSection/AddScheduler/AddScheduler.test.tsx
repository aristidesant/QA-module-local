import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import AddScheduler from './AddScheduler';

const {
	mockUseCampaignsStore,
	mockUseCampaignSchedules,
	mockRefetch,
	mockModalsOpen,
	mockModalsClose,
} = vi.hoisted(() => ({
	mockUseCampaignsStore: vi.fn(),
	mockUseCampaignSchedules: vi.fn(),
	mockRefetch: vi.fn(),
	mockModalsOpen: vi.fn(),
	mockModalsClose: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: { open: mockModalsOpen, close: mockModalsClose },
}));

vi.mock('~/stores/campaignsStore', () => ({
	useCampaignsStore: (selector: any) => mockUseCampaignsStore(selector),
}));

vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignSchedules: (...args: unknown[]) =>
		mockUseCampaignSchedules(...args),
}));

describe('AddScheduler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({ selectedCampaign: { id: 99 } })
		);
		mockUseCampaignSchedules.mockReturnValue({ refetch: mockRefetch });
	});

	it('renders button and opens modal with expected args', () => {
		renderWithProviders(<AddScheduler />);

		expect(screen.getByRole('button', { name: /add schedule/i })).toBeVisible();

		fireEvent.click(screen.getByRole('button', { name: /add schedule/i }));

		expect(mockModalsOpen).toHaveBeenCalledTimes(1);

		const modalConfig = (mockModalsOpen as unknown as Mock).mock.calls[0][0];
		expect(modalConfig).toEqual(
			expect.objectContaining({
				modalId: 'add-schedule-modal',
				title: 'Add Predefined Schedule',
				centered: true,
				size: '60%',
			})
		);

		// children is the AddShedulerForm element; ensure campaignId prop is passed
		expect(modalConfig.children.props.campaignId).toBe(99);
	});

	it('calls refetch and closes modal when AddShedulerForm onSuccess is called', () => {
		renderWithProviders(<AddScheduler handleReload={mockRefetch} />);

		fireEvent.click(screen.getByRole('button', { name: /add schedule/i }));
		const modalConfig = (mockModalsOpen as unknown as Mock).mock.calls[0][0];

		modalConfig.children.props.onSuccess();

		expect(mockRefetch).toHaveBeenCalled();
		expect(mockModalsClose).toHaveBeenCalledWith('add-schedule-modal');
	});

	it('calls close when AddShedulerForm onCancel is called', () => {
		renderWithProviders(<AddScheduler />);

		fireEvent.click(screen.getByRole('button', { name: /add schedule/i }));
		const modalConfig = (mockModalsOpen as unknown as Mock).mock.calls[0][0];

		modalConfig.children.props.onCancel();

		expect(mockModalsClose).toHaveBeenCalledWith('add-schedule-modal');
	});

	it('disables the add schedule button when no campaign is selected', () => {
		// Simulate no selected campaign in the store
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({ selectedCampaign: null })
		);

		renderWithProviders(<AddScheduler />);

		const btn = screen.getByRole('button', { name: /add schedule/i });
		expect(btn).toBeDisabled();
	});

	it('uses passed campaignId prop when provided', () => {
		vi.clearAllMocks();
		// Provide no selected campaign but pass campaignId prop directly
		mockUseCampaignsStore.mockImplementation((selector: any) =>
			selector({ selectedCampaign: null })
		);

		renderWithProviders(<AddScheduler campaignId={42} />);

		const btn = screen.getByRole('button', { name: /add schedule/i });
		expect(btn).not.toBeDisabled();

		fireEvent.click(btn);
		const modalConfig = (mockModalsOpen as unknown as Mock).mock.calls[0][0];
		expect(modalConfig.children.props.campaignId).toBe(42);
	});
});
