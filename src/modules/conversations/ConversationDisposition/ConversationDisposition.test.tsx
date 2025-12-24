import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import ConversationDisposition from './ConversationDisposition';
import type { CallDispositionModel } from '~/models/CallDispositionModel';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: { language: 'en' },
	}),
}));

// Mock useCallDispositionByConversationId
const mockUseCallDispositionByConversationId = vi.fn();
vi.mock('~/queries/callDispositionQueries', () => ({
	useCallDispositionByConversationId: (...args: unknown[]) =>
		mockUseCallDispositionByConversationId(...args),
}));

// Mock RightSectionCard to capture props
vi.mock('~/components/RightSectionCard', () => ({
	__esModule: true,
	default: ({
		title,
		description,
		children,
	}: {
		title: string;
		description: string;
		children: React.ReactNode;
	}) => (
		<div data-testid='right-section-card'>
			<div data-testid='card-title'>{title}</div>
			<div data-testid='card-description'>{description}</div>
			<div>{children}</div>
		</div>
	),
}));

const sampleDisposition: CallDispositionModel = {
	id: 1,
	conversationId: 123,
	dispositionName: 'Interested',
	dispositionDescription: 'Customer showed interest in the product',
	callStatus: 'POSITIVE',
	requiresReschedule: false,
	rescheduleTime: 0,
	isInvalidatesNumber: false,
	isFinal: true,
	isVoiceMail: false,
	notes: 'Customer asked for a follow-up call next week',
	createdAt: '2025-01-15T10:00:00Z',
	updatedAt: '2025-01-15T10:05:00Z',
};

const renderComponent = (conversationId: string | number = 123) =>
	render(
		<MantineProvider>
			<ConversationDisposition conversationId={conversationId} />
		</MantineProvider>
	);

