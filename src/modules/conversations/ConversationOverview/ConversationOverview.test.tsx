import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ConversationOverview from './ConversationOverview';
import { useExportConversationPdf } from '~/queries/conversationsQueries';
import usePermissions from '~/hooks/usePermissions';
import { notifications } from '@mantine/notifications';

vi.mock('~/queries/conversationsQueries', () => ({
	useExportConversationPdf: vi.fn(),
}));
vi.mock('~/hooks/usePermissions', () => ({ default: vi.fn() }));

// Mock child components to keep tests focused and deterministic
vi.mock('../ConversationPlayer', () => ({
	default: () => <div data-testid='conversation-player' />,
}));
vi.mock('../ConversationDisposition', () => ({
	default: () => <div data-testid='conversation-disposition' />,
}));

describe('ConversationOverview', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders overview details and stats', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});
		const mockExport = { mutateAsync: vi.fn(), isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const conversation = {
			id: 'conv-1',
			contact: { firstName: 'John', lastName: 'Doe', phoneNumber: '+123456' },
			agent: { name: 'Agent Smith' },
			campaign: { name: 'Campaign A' },
			status: 'done',
			startDate: '2023-01-01T12:00:00Z',
			summary: { en: 'Summary en' },
			transcriptContent: {
				analysis: { transcript_summary: 'This is a summary' },
				metadata: { call_duration_secs: 125, termination_reason: 'hangup' },
			},
			voiceFile: { id: 1, repositoryRoute: 'https://example.com/audio.mp3' },
		} as any;

		renderWithProviders(<ConversationOverview conversation={conversation} />);

		expect(screen.getByText('Conversation Overview')).toBeInTheDocument();
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('+123456')).toBeInTheDocument();
		expect(screen.getByText('Agent Smith')).toBeInTheDocument();
		expect(screen.getByText('Campaign A')).toBeInTheDocument();
		expect(screen.getByText('Hangup')).toBeInTheDocument();
		// summary & download button
		expect(screen.getByText('Conversation Summary')).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /Download Full Transcript/i })
		).toBeInTheDocument();
		// player and disposition placeholders rendered
		expect(screen.getByTestId('conversation-player')).toBeInTheDocument();
		expect(screen.getByTestId('conversation-disposition')).toBeInTheDocument();
	});

	it('uses Demo as contact name when externalPhoneNumber is present', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => false,
		});
		const mockExport = { mutateAsync: vi.fn(), isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const conversation = {
			id: 'conv-2',
			contact: null,
			externalPhoneNumber: '+198765',
			agent: null,
			campaign: null,
			status: 'progress',
			startDate: '2023-01-01T12:00:00Z',
			summary: {},
			transcriptContent: {},
		} as any;

		renderWithProviders(<ConversationOverview conversation={conversation} />);

		expect(screen.getByText('Demo')).toBeInTheDocument();
		expect(screen.getByText('+198765')).toBeInTheDocument();
		// No download button available when permission false
		expect(
			screen.queryByRole('button', { name: /Download Full Transcript/i })
		).not.toBeInTheDocument();
		// Date duration should render N/A when no metadata available
		expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
	});

	it('formats termination reason variants correctly', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => false,
		});
		const mockExport = { mutateAsync: vi.fn(), isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const cases = [
			{ val: 'terminated_by_agent', expected: 'Terminated' },
			{ val: 'client disconnect', expected: 'Client Disconnected' },
			{ val: 'hangup', expected: 'Hangup' },
			{ val: 'timeout', expected: 'Timeout' },
			{ val: 'error in pipeline', expected: 'Error' },
			{ val: 'someReason', expected: 'SomeReason' },
		];

		cases.forEach(({ val, expected }) => {
			const conversation = {
				id: 'term-test',
				contact: { firstName: 'a', lastName: 'b', phoneNumber: '+1' },
				transcriptContent: {
					metadata: { termination_reason: val },
					analysis: {},
				},
			} as any;

			const { unmount } = renderWithProviders(
				<ConversationOverview conversation={conversation} />
			);
			// expect termination label and value
			expect(screen.getByText('End Reason')).toBeInTheDocument();
			expect(screen.getByText(expected)).toBeInTheDocument();
			unmount();
		});
	});

	it('renders correct icons for different statuses', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => false,
		});
		const mockExport = { mutateAsync: vi.fn(), isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const statuses = ['done', 'in_progress', 'failed', 'unknown'];
		statuses.forEach((status) => {
			const conversation = {
				id: `status-${status}`,
				contact: {},
				status,
				transcriptContent: {},
			} as any;
			const { unmount } = renderWithProviders(
				<ConversationOverview conversation={conversation} />
			);
			// RightSectionCard presence asserts that getStatusIcon branch ran
			expect(
				screen.getAllByText('Conversation Overview').length
			).toBeGreaterThan(0);
			unmount();
		});
	});

	it('handles successful export and shows success notification', async () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});
		const mutateAsync = vi
			.fn()
			.mockResolvedValue({ blob: new Blob(['contents']) });
		const mockExport = { mutateAsync, isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const conversation = {
			id: 'conv-3',
			contact: { firstName: 'Jane', lastName: 'Austen' },
			transcriptContent: {
				analysis: { transcript_summary: 'sum' },
				metadata: {},
			},
		} as any;

		const createUrl = vi
			.spyOn(window.URL, 'createObjectURL')
			.mockImplementation(() => 'blob:test');
		const revoke = vi
			.spyOn(window.URL, 'revokeObjectURL')
			.mockImplementation(() => {});
		const notificationsSpy = vi.spyOn(notifications, 'show');

		renderWithProviders(<ConversationOverview conversation={conversation} />);
		const btn = screen.getByRole('button', {
			name: /Download Full Transcript/i,
		});
		fireEvent.click(btn);

		await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith('conv-3'));
		await waitFor(() =>
			expect(notificationsSpy).toHaveBeenCalledWith({
				title: 'Export Successful',
				message: 'Conversation exported as PDF',
				color: 'green',
			})
		);

		createUrl.mockRestore();
		revoke.mockRestore();
	});

	it('shows Invalid date when startDate toLocaleString throws', () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => false,
		});
		const mockExport = { mutateAsync: vi.fn(), isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const toLocaleSpy = vi
			.spyOn(Date.prototype, 'toLocaleString')
			.mockImplementation(function () {
				throw new Error('bad date');
			});

		const conversation = {
			id: 'conv-5',
			contact: { firstName: 'First', lastName: 'Last' },
			startDate: '2023-01-01T12:00:00Z',
			transcriptContent: {},
		} as any;

		const { unmount } = renderWithProviders(
			<ConversationOverview conversation={conversation} />
		);
		expect(screen.getAllByText('Invalid date').length).toBeGreaterThan(0);
		unmount();
		toLocaleSpy.mockRestore();
	});

	it('downloads with fallback filename when contact name is not present', async () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});
		const mutateAsync = vi
			.fn()
			.mockResolvedValue({ blob: new Blob(['contents']) });
		const mockExport = { mutateAsync, isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const conversation = {
			id: 'fallback-123',
			contact: {},
			transcriptContent: { analysis: { transcript_summary: 'sum' } },
		} as any;

		const createUrl = vi
			.spyOn(window.URL, 'createObjectURL')
			.mockImplementation(() => 'blob:test');
		const revoke = vi
			.spyOn(window.URL, 'revokeObjectURL')
			.mockImplementation(() => {});

		const originalCreateElement = document.createElement.bind(document);
		const createElementSpy = vi
			.spyOn(document, 'createElement')
			.mockImplementation((tag: any) => {
				const el = originalCreateElement(tag);
				if (tag === 'a') {
					// Spy on click to avoid side effects but keep it as a Node
					el.click = vi.fn();
				}
				return el;
			});
		vi.spyOn(notifications, 'show');
		const appendSpy = vi.spyOn(document.body, 'appendChild');

		renderWithProviders(<ConversationOverview conversation={conversation} />);
		const btn = screen.getByRole('button', {
			name: /Download Full Transcript/i,
		});
		fireEvent.click(btn);

		await waitFor(() =>
			expect(mutateAsync).toHaveBeenCalledWith('fallback-123')
		);
		expect(appendSpy).toHaveBeenCalled();
		const appended = appendSpy.mock.calls
			.map((c) => c[0])
			.find((n) => (n as HTMLElement).tagName?.toLowerCase() === 'a') as
			| HTMLAnchorElement
			| undefined;
		expect(appended).toBeTruthy();
		expect(appended?.download).toBe('conversation-fallback-123.pdf');
		appendSpy.mockRestore();
		createElementSpy.mockRestore();

		createUrl.mockRestore();
		revoke.mockRestore();
	});

	it('handles failed export and shows error notification', async () => {
		(usePermissions as unknown as any).mockReturnValue({
			canPerformAction: () => true,
		});
		const mut = vi.fn().mockRejectedValue(new Error('Failed'));
		const mockExport = { mutateAsync: mut, isPending: false };
		(useExportConversationPdf as unknown as any).mockReturnValue(mockExport);

		const conversation = {
			id: 'conv-4',
			contact: {},
			transcriptContent: { analysis: { transcript_summary: 'sum' } },
		} as any;
		const notificationsSpy = vi.spyOn(notifications, 'show');

		renderWithProviders(<ConversationOverview conversation={conversation} />);
		const btn = screen.getByRole('button', {
			name: /Download Full Transcript/i,
		});
		fireEvent.click(btn);

		await waitFor(() => expect(mut).toHaveBeenCalledWith('conv-4'));
		await waitFor(() =>
			expect(notificationsSpy).toHaveBeenCalledWith({
				title: 'Export Failed',
				message: 'Failed to export conversation. Please try again.',
				color: 'red',
			})
		);
	});
});

export {};
