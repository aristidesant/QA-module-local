import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DispositionCatalogForm from './DispositionCatalogForm';
import { OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS } from '../../constants';

const createNodeMutateAsync = vi.fn();

vi.mock('~/queries/dispositionNodesQueries', () => ({
	useCreateDispositionNode: () => ({
		mutateAsync: createNodeMutateAsync,
		isPending: false,
	}),
}));

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		TextInput: ({
			label,
			value,
			onChange,
			required,
		}: {
			label: string;
			value?: string;
			onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
			required?: boolean;
		}) => (
			<label>
				{label}
				<input value={value} onChange={onChange} required={required} />
			</label>
		),
		Textarea: ({
			label,
			value,
			onChange,
		}: {
			label: string;
			value?: string;
			onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
		}) => (
			<label>
				{label}
				<textarea value={value} onChange={onChange} />
			</label>
		),
		SegmentedControl: ({
			data,
			value,
			onChange,
		}: {
			data: { value: string; label: string }[];
			value?: string;
			onChange: (value: string) => void;
		}) => (
			<select
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				data-testid='type-select'
			>
				{data.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
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
				<input type='checkbox' checked={!!checked} onChange={onChange} />
			</label>
		),
		Button: ({
			children,
			onClick,
			type = 'button',
			loading,
		}: {
			children: React.ReactNode;
			onClick?: () => void;
			type?: 'button' | 'submit';
			loading?: boolean;
		}) => (
			<button type={type} onClick={onClick} disabled={loading}>
				{children}
			</button>
		),
		Stack: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
		Alert: ({ children }: { children: React.ReactNode }) => (
			<div data-testid='alert'>{children}</div>
		),
		Divider: () => <hr />,
	};
});

vi.mock('~/components/RightSectionCard', () => ({
	default: ({
		children,
		title,
	}: {
		children: React.ReactNode;
		title: string;
	}) => (
		<div data-testid='right-section-card'>
			<h3>{title}</h3>
			{children}
		</div>
	),
}));

describe('DispositionCatalogForm', () => {
	const onSubmit = vi.fn();
	const onSuccess = vi.fn();
	const onError = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		createNodeMutateAsync.mockResolvedValue({});
		onSubmit.mockResolvedValue({ id: 10, name: 'Created Catalog' });
	});

	it('submits create form for inbound catalog', async () => {
		render(
			<DispositionCatalogForm
				mode='create'
				onSubmit={onSubmit}
				onSuccess={onSuccess}
				onError={onError}
			/>
		);

		await userEvent.type(screen.getByLabelText('Name'), 'Inbound Catalog');
		await userEvent.selectOptions(screen.getByTestId('type-select'), 'INBOUND');
		await userEvent.click(screen.getByText('Create Catalog'));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Inbound Catalog',
					type: 'INBOUND',
				})
			);
		});
		expect(createNodeMutateAsync).not.toHaveBeenCalled();
		expect(onSuccess).toHaveBeenCalled();
	});

	it('creates default outbound nodes after catalog creation', async () => {
		onSubmit.mockResolvedValueOnce({
			id: 15,
			name: 'Outbound',
			type: 'OUTBOUND',
		});

		render(
			<DispositionCatalogForm
				mode='create'
				onSubmit={onSubmit}
				onSuccess={onSuccess}
				onError={onError}
			/>
		);

		await userEvent.type(screen.getByLabelText('Name'), 'Outbound Catalog');
		await userEvent.selectOptions(
			screen.getByTestId('type-select'),
			'OUTBOUND'
		);
		await userEvent.click(screen.getByText('Create Catalog'));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalled();
		});

		await waitFor(() => {
			expect(createNodeMutateAsync).toHaveBeenCalledTimes(
				OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS.length
			);
		});

		// Verify each call included the catalog id and the correct node name
		OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS.forEach((node, idx) => {
			expect(createNodeMutateAsync).toHaveBeenNthCalledWith(
				idx + 1,
				expect.objectContaining({
					data: expect.objectContaining({
						name: node.name,
						catalogId: 15,
						parentId: undefined,
					}),
				})
			);
		});

		expect(onSuccess).toHaveBeenCalled();
	});

	it('calls onError when creating default nodes fails', async () => {
		createNodeMutateAsync.mockRejectedValueOnce(new Error('node error'));

		onSubmit.mockResolvedValueOnce({
			id: 30,
			name: 'Outbound',
			type: 'OUTBOUND',
		});

		render(
			<DispositionCatalogForm
				mode='create'
				onSubmit={onSubmit}
				onSuccess={onSuccess}
				onError={onError}
			/>
		);

		await userEvent.type(screen.getByLabelText('Name'), 'Outbound Failure');
		await userEvent.selectOptions(
			screen.getByTestId('type-select'),
			'OUTBOUND'
		);
		await userEvent.click(screen.getByText('Create Catalog'));

		await waitFor(() => {
			expect(onError).toHaveBeenCalled();
			expect(createNodeMutateAsync).toHaveBeenCalled();
		});
	});

	it('updates catalog without creating default nodes', async () => {
		render(
			<DispositionCatalogForm
				mode='edit'
				initialValues={
					{
						id: 5,
						name: 'Existing',
						description: '',
						isDefault: true,
						type: 'INBOUND',
						campaignId: 1,
					} as any
				}
				onSubmit={onSubmit}
				onSuccess={onSuccess}
				onError={onError}
			/>
		);

		await userEvent.clear(screen.getByLabelText('Name'));
		await userEvent.type(screen.getByLabelText('Name'), 'Updated Catalog');
		await userEvent.click(screen.getByText('Update Catalog'));

		await waitFor(() => {
			expect(onSubmit).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'Updated Catalog' })
			);
		});
		expect(createNodeMutateAsync).not.toHaveBeenCalled();
	});
});
