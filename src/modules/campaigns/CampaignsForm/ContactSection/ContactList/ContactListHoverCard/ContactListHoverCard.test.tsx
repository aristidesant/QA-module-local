import { describe, it, expect } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { ContactListHoverCard } from './ContactListHoverCard';
import type ContactGroup from '~/models/ContactGroup';

const mockContactGroup: ContactGroup = {
	id: 1,
	name: 'Test Contact Group',
	description: 'This is a test description',
	campaignId: 1,
	createdAt: '2023-01-01T00:00:00Z',
	scheduleId: 1,
	queueStatus: 'RUNNING',
	isActive: true,
	currentWave: 2,
	maxWaves: 5,
	lastWaveStartedAt: null,
	lastWaveCompletedAt: null,
	contactCount: 100,
	expirationDate: '2023-12-31T00:00:00Z',
	maxCallsPerContact: 3,
	maxCallsPerList: 10,
	humanEquivalent: 1,
};

describe('ContactListHoverCard', () => {
	it('renders the info icon', () => {
		renderWithProviders(
			<ContactListHoverCard contactGroup={mockContactGroup} />
		);

		// Check that the IconInfoCircle is rendered
		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
	});

	it('renders translated details in the hover card', async () => {
		renderWithProviders(
			<ContactListHoverCard contactGroup={mockContactGroup} />
		);

		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
		fireEvent.mouseEnter(icon?.parentElement as HTMLElement);

		expect(await screen.findByText('Status')).toBeInTheDocument();
		expect(screen.getByText('Running')).toBeInTheDocument();
		expect(screen.getByText('Total')).toBeInTheDocument();
		expect(screen.getByText('100')).toBeInTheDocument();
		expect(screen.getByText('Waves')).toBeInTheDocument();
		expect(screen.getByText('2 / 5')).toBeInTheDocument();
		expect(screen.getByText('Max calls per contact')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
		expect(screen.getByText('Max calls per list')).toBeInTheDocument();
		expect(screen.getByText('10')).toBeInTheDocument();
		expect(
			screen.getByText('Active', { selector: 'span' })
		).toBeInTheDocument();
	});

	it('renders name and description in the hover card', async () => {
		renderWithProviders(
			<ContactListHoverCard contactGroup={mockContactGroup} />
		);

		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
		fireEvent.mouseEnter(icon?.parentElement as HTMLElement);

		expect(await screen.findByText('Test Contact Group')).toBeInTheDocument();
		expect(screen.getByText('This is a test description')).toBeInTheDocument();
	});

	it('omits the description when it is undefined', async () => {
		const noDescGroup = { ...mockContactGroup, description: undefined };
		renderWithProviders(<ContactListHoverCard contactGroup={noDescGroup} />);

		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
		fireEvent.mouseEnter(icon?.parentElement as HTMLElement);

		expect(await screen.findByText('Test Contact Group')).toBeInTheDocument();
		expect(
			screen.queryByText('This is a test description')
		).not.toBeInTheDocument();
	});

	it('renders the not set waves label when maxWaves is undefined', async () => {
		const noWavesGroup = { ...mockContactGroup, maxWaves: undefined };
		renderWithProviders(<ContactListHoverCard contactGroup={noWavesGroup} />);

		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
		fireEvent.mouseEnter(icon?.parentElement as HTMLElement);

		expect(await screen.findByText('Waves')).toBeInTheDocument();
		expect(screen.getByText('Not set')).toBeInTheDocument();
	});

	it('renders the inactive badge when isActive is false', async () => {
		const inactiveGroup = { ...mockContactGroup, isActive: false };
		renderWithProviders(<ContactListHoverCard contactGroup={inactiveGroup} />);

		const icon = document.querySelector('.tabler-icon-info-circle');
		expect(icon).toBeInTheDocument();
		fireEvent.mouseEnter(icon?.parentElement as HTMLElement);

		expect(await screen.findByText('Inactive')).toBeInTheDocument();
	});
});
