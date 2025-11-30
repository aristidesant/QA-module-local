import { render, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePhoneNumbersColumns } from './usePhoneNumbersColumns';

const buildRow = (override: any = {}) => ({
	phoneNumber: '+18095551234',
	status: 'ACTIVE',
	retryCounter: 2,
	...override,
});

describe('usePhoneNumbersColumns', () => {
	it('renders phone numbers with validation badge', () => {
		const { result } = renderHook(() => usePhoneNumbersColumns());
		const phoneColumn = result.current.find(
			(col) => (col as any).accessorKey === 'phoneNumber'
		);
		expect(phoneColumn).toBeDefined();

		const row = buildRow({
			validationError: { code: 'E001', message: 'Bad number', rawPhone: '' },
		});

		const { getByText } = render(
			<>
				{(phoneColumn as any)?.cell?.({
					getValue: () => row.phoneNumber,
					row: { original: row },
				} as any)}
			</>
		);

		expect(getByText('+18095551234')).toBeInTheDocument();
		expect(getByText('E001')).toBeInTheDocument();
	});

	it('shows fallback values when status is missing', () => {
		const { result } = renderHook(() => usePhoneNumbersColumns());
		const statusColumn = result.current.find(
			(col) => (col as any).accessorKey === 'status'
		);
		const retriesColumn = result.current.find(
			(col) => (col as any).accessorKey === 'retryCounter'
		);

		const row = buildRow({ status: '', retryCounter: undefined });
		const { getByText } = render(
			<>
				{(statusColumn as any)?.cell?.({
					getValue: () => row.status,
					row: { original: row },
				} as any)}
				{(retriesColumn as any)?.cell?.({
					getValue: () => row.retryCounter,
					row: { original: row },
				} as any)}
			</>
		);

		expect(getByText('N/A')).toBeInTheDocument();
		expect(getByText('0')).toBeInTheDocument();
	});
});
