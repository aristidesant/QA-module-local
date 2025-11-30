import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import ContainerCard from './ContainerCard';
import { IconBox } from '@tabler/icons-react';

describe('ContainerCard', () => {
	it('renders title, subtitle, children and right section', () => {
		renderWithProviders(
			<ContainerCard
				title='My Title'
				subtitle='My subtitle'
				rightSection={<div>Actions</div>}
				icon={IconBox}
			>
				<div>Child Content</div>
			</ContainerCard>
		);

		expect(screen.getByText('My Title')).toBeInTheDocument();
		expect(screen.getByText('My subtitle')).toBeInTheDocument();
		expect(screen.getByText('Child Content')).toBeInTheDocument();
		expect(screen.getByText('Actions')).toBeInTheDocument();
	});

	it('applies passed className', () => {
		renderWithProviders(
			<ContainerCard className='custom-card'>Content</ContainerCard>
		);

		expect(document.querySelector('.custom-card')).toBeInTheDocument();
	});
});

export {};
