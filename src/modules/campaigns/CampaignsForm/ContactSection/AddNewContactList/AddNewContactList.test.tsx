import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock notifications
vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));
import { notifications } from '@mantine/notifications';
// Mock queries used in the component
vi.mock('~/queries/contactGroupFilesQueries', () => ({
	useUploadContactGroupFile: vi.fn(() => ({
		mutateAsync: vi.fn(),
		isPending: false,
	})),
}));

vi.mock('~/queries/schedulerQueries', () => ({
	useCampaignSchedules: vi.fn(() => ({ refetch: vi.fn() })),
}));

// Mock ContactLimits to avoid testing that component here
vi.mock('../ContactLimits', () => ({
	__esModule: true,
	default: ({
		fileSummary,
		onComplete,
		objectiveId,
	}: {
		fileSummary?: ContactFileSummary;
		onComplete?: () => void;
		objectiveId?: number;
	}) => (
		<div data-testid='contact-limits'>
			<span data-testid='file-total'>{fileSummary?.totalRows}</span>
			{objectiveId && <span data-testid='objective-id'>{objectiveId}</span>}
			<button data-testid='complete-button' onClick={onComplete}>
				Complete
			</button>
		</div>
	),
}));

import AddNewContactList from './AddNewContactList';
import {
	renderWithProviders,
	testI18n,
} from '~/test-utils/renderWithProviders';
import type { ContactFileSummary } from '~/models/ContactFileSummary';

const onClose = vi.fn();
const onRefresh = vi.fn();

type UploadContactGroupFileResult = ReturnType<
	typeof import('~/queries/contactGroupFilesQueries').useUploadContactGroupFile
>;
type CampaignSchedulesResult = ReturnType<
	typeof import('~/queries/schedulerQueries').useCampaignSchedules
>;

const tCampaigns = (key: string, options?: Record<string, unknown>) =>
	testI18n.t(key, { ns: 'campaigns', ...options });
const tCommon = (key: string) => testI18n.t(key, { ns: 'common' });

const createUploadContactGroupFileResult = (
	overrides?: Partial<UploadContactGroupFileResult>
): UploadContactGroupFileResult =>
	({
		mutateAsync: vi.fn(),
		isPending: false,
		...overrides,
	}) as UploadContactGroupFileResult;

const createCampaignSchedulesResult = (
	overrides?: Partial<CampaignSchedulesResult>
): CampaignSchedulesResult =>
	({
		refetch: vi.fn(),
		...overrides,
	}) as CampaignSchedulesResult;

const createMockFileSummary = (
	overrides?: Partial<ContactFileSummary>
): ContactFileSummary => ({
	contactGroupFileId: 1,
	headers: ['Name', 'Phone'],
	totalRows: 10,
	file: {
		id: 1,
		name: 'test.csv',
		mime: 'text/csv',
		repositoryKey: 'key',
		repositoryRoute: '/files/test.csv',
		extension: 'csv',
		description: null,
		typeId: 1,
		userId: 1,
		clientId: 1,
		createdAt: '2025-01-01T00:00:00Z',
		updatedAt: '2025-01-01T00:00:00Z',
		deletedAt: null,
	},
	...overrides,
});

// NOTE: mocks are above to ensure they are applied before component import

