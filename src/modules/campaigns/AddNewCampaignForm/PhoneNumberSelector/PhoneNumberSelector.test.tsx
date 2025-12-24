import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import PhoneNumberSelector from './PhoneNumberSelector';

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

const mockUseSimplePhoneNumberList = vi.fn();
vi.mock('~/queries/phoneNumberQueries', () => ({
	useSimplePhoneNumberList: (...args: any[]) =>
		mockUseSimplePhoneNumberList(...args),
}));

// Mock Mantine Select with a simple native select for easier testing
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		Select: ({ data, value, onChange, disabled, label }: any) => (
			<label>
				{label}
				<select
					data-testid='phone-select'
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

describe('PhoneNumberSelector', () => {
	beforeEach(() => vi.clearAllMocks());

	it('disables select while loading', () => {
		mockUseSimplePhoneNumberList.mockReturnValue({
			data: null,
			isLoading: true,
		});
		const onChange = vi.fn();

		render(
			<MantineProvider>
				<PhoneNumberSelector
					campaignType='OUTBOUND'
					value={null}
					onChange={onChange}
				/>
			</MantineProvider>
		);

		expect(screen.getByTestId('phone-select')).toBeDisabled();
	});

	it('renders options and triggers onChange when selecting', () => {
		mockUseSimplePhoneNumberList.mockReturnValue({
			data: [{ id: 1, phoneNumber: '+123', label: 'Primary' }],
			isLoading: false,
		});
		const onChange = vi.fn();

		render(
			<MantineProvider>
				<PhoneNumberSelector
					campaignType='OUTBOUND'
					value={null}
					onChange={onChange}
				/>
			</MantineProvider>
		);

		const select = screen.getByTestId('phone-select');
		fireEvent.change(select, { target: { value: '1' } });

		expect(onChange).toHaveBeenCalledWith(1);
	});
});
