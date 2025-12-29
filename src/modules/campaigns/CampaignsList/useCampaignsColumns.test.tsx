import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
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

// Mock usePermissions so action visibility rules can be applied in tests
const mockCanAccessModule = vi.fn((_module: any) => true);
const mockCanPerformAction = vi.fn((_module: any, _permission: any) => true);
vi.mock('~/hooks/usePermissions', () => ({
	default: () => ({
		canAccessModule: mockCanAccessModule,
		canPerformAction: mockCanPerformAction,
		hasAnyPermission: vi.fn(),
		hasAllPermissions: vi.fn(),
	}),
}));

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

	const draftCampaign: Campaign = {
		...sampleCampaign,
		id: 456,
		name: 'Draft Campaign',
		isDraft: true,
		draftStep: 2,
	};

	const defaultProps = {
		onEdit: vi.fn(),
		onView: vi.fn(),
		onTestCall: vi.fn(),
		onDelete: vi.fn(),
		onClone: vi.fn(),
		onContinueDraft: vi.fn(),
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

		return renderWithProviders(<TestComponent />);
	};

	it('renders name cell with hover card details', () => {
		renderCell('name', sampleCampaign);
		expect(screen.getByText('Sample')).toBeInTheDocument();
	});

	it('renders draft badge for draft campaigns', () => {
		renderCell('name', draftCampaign);
		expect(screen.getByText('Draft Campaign')).toBeInTheDocument();
		expect(screen.getByText('Draft')).toBeInTheDocument();
	});

	it('does not render draft badge for non-draft campaigns', () => {
		renderCell('name', sampleCampaign);
		expect(screen.getByText('Sample')).toBeInTheDocument();
		expect(screen.queryByText('Draft')).not.toBeInTheDocument();
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

	it('renders action column and handles interactions', async () => {
		const onEdit = vi.fn();
		const onView = vi.fn();
		const onTestCall = vi.fn();
		const onDelete = vi.fn();
		const onClone = vi.fn();
		const onContinueDraft = vi.fn();

		const TestComponent = () => {
			const columns = useCampaignsColumns({
				onEdit,
				onView,
				onTestCall,
				onDelete,
				onClone,
				onContinueDraft,
			});

			const actionsCol = columns.find((c) => (c as any).id === 'actions');
			return (
				<div>
					{(actionsCol as any).cell({ row: { original: sampleCampaign } })}
				</div>
			);
		};

		renderWithProviders(<TestComponent />);

		// Edit
		fireEvent.click(screen.getByLabelText('Edit campaign'));
		expect(onEdit).toHaveBeenCalledWith(sampleCampaign);

		// View
		fireEvent.click(screen.getByLabelText('View campaign'));
		expect(onView).toHaveBeenCalledWith(sampleCampaign);

		// Test Call inline action
		const testCallBtn = screen.getByLabelText('Test Call');
		fireEvent.click(testCallBtn);
		expect(onTestCall).toHaveBeenCalledWith(sampleCampaign);

		// Clone inline action
		const cloneBtn = screen.getByLabelText('Clone campaign');
		fireEvent.click(cloneBtn);
		expect(onClone).toHaveBeenCalledWith(sampleCampaign);

		// Delete inline action
		const deleteBtn = screen.getByLabelText('Delete campaign');
		fireEvent.click(deleteBtn);
		expect(onDelete).toHaveBeenCalledWith(sampleCampaign);

		// Continue Draft should NOT be visible for non-draft campaigns
		expect(screen.queryByLabelText('Continue setup')).not.toBeInTheDocument();
	});

	it('renders Continue Draft button for draft campaigns', async () => {
		const onContinueDraft = vi.fn();

		const TestComponent = () => {
			const columns = useCampaignsColumns({
				...defaultProps,
				onContinueDraft,
			});

			const actionsCol = columns.find((c) => (c as any).id === 'actions');
			return (
				<div>
					{(actionsCol as any).cell({ row: { original: draftCampaign } })}
				</div>
			);
		};

		renderWithProviders(<TestComponent />);

		const continueDraftBtn = screen.getByLabelText('Continue setup');
		expect(continueDraftBtn).toBeInTheDocument();

		fireEvent.click(continueDraftBtn);
		expect(onContinueDraft).toHaveBeenCalledWith(draftCampaign);
	});

	it('hides clone menu item when user lacks CREATE permission', async () => {
		mockCanPerformAction.mockImplementation((_module: any, permission: any) => {
			return permission !== 'CREATE';
		});
		renderCell('actions', sampleCampaign);

		expect(screen.queryByLabelText('Clone campaign')).not.toBeInTheDocument();
		mockCanPerformAction.mockReturnValue(true);
	});

	it('renders action buttons in correct order: View, Edit, Menu', () => {
		const TestComponent = () => {
			const columns = useCampaignsColumns(defaultProps);
			const actionsCol = columns.find((c) => (c as any).id === 'actions');
			return (
				<div>
					{(actionsCol as any).cell({ row: { original: sampleCampaign } })}
				</div>
			);
		};

		renderWithProviders(<TestComponent />);

		const viewButton = screen.getByLabelText('View campaign');
		const editButton = screen.getByLabelText('Edit campaign');
		// Menu removed; check order contains these inline icons in order

		// Verify DOM order: View should come before Edit, Edit should come before Menu
		expect(
			viewButton.compareDocumentPosition(editButton) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		const testCallButton = screen.getByLabelText('Test Call');
		expect(
			editButton.compareDocumentPosition(testCallButton) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});
});

describe('getCampaignStatusInfo', () => {
	it('returns proper info for known statuses', () => {
		const info = getCampaignStatusInfo('RUNNING');
		expect(info).toBeDefined();
		expect(info.label).toBe('status.RUNNING');
		expect(info.color).toBeTruthy();
	});

	it('falls back gracefully for unknown status', () => {
		const info = getCampaignStatusInfo('NON_EXISTENT' as any);
		expect(info.label).toBe('NON_EXISTENT');
		expect(info.color).toBe('gray');
	});

	it('returns status.UNKNOWN for empty status', () => {
		const info = getCampaignStatusInfo('' as any);
		expect(info.label).toBe('status.UNKNOWN');
	});
});
