import { screen } from '@testing-library/react';
import { IconUsers } from '@tabler/icons-react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import SmallMetricCard from './SmallMetricCard';

describe('SmallMetricCard', () => {
	it('renders the value and label', () => {
		renderWithProviders(
			<SmallMetricCard
				icon={<IconUsers size={16} data-testid='icon' />}
				value='42'
				label='Users'
			/>
		);

		expect(screen.getByText('42')).toBeInTheDocument();
		expect(screen.getByText('Users')).toBeInTheDocument();
	});

	it('renders the icon', () => {
		renderWithProviders(
			<SmallMetricCard
				icon={<IconUsers size={16} data-testid='icon' />}
				value='10'
				label='Count'
			/>
		);

		expect(screen.getByTestId('icon')).toBeInTheDocument();
	});

	it('renders numeric values', () => {
		renderWithProviders(
			<SmallMetricCard
				icon={<IconUsers size={16} />}
				value={123}
				label='Total'
			/>
		);

		expect(screen.getByText('123')).toBeInTheDocument();
	});

	it('applies custom className', () => {
		const { container } = renderWithProviders(
			<SmallMetricCard
				icon={<IconUsers size={16} />}
				value='5'
				label='Items'
				className='custom-class'
			/>
		);

		expect(container.querySelector('.custom-class')).toBeInTheDocument();
	});

	it('shows info icon when tooltip is provided', () => {
		const { container } = renderWithProviders(
			<SmallMetricCard
				icon={<IconUsers size={16} />}
				value='5'
				label='Items'
				tooltip='This is a tooltip'
			/>
		);

		// The info icon should be rendered when tooltip is present
		const svg = container.querySelector('svg.tabler-icon-info-circle');
		expect(svg).toBeInTheDocument();
	});

	it('does not show info icon when no tooltip', () => {
		const { container } = renderWithProviders(
			<SmallMetricCard icon={<IconUsers size={16} />} value='5' label='Items' />
		);

		// Only the main icon should be present, not the info icon
		const infoIcon = container.querySelector('svg.tabler-icon-info-circle');
		expect(infoIcon).not.toBeInTheDocument();
	});
});
