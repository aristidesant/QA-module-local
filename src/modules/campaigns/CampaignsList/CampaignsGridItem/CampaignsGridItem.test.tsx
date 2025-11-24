import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import CampaignsGridItem from './CampaignsGridItem';
import type { Campaign } from '~/models/CampaignsModel';

const sampleCampaign: Campaign = {
	id: 1,
	name: 'Grid Campaign',
	agentName: 'A',
	description: 'desc',
	budget: 100,
	configId: 'cfg',
	spent: 10,
	type: 'OUTBOUND',
	status: 'ACTIVE' as any,
	userId: 1,
	clientId: 1,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	agents: [],
};

describe('CampaignsGridItem', () => {
	const onClick = vi.fn();
	const onViewDetails = vi.fn();
	const onEdit = vi.fn();
	const onDelete = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders campaign content and responds to click', () => {
		render(
			<MantineProvider>
				<CampaignsGridItem
					campaign={sampleCampaign}
					selected={false}
					onClick={onClick}
					onViewDetails={onViewDetails}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</MantineProvider>
		);

		expect(screen.getByText('Grid Campaign')).toBeInTheDocument();

		// Click the card (onClick should be fired)
		const card = screen.getByText('Grid Campaign');
		fireEvent.click(card);
		expect(onClick).toHaveBeenCalled();
	});

	it('opens menu and triggers actions', async () => {
		render(
			<MantineProvider>
				<CampaignsGridItem
					campaign={sampleCampaign}
					selected={false}
					onClick={onClick}
					onViewDetails={onViewDetails}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</MantineProvider>
		);

		// Find the menu button by querying for the dots icon button
		const buttons = screen.getAllByRole('button');
		// Expect at least one button (menu button or Start Campaign)
		expect(buttons.length).toBeGreaterThan(0);

		// Click the first dots menu button that is not the Start Campaign button
		// The Start Campaign has text, so we can find it and exclude it from the button list
		const startButton = screen.getByText('Start Campaign');
		const menuButton = buttons.find((b) => b !== startButton);
		if (!menuButton) throw new Error('Menu button not found');
		fireEvent.click(menuButton);

		const viewDetails = await screen.findByText('View Details');
		fireEvent.click(viewDetails);
		expect(onViewDetails).toHaveBeenCalled();

		const editItem = await screen.findByText('Edit');
		fireEvent.click(editItem);
		expect(onEdit).toHaveBeenCalled();

		const deleteItem = await screen.findByText('Delete');
		fireEvent.click(deleteItem);
		expect(onDelete).toHaveBeenCalled();
	});
});
