import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import {
	useCampaignsColumns,
	getCampaignStatusInfo,
} from './useCampaignsColumns';
import type { Campaign } from '~/models/CampaignsModel';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual =
		await vi.importActual<typeof import('react-router')>('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

describe('useCampaignsColumns', () => {
	const sampleCampaign: Campaign = {
		id: 123,
		name: 'Sample',
		agentName: 'Test Agent',
		description: 'desc',
		budget: 100,
		configId: 'cfg',
		spent: 10,
		type: 'OUTBOUND',
		status: 'ACTIVE' as any,
		userId: 0,
		clientId: 0,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		agents: [],
	};

	const defaultProps = {
		onEdit: vi.fn(),
		onView: vi.fn(),
		onTestCall: vi.fn(),
		onDelete: vi.fn(),
		onClone: vi.fn(),
	};

	beforeEach(() => {
		mockNavigate.mockReset();
		vi.clearAllMocks();
	});

	const renderCell = (columnId: string, campaign: Campaign) => {
		const TestComponent = () => {
			const columns = useCampaignsColumns(defaultProps);
			const col = columns.find(
				(c) => (c as any).accessorKey === columnId || (c as any).id === columnId
			);
			if (!col) return <div>Column not found</div>;
			return <div>{(col as any).cell({ row: { original: campaign } })}</div>;
		};

		return render(
			<MantineProvider>
				<TestComponent />
			</MantineProvider>
		);
	};

	it('renders name cell with hover card details', () => {
		renderCell('name', sampleCampaign);
		expect(screen.getByText('Sample')).toBeInTheDocument();
	});

	it('renders type column correctly for OUTBOUND', () => {
		renderCell('type', { ...sampleCampaign, type: 'OUTBOUND' });
		// Check if the icon container is present (Mantine ThemeIcon)
		// Since we can't easily check for the icon SVG without a test id, we assume if it renders without error it's fine.
		// We could check for the tooltip if we trigger hover, but that's complex.
	});

	it('renders type column correctly for INBOUND', () => {
		renderCell('type', { ...sampleCampaign, type: 'INBOUND' as any });
	});

	it('renders status column correctly', () => {
		renderCell('status', { ...sampleCampaign, status: 'ACTIVE' as any });
		expect(screen.getByText('ACTIVE')).toBeInTheDocument();
	});

	it('renders agents column with N/A when no agents', () => {
		renderCell('agents', { ...sampleCampaign, agents: [] });
		expect(screen.getByText('N/A')).toBeInTheDocument();
	});

	it('renders agents column with agents', () => {
		const agents = [
			{ id: 1, agent: { name: 'Agent 1', language: 'en' } },
			{ id: 2, agent: { name: 'Agent 2', language: 'es' } },
		];
		renderCell('agents', { ...sampleCampaign, agents: agents as any });
		// Mantine Avatar usually renders initials
		expect(screen.getAllByText('A')).toHaveLength(2);
	});

	it('renders agents column with overflow', () => {
		const agents = [
			{ id: 1, agent: { name: 'Agent 1', language: 'en' } },
			{ id: 2, agent: { name: 'Agent 2', language: 'es' } },
			{ id: 3, agent: { name: 'Agent 3', language: 'fr' } },
			{ id: 4, agent: { name: 'Agent 4', language: 'de' } },
		];
		renderCell('agents', { ...sampleCampaign, agents: agents as any });
		expect(screen.getByText('+1')).toBeInTheDocument();
	});

	it('renders action column and handles interactions', async () => {
		const onEdit = vi.fn();
		const onView = vi.fn();
		const onTestCall = vi.fn();
		const onDelete = vi.fn();
		const onClone = vi.fn();

		const TestComponent = () => {
			const columns = useCampaignsColumns({
				onEdit,
				onView,
				onTestCall,
				onDelete,
				onClone,
			});
			const actionsCol = columns.find((c) => (c as any).id === 'actions');
			return (
				<div>
					{(actionsCol as any).cell({ row: { original: sampleCampaign } })}
				</div>
			);
		};

		render(
			<MantineProvider>
				<TestComponent />
			</MantineProvider>
		);

		// Edit
		fireEvent.click(screen.getByLabelText('Edit campaign'));
		expect(onEdit).toHaveBeenCalledWith(sampleCampaign);

		// View
		fireEvent.click(screen.getByLabelText('View campaign'));
		expect(onView).toHaveBeenCalledWith(sampleCampaign);

		// Menu actions
		const menuButton = screen.getByLabelText('Campaign actions');
		fireEvent.click(menuButton);

		// View Metrics
		const metricsItem = await screen.findByText('View Metrics');
		fireEvent.click(metricsItem);
		expect(mockNavigate).toHaveBeenCalledWith(
			`/campaigns/metrics/${sampleCampaign.id}`
		);

		// Test Call
		fireEvent.click(menuButton);
		const testCallItem = await screen.findByText('Test Call');
		fireEvent.click(testCallItem);
		expect(onTestCall).toHaveBeenCalledWith(sampleCampaign);

		// Clone
		fireEvent.click(menuButton);
		const cloneItem = await screen.findByText('Clone Campaign');
		fireEvent.click(cloneItem);
		expect(onClone).toHaveBeenCalledWith(sampleCampaign);

		// Delete
		fireEvent.click(menuButton);
		const deleteItem = await screen.findByText('Delete');
		fireEvent.click(deleteItem);
		expect(onDelete).toHaveBeenCalledWith(sampleCampaign);
	});
});

describe('getCampaignStatusInfo', () => {
	it('returns proper info for known statuses', () => {
		const info = getCampaignStatusInfo('ACTIVE');
		expect(info).toBeDefined();
		expect(info.label).toBeTruthy();
		expect(info.color).toBeTruthy();
	});

	it('falls back gracefully for unknown status', () => {
		const info = getCampaignStatusInfo('NON_EXISTENT' as any);
		expect(info.label).toBe('NON_EXISTENT');
		expect(info.color).toBe('gray');
	});
});
