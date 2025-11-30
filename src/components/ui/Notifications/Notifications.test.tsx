import { describe, it, expect } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import Notifications from './index';

describe('Notifications', () => {
	it('renders Mantine Notifications component', () => {
		const { container } = renderWithProviders(<Notifications />);
		expect(container).toBeInTheDocument();
	});
});

export {};
