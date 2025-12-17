import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DispositionNodeForm from './DispositionNodeForm';

vi.mock('@mantine/core', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@mantine/core')>();
	return {
		...actual,
		Modal: ({
			opened,
			onClose,
			children,
			title,
		}: {
			opened: boolean;
			onClose: () => void;
			children: React.ReactNode;
			title: string;
		}) =>
			opened ? (
				<div data-testid='modal'>
					<h3>{title}</h3>
					<button onClick={onClose} type='button'>
						Close
					</button>
					{children}
				</div>
			) : null,
		TextInput: ({
			label,
			value,
			onChange,
		}: {
			label: string;
			value?: string;
			onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
		}) => (
			<label>
				{label}
				<input value={value} onChange={onChange} />
			</label>
		),
		Checkbox: ({
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
			type = 'button',
			onClick,
		}: {
			children: React.ReactNode;
			type?: 'button' | 'submit';
			onClick?: () => void;
		}) => (
			<button type={type} onClick={onClick}>
				{children}
			</button>
		),
		Group: ({ children }: { children: React.ReactNode }) => (
			<div>{children}</div>
		),
	};
});

describe('DispositionNodeForm', () => {
	it('submits form values', async () => {
		const onSubmit = vi.fn();
		render(
			<DispositionNodeForm
				opened
				onClose={vi.fn()}
				onSubmit={onSubmit}
				title='Node'
			/>
		);

		await userEvent.type(screen.getByLabelText('Name'), 'Outcome');
		await userEvent.type(screen.getByLabelText('Description'), 'Desc');
		await userEvent.click(screen.getByLabelText('Invalidates Number'));
		await userEvent.click(screen.getByLabelText('Do not call'));
		await userEvent.click(screen.getByLabelText('Requires Reschedule'));
		await userEvent.click(screen.getByLabelText('Is Final'));
		await userEvent.click(screen.getByLabelText('Is Voice Mail'));

		await userEvent.click(screen.getByText('Save'));

		const [values] = onSubmit.mock.calls[0];
		expect(values).toEqual(
			expect.objectContaining({
				name: 'Outcome',
				description: 'Desc',
				isInvalidatesNumber: true,
				doNotCall: true,
				requiresReschedule: true,
				isFinal: true,
				isVoiceMail: true,
			})
		);
	});

	it('resets values when initial values change', async () => {
		const { rerender } = render(
			<DispositionNodeForm
				opened
				onClose={vi.fn()}
				onSubmit={vi.fn()}
				initialValues={
					{
						name: 'First',
						description: 'A',
						isInvalidatesNumber: false,
						doNotCall: false,
						requiresReschedule: false,
						isFinal: false,
						isVoiceMail: false,
					} as any
				}
			/>
		);

		expect(screen.getByLabelText('Name')).toHaveValue('First');

		rerender(
			<DispositionNodeForm
				opened
				onClose={vi.fn()}
				onSubmit={vi.fn()}
				initialValues={
					{
						name: 'Second',
						description: 'B',
						isInvalidatesNumber: true,
						doNotCall: true,
						requiresReschedule: true,
						isFinal: true,
						isVoiceMail: true,
					} as any
				}
			/>
		);

		expect(screen.getByLabelText('Name')).toHaveValue('Second');
		expect(screen.getByLabelText('Invalidates Number')).toBeChecked();
		expect(screen.getByLabelText('Do not call')).toBeChecked();
		expect(screen.getByLabelText('Requires Reschedule')).toBeChecked();
		expect(screen.getByLabelText('Is Final')).toBeChecked();
		expect(screen.getByLabelText('Is Voice Mail')).toBeChecked();
	});

	it('invokes close when cancel pressed', async () => {
		const onClose = vi.fn();
		render(<DispositionNodeForm opened onClose={onClose} onSubmit={vi.fn()} />);

		await userEvent.click(screen.getByText('Cancel'));

		expect(onClose).toHaveBeenCalled();
	});
});
