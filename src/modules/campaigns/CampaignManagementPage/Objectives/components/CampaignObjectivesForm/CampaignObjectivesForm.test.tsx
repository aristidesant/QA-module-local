import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notifications } from '@mantine/notifications';
import { CampaignObjectivesForm } from './CampaignObjectivesForm';
import { renderWithProviders } from '~/test-utils/renderWithProviders';

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();

vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useCreateCampaignObjective: () => ({
		mutateAsync: createMutateAsync,
		isPending: false,
	}),
	useUpdateCampaignObjective: () => ({
		mutateAsync: updateMutateAsync,
		isPending: false,
	}),
}));

vi.mock('~/queries/campaignCategoriesQueries', () => ({
	useGetCampaignCategories: () => ({
		data: {
			data: [
				{ id: 1, name: 'Sales' },
				{ id: 2, name: 'Support' },
			],
		},
	}),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: {
		show: vi.fn(),
	},
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		TextInput: ({
			label,
			value,
			onChange,
			placeholder,
			required,
			onClick,
			readOnly,
			rightSection,
		}: {
			label: string;
			value?: string;
			onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
			placeholder?: string;
			required?: boolean;
			onClick?: () => void;
			readOnly?: boolean;
			rightSection?: React.ReactNode;
		}) => (
			<label>
				{label}
				<input
					value={value}
					onChange={onChange ?? (() => undefined)}
					placeholder={placeholder}
					required={required}
					onClick={onClick}
					readOnly={readOnly}
				/>
				{rightSection}
			</label>
		),
		Textarea: ({
			label,
			value,
			onChange,
			placeholder,
		}: {
			label: string;
			value?: string;
			onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
			placeholder?: string;
		}) => (
			<label>
				{label}
				<textarea value={value} onChange={onChange} placeholder={placeholder} />
			</label>
		),
		Switch: ({
			label,
			checked,
			onChange,
		}: {
			label: string;
			checked?: boolean;
			onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
		}) => (
			<label>
				{label}
				<input
					type='checkbox'
					checked={!!checked}
					onChange={onChange}
					data-testid='switch'
				/>
			</label>
		),
		Button: ({
			children,
			onClick,
			type = 'button',
			disabled,
			loading,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			type?: 'button' | 'submit';
			disabled?: boolean;
			loading?: boolean;
		}) => (
			<button type={type} onClick={onClick} disabled={disabled || loading}>
				{children}
			</button>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div data-testid='group'>{children}</div>
		),
		Stack: ({ children }: { children: React.ReactNode }) => (
			<div data-testid='stack'>{children}</div>
		),
	};
});

vi.mock(
	'~/modules/campaigns/CampaignManagementPage/components/CategoryPickerPanel',
	() => ({
		default: ({
			onSelect,
		}: {
			onSelect: (category: { id: number; name: string }) => void;
		}) => (
			<button type='button' onClick={() => onSelect({ id: 1, name: 'Sales' })}>
				Pick Sales
			</button>
		),
	})
);

describe('CampaignObjectivesForm', () => {
	const onSuccess = vi.fn();
	const onCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		createMutateAsync.mockResolvedValue({});
		updateMutateAsync.mockResolvedValue({});
	});

	it('creates an objective successfully', async () => {
		renderWithProviders(
			<CampaignObjectivesForm onSuccess={onSuccess} onCancel={onCancel} />
		);

		await userEvent.type(screen.getByLabelText('Name'), 'New Objective');
		await userEvent.click(screen.getByLabelText('Category'));
		await userEvent.click(screen.getByText('Pick Sales'));
		await userEvent.type(
			screen.getByLabelText('Description'),
			'Objective description'
		);

		await userEvent.click(screen.getByText('Create'));

		await waitFor(() => {
			expect(createMutateAsync).toHaveBeenCalledWith({
				name: 'New Objective',
				description: 'Objective description',
				categoryId: 1,
				active: true,
			});
		});

		expect(onSuccess).toHaveBeenCalled();
	});

	it('updates an objective successfully', async () => {
		renderWithProviders(
			<CampaignObjectivesForm
				objective={{
					id: 2,
					name: 'Existing',
					description: 'Old',
					categoryId: 2,
					active: false,
					userId: 1,
					clientId: 1,
					createdAt: '',
					updatedAt: '',
				}}
				onSuccess={onSuccess}
				onCancel={onCancel}
			/>
		);

		await userEvent.clear(screen.getByLabelText('Name'));
		await userEvent.type(screen.getByLabelText('Name'), 'Updated Name');
		await userEvent.click(screen.getByLabelText('Category'));
		await userEvent.click(screen.getByText('Pick Sales'));
		await userEvent.click(screen.getByLabelText('Active'));

		await userEvent.click(screen.getByText('Update'));

		await waitFor(() => {
			expect(updateMutateAsync).toHaveBeenCalledWith({
				id: 2,
				data: {
					name: 'Updated Name',
					description: 'Old',
					categoryId: 1,
					active: true,
				},
			});
		});
		expect(onSuccess).toHaveBeenCalled();
	});

	it('shows error notification on failure', async () => {
		createMutateAsync.mockRejectedValueOnce(new Error('fail'));

		renderWithProviders(
			<CampaignObjectivesForm onSuccess={onSuccess} onCancel={onCancel} />
		);

		await userEvent.type(screen.getByLabelText('Name'), 'Bad Objective');
		await userEvent.click(screen.getByLabelText('Category'));
		await userEvent.click(screen.getByText('Pick Sales'));

		await userEvent.click(screen.getByText('Create'));

		await waitFor(() => {
			expect(notifications.show).toHaveBeenCalledWith(
				expect.objectContaining({
					color: 'red',
				})
			);
		});
	});

	it('invokes cancel handler', async () => {
		renderWithProviders(
			<CampaignObjectivesForm onSuccess={onSuccess} onCancel={onCancel} />
		);

		await userEvent.click(screen.getByText('Cancel'));

		expect(onCancel).toHaveBeenCalled();
	});
});
