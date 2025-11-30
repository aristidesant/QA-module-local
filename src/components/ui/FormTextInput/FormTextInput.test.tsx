import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import FormTextInput from './FormTextInput';

describe('FormTextInput', () => {
	it('renders label and triggers onChange when typing', () => {
		const onChange = vi.fn();
		renderWithProviders(
			<FormTextInput label='Name' placeholder='Enter' onChange={onChange} />
		);

		expect(screen.getByText('Name')).toBeInTheDocument();
		const input = screen.getByRole('textbox');
		fireEvent.change(input, { target: { value: 'John' } });

		expect(onChange).toHaveBeenCalled();
		expect((input as HTMLInputElement).value).toBe('John');
	});
});

export {};
