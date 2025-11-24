import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CampaignContactListPage from './CampaignContactListPage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { useGetContactGroup } from '~/queries/contactGroupQueries';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
} from '~/queries/campaignsQueries';
import { useCampaignContactListStore } from '~/stores/campaignContactListStore';
import { useNavigate, useParams } from 'react-router';
import { modals } from '@mantine/modals';

// Mock dependencies
vi.mock('react-router', () => ({
	useNavigate: vi.fn(),
	useParams: vi.fn(),
}));

vi.mock('~/queries/contactGroupQueries', () => ({
	useGetContactGroup: vi.fn(),
}));

vi.mock('~/queries/campaignsQueries', () => ({
	useStartOutboundCampaign: vi.fn(),
	usePauseOutboundCampaign: vi.fn(),
	useResumeOutboundCampaign: vi.fn(),
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

	it('renders success state and child components', () => {
		const mockData = { id: 1, name: 'Test List', queueStatus: 'PENDING' };
		(useGetContactGroup as any).mockReturnValue({
			isLoading: false,
			data: mockData,
		});

		renderWithProviders(<CampaignContactListPage />);

		expect(screen.getByText('Test List')).toBeInTheDocument();
		expect(screen.getByTestId('contact-list-info')).toBeInTheDocument();
		expect(screen.getByTestId('contact-list-metrics')).toBeInTheDocument();
		expect(screen.getByTestId('conversations-list')).toBeInTheDocument();
		expect(screen.getByTestId('contacts-table')).toBeInTheDocument();
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
