import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import DispositionForm from './DispositionForm';

vi.mock('./DispositionCatalogMenu', () => ({
	__esModule: true,
	default: () => <div>Catalog Menu</div>,
}));

vi.mock('./DispositionBuilder/DispositionBuilder', () => ({
	__esModule: true,
	default: ({ onComplete, onCancel }: any) => (
		<div>
			Builder
			<button data-testid='complete' onClick={() => onComplete?.()} />
			<button data-testid='cancel' onClick={() => onCancel?.()} />
		</div>
	),
}));

describe('DispositionForm', () => {
	beforeEach(() => vi.clearAllMocks());

	it('renders left catalog and builder layout', () => {
		renderWithProviders(<DispositionForm />);

		expect(screen.getByText('Catalog Menu')).toBeInTheDocument();
		expect(screen.getByText('Builder')).toBeInTheDocument();
	});
});

export {};
