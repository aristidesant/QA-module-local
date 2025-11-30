import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import AppSegmentedControl from './AppSegmentedControl';

describe('AppSegmentedControl', () => {
	it('renders segments and responds to change', () => {
		const onChange = vi.fn();
		renderWithProviders(
			<AppSegmentedControl
				data={[
					{ label: 'One', value: '1' },
					{ label: 'Two', value: '2' },
				]}
				value='1'
				onChange={onChange}
			/>
		);

		expect(screen.getByText('One')).toBeInTheDocument();
		expect(screen.getByText('Two')).toBeInTheDocument();

		fireEvent.click(screen.getByText('Two'));
		expect(onChange).toHaveBeenCalled();
	});

	it('accepts custom className', () => {
		renderWithProviders(
			<AppSegmentedControl
				data={[{ label: 'A', value: 'a' }]}
				className='custom-seg'
			/>
		);

		const root = document.querySelector('.custom-seg');
		expect(root).toBeInTheDocument();
	});
});

export {};
