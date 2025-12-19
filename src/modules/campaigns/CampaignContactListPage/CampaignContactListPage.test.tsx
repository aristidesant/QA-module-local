import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignContactListPage from './CampaignContactListPage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useGetContactGroup } from '~/queries/contactGroupQueries';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
	useGetCampaign,
} from '~/queries/campaignsQueries';
import { useCampaignContactListStore } from '~/stores/campaignContactListStore';
import { useNavigate, useParams } from 'react-router';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '~/utils/httpClient';

// Mock dependencies
vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

vi.mock('~/hooks/usePermissions', () => ({
	__esModule: true,
	default: () => ({
		canPerformAction: () => true,
		canAccessModule: () => true,
	}),
}));

vi.mock('~/queries/contactGroupQueries', () => ({
	useGetContactGroup: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useStartOutboundCampaign: vi.fn(),
	usePauseOutboundCampaign: vi.fn(),
	useResumeOutboundCampaign: vi.fn(),
	useGetCampaign: vi.fn(),
}));

vi.mock('~/stores/campaignContactListStore', () => ({
	useCampaignContactListStore: vi.fn(),
}));

vi.mock('@mantine/modals', () => ({
	modals: {
		openConfirmModal: vi.fn(),
	},
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('~/utils/httpClient', () => ({
	getErrorMessage: vi.fn((error: any) => error?.message || 'Error'),
}));

// Mock child components
vi.mock('./ContactGroupSummary', () => ({
	default: () => <div data-testid='contact-group-summary'>Summary</div>,
}));
vi.mock('./ContactGroupContactsTable', () => ({
	default: () => <div data-testid='contacts-table'>Contacts Table</div>,
}));
vi.mock('./ContactListInformation', () => ({
	default: () => <div data-testid='contact-list-info'>Info</div>,
}));
vi.mock('./ContactListMetrics', () => ({
	default: () => <div data-testid='contact-list-metrics'>Metrics</div>,
}));
vi.mock('~/modules/conversations/ConversationsList', () => ({
	default: () => <div data-testid='conversations-list'>Conversations</div>,
}));
vi.mock('~/modules/conversations/ConversationDetails', () => ({
	default: () => <div data-testid='conversation-details'>Details</div>,
}));
vi.mock('./ContactGroupContactsTable/FaultyPhonesAlert', () => ({
	default: () => <div data-testid='faulty-phones-alert'>Alert</div>,
}));

describe('CampaignContactListPage', () => {
	const mockNavigate = vi.fn();
	const mockSetRightComponent = vi.fn();
	const mockMutate = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		(useNavigate as any).mockReturnValue(mockNavigate);
		(useParams as any).mockReturnValue({
			contactGroupId: '1',
			campaignId: '10',
		});
		(useCampaignContactListStore as any).mockReturnValue({
			setRightComponent: mockSetRightComponent,
			rightComponent: null,
		});
		(useGetCampaign as any).mockReturnValue({
			data: { id: 10, name: 'Test Campaign' },
		});
		(useStartOutboundCampaign as any).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
		});
		(usePauseOutboundCampaign as any).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
		});
		(useResumeOutboundCampaign as any).mockReturnValue({
			mutate: mockMutate,
			isPending: false,
		});
	});

	it('renders loading state', () => {
		(useGetContactGroup as any).mockReturnValue({ isLoading: true });
		renderWithProviders(<CampaignContactListPage />);
		expect(screen.getByText('Loading Contact List')).toBeInTheDocument();
	});

	it('renders error state', () => {
		(useGetContactGroup as any).mockReturnValue({
			isLoading: false,
			isError: true,
		});
		renderWithProviders(<CampaignContactListPage />);
		expect(screen.getByText('Contact List Unavailable')).toBeInTheDocument();
	});

	it('renders invalid ID state', () => {
		(useParams as any).mockReturnValue({ contactGroupId: 'invalid' });
		renderWithProviders(<CampaignContactListPage />);
		expect(screen.getByText('Contact List Not Found')).toBeInTheDocument();
	});

	describe('Tabs visibility and navigation', () => {
		const mockData = { id: 1, name: 'Test List', queueStatus: 'PENDING' };

		beforeEach(() => {
			(useGetContactGroup as any).mockReturnValue({
				isLoading: false,
				data: mockData,
			});
		});

		it('renders all tab headers', () => {
			renderWithProviders(<CampaignContactListPage />);

			expect(
				screen.getByRole('tab', { name: /overview/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('tab', { name: /conversations/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('tab', { name: /contacts/i })
			).toBeInTheDocument();
		});

		it('renders Overview tab content by default and hides other tabs content', () => {
			renderWithProviders(<CampaignContactListPage />);

			// Overview tab content should be visible
			expect(screen.getByTestId('contact-list-info')).toBeInTheDocument();
			expect(screen.getByTestId('contact-list-metrics')).toBeInTheDocument();

			// Other tabs content should NOT be visible (keepMounted={false})
			expect(
				screen.queryByTestId('conversations-list')
			).not.toBeInTheDocument();
			expect(screen.queryByTestId('contacts-table')).not.toBeInTheDocument();
			expect(
				screen.queryByTestId('faulty-phones-alert')
			).not.toBeInTheDocument();
		});

		it('shows Conversations tab content and hides others when clicking Conversations tab', () => {
			renderWithProviders(<CampaignContactListPage />);

			const conversationsTab = screen.getByRole('tab', {
				name: /conversations/i,
			});
			fireEvent.click(conversationsTab);

			// Conversations tab content should be visible
			expect(screen.getByTestId('conversations-list')).toBeInTheDocument();

			// Overview tab content should NOT be visible
			expect(screen.queryByTestId('contact-list-info')).not.toBeInTheDocument();
			expect(
				screen.queryByTestId('contact-list-metrics')
			).not.toBeInTheDocument();

			// Contacts tab content should NOT be visible
			expect(screen.queryByTestId('contacts-table')).not.toBeInTheDocument();
			expect(
				screen.queryByTestId('faulty-phones-alert')
			).not.toBeInTheDocument();
		});

		it('shows Contacts tab content and hides others when clicking Contacts tab', () => {
			renderWithProviders(<CampaignContactListPage />);

			const contactsTab = screen.getByRole('tab', { name: /contacts/i });
			fireEvent.click(contactsTab);

			// Contacts tab content should be visible
			expect(screen.getByTestId('contacts-table')).toBeInTheDocument();
			expect(screen.getByTestId('faulty-phones-alert')).toBeInTheDocument();

			// Overview tab content should NOT be visible
			expect(screen.queryByTestId('contact-list-info')).not.toBeInTheDocument();
			expect(
				screen.queryByTestId('contact-list-metrics')
			).not.toBeInTheDocument();

			// Conversations tab content should NOT be visible
			expect(
				screen.queryByTestId('conversations-list')
			).not.toBeInTheDocument();
		});

		it('can navigate between tabs correctly', () => {
			renderWithProviders(<CampaignContactListPage />);

			// Start at Overview (default)
			expect(screen.getByTestId('contact-list-info')).toBeInTheDocument();

			// Navigate to Conversations
			fireEvent.click(screen.getByRole('tab', { name: /conversations/i }));
			expect(screen.getByTestId('conversations-list')).toBeInTheDocument();
			expect(screen.queryByTestId('contact-list-info')).not.toBeInTheDocument();

			// Navigate to Contacts
			fireEvent.click(screen.getByRole('tab', { name: /contacts/i }));
			expect(screen.getByTestId('contacts-table')).toBeInTheDocument();
			expect(
				screen.queryByTestId('conversations-list')
			).not.toBeInTheDocument();

			// Navigate back to Overview
			fireEvent.click(screen.getByRole('tab', { name: /overview/i }));
			expect(screen.getByTestId('contact-list-info')).toBeInTheDocument();
			expect(screen.queryByTestId('contacts-table')).not.toBeInTheDocument();
		});

		it('renders campaign name in success state', () => {
			renderWithProviders(<CampaignContactListPage />);
			expect(screen.getByText('Test Campaign')).toBeInTheDocument();
		});
	});

	it('handles start campaign action', async () => {
		const mockData = {
			id: 1,
			name: 'Test List',
			queueStatus: 'PENDING',
			schedule: { campaignId: 10 },
		};
		(useGetContactGroup as any).mockReturnValue({
			isLoading: false,
			data: mockData,
		});
		(modals.openConfirmModal as any).mockImplementation(({ onConfirm }: any) =>
			onConfirm()
		);

		renderWithProviders(<CampaignContactListPage />);

		const startButton = screen.getByText('Start Campaign');
		fireEvent.click(startButton);

		await waitFor(() => {
			expect(modals.openConfirmModal).toHaveBeenCalled();
			expect(mockMutate).toHaveBeenCalled();
		});
	});

	it('shows error notification when start campaign fails', async () => {
		const mockData = {
			id: 1,
			name: 'Test List',
			queueStatus: 'PENDING',
			schedule: { campaignId: 10 },
		};
		(useGetContactGroup as any).mockReturnValue({
			isLoading: false,
			data: mockData,
		});
		(modals.openConfirmModal as any).mockImplementation(({ onConfirm }: any) =>
			onConfirm()
		);

		const apiError = {
			response: {
				data: {
					message: 'No contacts with available phone numbers found',
				},
			},
		};

		(mockMutate as any).mockImplementation((_payload: any, options: any) => {
			options.onError(apiError);
		});

		(getErrorMessage as any).mockReturnValue(apiError.response.data.message);

		renderWithProviders(<CampaignContactListPage />);

		const startButton = screen.getByText('Start Campaign');
		fireEvent.click(startButton);

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error',
					message: apiError.response.data.message,
					color: 'red',
				})
			);
			expect(getErrorMessage).toHaveBeenCalledWith(apiError);
		});
	});

	it('handles pause campaign action', async () => {
		const mockData = {
			id: 1,
			name: 'Test List',
			queueStatus: 'RUNNING',
			schedule: { campaignId: 10 },
		};
		(useGetContactGroup as any).mockReturnValue({
			isLoading: false,
			data: mockData,
		});
		(modals.openConfirmModal as any).mockImplementation(({ onConfirm }: any) =>
			onConfirm()
		);

		renderWithProviders(<CampaignContactListPage />);

		const pauseButton = screen.getByText('Pause Campaign');
		fireEvent.click(pauseButton);

		await waitFor(() => {
			expect(modals.openConfirmModal).toHaveBeenCalled();
			expect(mockMutate).toHaveBeenCalled();
		});
	});
});