describe('ConversationDisposition', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		mockUseCallDispositionByConversationId.mockReturnValue({
			data: sampleDisposition,
			isLoading: false,
			isError: false,
			refetch: vi.fn(),
		});
	});

	describe('card title - must always display "disposition.title"', () => {
		it('displays "disposition.title" as title when loading', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: null,
				isLoading: true,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-title')).toHaveTextContent(
				'disposition.title'
			);
		});

		it('displays "disposition.title" as title when error occurs', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: null,
				isLoading: false,
				isError: true,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-title')).toHaveTextContent(
				'disposition.title'
			);
		});

		it('displays "disposition.title" as title when data is loaded', () => {
			renderComponent();
			expect(screen.getByTestId('card-title')).toHaveTextContent(
				'disposition.title'
			);
		});

		it('displays "disposition.title" as title with positive status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'POSITIVE' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-title')).toHaveTextContent(
				'disposition.title'
			);
		});

		it('displays "disposition.title" as title with negative status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'NEGATIVE' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-title')).toHaveTextContent(
				'disposition.title'
			);
		});

		it('displays "disposition.title" as title with neutral status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'NEUTRAL' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-title')).toHaveTextContent(
				'disposition.title'
			);
		});
	});

	describe('loading state', () => {
		it('renders loading skeleton when isLoading is true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: null,
				isLoading: true,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-description')).toHaveTextContent(
				'disposition.loading'
			);
		});
	});

	describe('error state', () => {
		it('renders error message when isError is true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: null,
				isLoading: false,
				isError: true,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-description')).toHaveTextContent(
				'disposition.failed'
			);
			expect(screen.getByText('disposition.errorMsg')).toBeInTheDocument();
		});

		it('calls refetch when Retry button is clicked', () => {
			const mockRefetch = vi.fn();
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: null,
				isLoading: false,
				isError: true,
				refetch: mockRefetch,
			});

			renderComponent();
			const retryButton = screen.getByRole('button', {
				name: /disposition.retry/i,
			});
			fireEvent.click(retryButton);
			expect(mockRefetch).toHaveBeenCalled();
		});
	});

	describe('data display', () => {
		it('displays disposition name', () => {
			renderComponent();
			expect(screen.getByText('Interested')).toBeInTheDocument();
		});

		it('displays disposition description', () => {
			renderComponent();
			expect(
				screen.getByText('Customer showed interest in the product')
			).toBeInTheDocument();
		});

		it('displays notes when available', () => {
			renderComponent();
			expect(
				screen.getByText('Customer asked for a follow-up call next week')
			).toBeInTheDocument();
			expect(screen.getByText('disposition.agentNotes')).toBeInTheDocument();
		});

		it('does not display notes section when notes are empty', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, notes: null },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.queryByText('disposition.agentNotes')
			).not.toBeInTheDocument();
		});

		it('displays "disposition.noOutcome" when dispositionName is missing', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, dispositionName: '' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.noOutcome')).toBeInTheDocument();
		});
	});

	describe('status badges', () => {
		it('displays Positive badge for positive status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'POSITIVE' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.positive')).toBeInTheDocument();
		});

		it('displays Negative badge for negative status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'NEGATIVE' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.negative')).toBeInTheDocument();
		});

		it('displays Neutral badge for neutral status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'NEUTRAL' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.neutral')).toBeInTheDocument();
		});

		it('displays Neutral badge for unknown status', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, callStatus: 'UNKNOWN' },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.neutral')).toBeInTheDocument();
		});
	});

	describe('trait badges', () => {
		it('displays Finalized badge when isFinal is true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, isFinal: true, isVoiceMail: false },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.finalized')).toBeInTheDocument();
		});

		it('displays Voicemail badge when isVoiceMail is true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, isFinal: false, isVoiceMail: true },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.voicemail')).toBeInTheDocument();
		});

		it('displays both badges when both flags are true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, isFinal: true, isVoiceMail: true },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.finalized')).toBeInTheDocument();
			expect(screen.getByText('disposition.voicemail')).toBeInTheDocument();
		});
	});

	describe('action indicators', () => {
		it('displays callback required when requiresReschedule is true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					requiresReschedule: true,
					rescheduleTime: 1800,
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText('disposition.callbackRequired')
			).toBeInTheDocument();
			expect(
				screen.getByText('30 disposition.duration.minutes')
			).toBeInTheDocument();
		});

		it('displays "disposition.duration.asap" when rescheduleTime is 0', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					requiresReschedule: true,
					rescheduleTime: 0,
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByText('disposition.duration.asap')).toBeInTheDocument();
		});

		it('displays number invalidated when isInvalidatesNumber is true', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: { ...sampleDisposition, isInvalidatesNumber: true },
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText('disposition.numberInvalidated')
			).toBeInTheDocument();
			expect(screen.getByText('disposition.doNotRetry')).toBeInTheDocument();
		});
	});

	describe('duration formatting', () => {
		it('formats days correctly', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					requiresReschedule: true,
					rescheduleTime: 86400, // 1 day
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText('1 disposition.duration.day')
			).toBeInTheDocument();
		});

		it('formats hours correctly', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					requiresReschedule: true,
					rescheduleTime: 3600, // 1 hour
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText('1 disposition.duration.hour')
			).toBeInTheDocument();
		});

		it('formats multiple days correctly', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					requiresReschedule: true,
					rescheduleTime: 172800, // 2 days
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText('2 disposition.duration.days')
			).toBeInTheDocument();
		});

		it('formats combined duration correctly', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					requiresReschedule: true,
					rescheduleTime: 90000, // 1 day and 1 hour
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(
				screen.getByText(
					'1 disposition.duration.day disposition.duration.and 1 disposition.duration.hour'
				)
			).toBeInTheDocument();
		});
	});

	describe('timestamp display', () => {
		it('displays timestamp when updatedAt is available', () => {
			renderComponent();
			// The timestamp format is "Jan 15, 10:05 AM" or similar based on locale
			expect(screen.getByTestId('card-description')).not.toHaveTextContent(
				'disposition.noUpdates'
			);
		});

		it('displays "disposition.noUpdates" when no timestamp available', () => {
			mockUseCallDispositionByConversationId.mockReturnValue({
				data: {
					...sampleDisposition,
					updatedAt: undefined,
					createdAt: undefined as unknown as string,
				},
				isLoading: false,
				isError: false,
				refetch: vi.fn(),
			});

			renderComponent();
			expect(screen.getByTestId('card-description')).toHaveTextContent(
				'disposition.noUpdates'
			);
		});
	});
});