describe('AddNewContactList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders upload area and cancel button', () => {
		renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		expect(
			screen.getByText(tCampaigns('form.contacts.addNew.uploadLabel'))
		).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: tCommon('cancel') })
		).toBeInTheDocument();
	});

	it('calls onClose when Cancel button clicked', async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		await user.click(screen.getByRole('button', { name: tCommon('cancel') }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('shows skeleton while uploading', async () => {
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		vi.mocked(useUploadContactGroupFile).mockReturnValueOnce(
			createUploadContactGroupFileResult({ isPending: true })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		expect(
			container.querySelector('[class*=mantine-Skeleton]')
		).toBeInTheDocument();
	});

	it('shows a notification when no file selected', async () => {
		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		// Trigger a change with no files
		fireEvent.change(input, { target: { files: [] } });
		await waitFor(() =>
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: tCampaigns('form.contacts.addNew.notifications.noFile.title'),
				})
			)
		);
	});

	it('shows invalid file type notification for non-csv file', async () => {
		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['content'], 'test.txt', { type: 'text/plain' });

		fireEvent.change(input, { target: { files: [file] } });
		await waitFor(() =>
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: tCampaigns(
						'form.contacts.addNew.notifications.invalidType.title'
					),
				})
			)
		);
	});

	it('uploads a valid csv and renders ContactLimits', async () => {
		const user = userEvent.setup();
		const summary = createMockFileSummary();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const mutateAsync = vi.fn().mockResolvedValue(summary);
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['name,phone\nJohn Doe,1234567890'], 'test.csv', {
			type: 'text/csv',
		});

		await user.upload(input, file);

		// Wait for the ContactLimits to render with file summary
		await waitFor(() => {
			expect(screen.getByTestId('contact-limits')).toBeInTheDocument();
			expect(screen.getByTestId('file-total')).toHaveTextContent(
				String(summary.totalRows)
			);
			expect(mutateAsync).toHaveBeenCalled();
		});
	});

	it('does not call mutateAsync when campaignId is not provided', async () => {
		const user = userEvent.setup();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const mutateAsync = vi.fn().mockResolvedValue(createMockFileSummary());
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={undefined}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['name,phone\nJane,9876543210'], 'test.csv', {
			type: 'text/csv',
		});

		await user.upload(input, file);

		expect(mutateAsync).not.toHaveBeenCalled();
	});

	it('shows error notification when upload fails with Error instance', async () => {
		const user = userEvent.setup();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const errorMessage = 'Network connection failed';
		const mutateAsync = vi.fn().mockRejectedValue(new Error(errorMessage));
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['name,phone\nJohn,123'], 'test.csv', {
			type: 'text/csv',
		});

		await user.upload(input, file);

		await waitFor(() =>
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: tCampaigns(
						'form.contacts.addNew.notifications.uploadFailed.title'
					),
					message: errorMessage,
					color: 'red',
				})
			)
		);
	});

	it('shows generic error notification when upload fails with non-Error', async () => {
		const user = userEvent.setup();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const mutateAsync = vi.fn().mockRejectedValue('string error');
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['name,phone\nJohn,123'], 'test.csv', {
			type: 'text/csv',
		});

		await user.upload(input, file);

		await waitFor(() =>
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: tCampaigns(
						'form.contacts.addNew.notifications.uploadFailed.title'
					),
					message: tCampaigns(
						'form.contacts.addNew.notifications.uploadFailed.message'
					),
					color: 'red',
				})
			)
		);
	});

	it('handles drag over event', () => {
		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const uploadArea = container.querySelector('[class*=uploadArea]');
		expect(uploadArea).toBeInTheDocument();

		fireEvent.dragOver(uploadArea!);
		// After dragOver, the element should have dragActive class applied
		expect(uploadArea?.className).toContain('dragActive');
	});

	it('handles drag leave event', () => {
		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const uploadArea = container.querySelector('[class*=uploadArea]');
		expect(uploadArea).toBeInTheDocument();

		fireEvent.dragOver(uploadArea!);
		fireEvent.dragLeave(uploadArea!);
		// After dragLeave, the element should not have dragActive class
		expect(uploadArea?.className).not.toContain('dragActive');
	});

	it('handles file drop', async () => {
		const summary = createMockFileSummary();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const mutateAsync = vi.fn().mockResolvedValue(summary);
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const uploadArea = container.querySelector('[class*=uploadArea]');
		expect(uploadArea).toBeInTheDocument();

		const file = new File(['name,phone\nJohn,123'], 'test.csv', {
			type: 'text/csv',
		});

		const dataTransfer = {
			files: [file],
		};

		fireEvent.drop(uploadArea!, { dataTransfer });

		await waitFor(() => {
			expect(mutateAsync).toHaveBeenCalled();
			expect(screen.getByTestId('contact-limits')).toBeInTheDocument();
		});
	});

	it('handles drop with no files', async () => {
		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const uploadArea = container.querySelector('[class*=uploadArea]');

		const dataTransfer = {
			files: [],
		};

		fireEvent.drop(uploadArea!, { dataTransfer });

		await waitFor(() =>
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					title: tCampaigns('form.contacts.addNew.notifications.noFile.title'),
				})
			)
		);
	});

	it('calls onComplete callback and resets state', async () => {
		const user = userEvent.setup();
		const summary = createMockFileSummary();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const mutateAsync = vi.fn().mockResolvedValue(summary);
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { useCampaignSchedules } = await import('~/queries/schedulerQueries');
		const refetch = vi.fn();
		vi.mocked(useCampaignSchedules).mockReturnValue(
			createCampaignSchedulesResult({ refetch })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['name,phone\nJohn,123'], 'test.csv', {
			type: 'text/csv',
		});

		await user.upload(input, file);

		await waitFor(() => {
			expect(screen.getByTestId('contact-limits')).toBeInTheDocument();
		});

		// Click the complete button
		await user.click(screen.getByTestId('complete-button'));

		await waitFor(() => {
			expect(onClose).toHaveBeenCalled();
			expect(onRefresh).toHaveBeenCalled();
			expect(refetch).toHaveBeenCalled();
		});
	});

	it('passes objectiveId to ContactLimits', async () => {
		const user = userEvent.setup();
		const summary = createMockFileSummary();
		const { useUploadContactGroupFile } =
			await import('~/queries/contactGroupFilesQueries');
		const mutateAsync = vi.fn().mockResolvedValue(summary);
		vi.mocked(useUploadContactGroupFile).mockReturnValue(
			createUploadContactGroupFileResult({ mutateAsync })
		);

		const { container } = renderWithProviders(
			<AddNewContactList
				campaignId={1}
				onClose={onClose}
				onRefresh={onRefresh}
				objectiveId={42}
			/>
		);

		const input = container.querySelector(
			'input[type=file]'
		) as HTMLInputElement;
		const file = new File(['name,phone\nJohn,123'], 'test.csv', {
			type: 'text/csv',
		});

		await user.upload(input, file);

		await waitFor(() => {
			expect(screen.getByTestId('objective-id')).toHaveTextContent('42');
		});
	});
});

export {};
