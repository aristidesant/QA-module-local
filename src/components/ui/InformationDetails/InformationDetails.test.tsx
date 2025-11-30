import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import { InformationDetails } from './InformationDetails';
import { IconBox } from '@tabler/icons-react';

describe('InformationDetails', () => {
	it('renders label and value', () => {
		renderWithProviders(<InformationDetails label='Label' value='Val' />);

		expect(screen.getByText('Label')).toBeInTheDocument();
		expect(screen.getByText('Val')).toBeInTheDocument();
	});

	it('renders icon when provided', () => {
		renderWithProviders(
			<InformationDetails label='Label' value='Val' icon={IconBox} />
		);

		// ThemeIcon wraps the icon - ensure there is an svg present
		const svg = document.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});
});

export {};
