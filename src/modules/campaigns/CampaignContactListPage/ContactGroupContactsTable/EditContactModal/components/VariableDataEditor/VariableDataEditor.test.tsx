import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import VariableDataEditor from './VariableDataEditor';
import { useContactEditStore } from '~/stores/contactEditStore';

describe('VariableDataEditor', () => {
	beforeEach(() => {
		useContactEditStore.getState().clear();
	});

	it('renders empty state when no variables are present', () => {
		renderWithProviders(<VariableDataEditor title='Test Title' />);

		expect(screen.getByText('Test Title')).toBeInTheDocument();
		expect(screen.getByText('No dynamic variables yet.')).toBeInTheDocument();
	});

	it('renders variables when present in store', () => {
		useContactEditStore.getState().setInitialVariableData({
			key1: 'value1',
			key2: 'value2',
		});

		renderWithProviders(<VariableDataEditor title='Test Title' />);

		expect(screen.getByText('key1')).toBeInTheDocument();
		expect(screen.getByDisplayValue('value1')).toBeInTheDocument();
		expect(screen.getByText('key2')).toBeInTheDocument();
		expect(screen.getByDisplayValue('value2')).toBeInTheDocument();
	});

	it('updates variable field when input changes', () => {
		useContactEditStore.getState().setInitialVariableData({
			key1: 'value1',
		});

		renderWithProviders(<VariableDataEditor />);

		const input = screen.getByDisplayValue('value1');
		fireEvent.change(input, { target: { value: 'new value' } });

		expect(useContactEditStore.getState().variableData.key1).toBe('new value');
	});
});
