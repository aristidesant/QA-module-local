import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import FormSelect from './FormSelect';

// Mock Mantine Select with a simple native select for easier testing
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		Select: ({ data, value, onChange, disabled, label }: any) => (
			<label>
				{label}
				<select
					data-testid='form-select-test'
					value={value ?? ''}
					onChange={(e) => onChange(e.target.value || null)}
					disabled={disabled}
				>
					<option value=''>--</option>
					{data?.map((d: any) => (
						<option key={d.value} value={d.value}>
							{d.label}
						</option>
					))}
				</select>
			</label>
		),
	};
});

describe('FormSelect', () => {
	it('renders label and allows selecting an option', async () => {
		const onChange = vi.fn();
		renderWithProviders(
			<FormSelect
				label='Test Select'
				placeholder='Choose'
				onChange={onChange}
				data={[
					{ value: 'a', label: 'A' },
					{ value: 'b', label: 'B' },
				]}
			/>
		);

		expect(screen.getByText('Test Select')).toBeInTheDocument();

		// Change native select value (mocked Mantine Select)
		const select = screen.getByTestId('form-select-test');
		fireEvent.change(select, { target: { value: 'b' } });

		expect(onChange).toHaveBeenCalledWith('b');
	});
});

export {};
