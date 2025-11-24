import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import CampaignsListItem from './CampaignsListItem';
import type { Campaign } from '~/models/CampaignsModel';

const sampleCampaign: Campaign = {
	id: 1,
	name: 'List Campaign',
	agentName: 'Agent A',
	description: 'This is a test',
	budget: 100,
	configId: 'cfg',
	spent: 10,
	type: 'OUTBOUND',
	status: 'ACTIVE' as any,
	userId: 1,
	clientId: 1,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	agents: [
		{
			id: 1,
			campaignId: 1,
			agentId: 'agent-1',
			agent: { name: 'Alice', status: 'ACTIVE', language: 'en' },
			userId: 1,
			clientId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: 2,
			campaignId: 1,
			agentId: 'agent-2',
			agent: { name: 'Bob', status: 'ACTIVE', language: 'es' },
			userId: 1,
			clientId: 1,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	],
	overAllScore: 75,
	progress: 63,
};

describe('CampaignsListItem', () => {
	const onClick = vi.fn();
	const onViewDetails = vi.fn();
	const onEdit = vi.fn();
	const onDelete = vi.fn();

	beforeEach(() => vi.clearAllMocks());

	it('renders campaign details and progress', () => {
		render(
			<MantineProvider>
				<CampaignsListItem
					campaign={sampleCampaign}
					selected={false}
					onClick={onClick}
					onViewDetails={onViewDetails}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</MantineProvider>
		);

		expect(screen.getByText('List Campaign')).toBeInTheDocument();
		// Check progress value via progressbar aria-valuenow
		const progress = screen.getByRole('progressbar');
		expect(progress).toHaveAttribute(
			'aria-valuenow',
			String(sampleCampaign.progress)
		);
		// Check score is displayed
		expect(screen.getByText('75')).toBeInTheDocument();
	});

	it('calls onClick and menu actions', async () => {
		render(
			<MantineProvider>
				<CampaignsListItem
					campaign={sampleCampaign}
					selected={false}
					onClick={onClick}
					onViewDetails={onViewDetails}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</MantineProvider>
		);

		fireEvent.click(screen.getByText('List Campaign'));
		expect(onClick).toHaveBeenCalled();

		// Open actions menu
		const menuButton = screen.getByLabelText('Campaign actions');
		fireEvent.click(menuButton);

		// Click Delete
		const deleteItem = await screen.findByText('Delete');
		fireEvent.click(deleteItem);
		expect(onDelete).toHaveBeenCalled();
	});

	it('shows agents list when agents exist', () => {
		render(
			<MantineProvider>
				<CampaignsListItem
					campaign={sampleCampaign}
					selected={false}
					onClick={onClick}
					onViewDetails={onViewDetails}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
			</MantineProvider>
		);

		// Avatars display initials
		expect(screen.getByText('A')).toBeInTheDocument();
		expect(screen.getByText('B')).toBeInTheDocument();
	});
});
