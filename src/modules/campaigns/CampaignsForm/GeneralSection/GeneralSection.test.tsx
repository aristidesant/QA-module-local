import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GeneralSection from './GeneralSection';
import {
	CampaignFormProvider,
	useCampaignForm,
	useCampaignFormContext,
} from '../../campaignFormFunctions';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { CampaignStatus } from '~/models/CampaignStatus';
import {
	useGetCampaignObjectives,
	useGetCampaignObjectiveById,
} from '~/queries/campaignObjectivesQueries';

vi.mock('@mantine/core', async () => {
	const actual =
		await vi.importActual<typeof import('@mantine/core')>('@mantine/core');

	return {
		...actual,
		Select: ({
			label,
			description,
			data,
			onChange,
			value,
		}: {
			label: string;
			description?: string;
			data?: { group: string; items: { value: string; label: string }[] }[];
			onChange: (val: string | null) => void;
			value?: string | null;
		}) => (
			<div>
				<div>{label}</div>
				{description && <div>{description}</div>}
				<div data-testid='select-options'>
					{data?.flatMap((group) =>
						group.items.map((item) => (
							<button
								key={item.value}
								type='button'
								onClick={() => onChange(item.value)}
							>
								{item.label}
							</button>
						))
					)}
					<button type='button' onClick={() => onChange(null)}>
						clear objective
					</button>
				</div>
				<div data-testid='selected-value'>{value || ''}</div>
			</div>
		),
	};
});

vi.mock('~/queries/campaignObjectivesQueries', () => ({
	useGetCampaignObjectives: vi.fn(),
	useGetCampaignObjectiveById: vi.fn(),
}));

const mockUseGetCampaignObjectives =
	useGetCampaignObjectives as unknown as ReturnType<typeof vi.fn>;
const mockUseGetCampaignObjectiveById =
	useGetCampaignObjectiveById as unknown as ReturnType<typeof vi.fn>;

const renderComponent = (objectiveId?: number) => {
	let capturedForm: ReturnType<typeof useCampaignForm> | null = null;

	const FormValueProbe = () => {
		const formContext = useCampaignFormContext();
		return (
			<div data-testid='objective-value'>
				{formContext.values.objectiveId ?? ''}
			</div>
		);
	};

	const Wrapper = ({ children }: { children: React.ReactNode }) => {
		const form = useCampaignForm({
			initialValues: {
				name: 'Campaign',
				agentName: 'Agent',
				description: '',
				budget: 0,
				configId: '',
				spent: 0,
				type: 'OUTBOUND',
				status: CampaignStatus.PENDING,
				userId: 1,
				clientId: 1,
				promptId: undefined,
				objectiveId,
				voiceId: undefined,
				tags: [],
				workingHours: {},
				agentConfig: {},
			},
		});
		capturedForm = form;

		return <CampaignFormProvider form={form}>{children}</CampaignFormProvider>;
	};

	return {
		get form() {
			return capturedForm!;
		},
		...renderWithProviders(
			<Wrapper>
				<GeneralSection />
				<FormValueProbe />
			</Wrapper>
		),
	};
};

describe('GeneralSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Element.prototype.scrollIntoView = vi.fn();
		mockUseGetCampaignObjectives.mockReturnValue({
			data: { data: [] },
			isLoading: false,
			error: undefined,
		});
		mockUseGetCampaignObjectiveById.mockReturnValue({ data: undefined });
	});

	it('lists objectives and updates form value when one is selected', async () => {
		mockUseGetCampaignObjectives.mockReturnValue({
			data: {
				data: [
					{ id: 1, name: 'Revenue Growth', category: { name: 'Sales' } },
					{ id: 2, name: 'Customer Care', category: { name: 'Support' } },
				],
			},
			isLoading: false,
			error: undefined,
		});

		renderComponent();
		const user = userEvent.setup();

		await user.click(screen.getByText('Revenue Growth'));

		await waitFor(() => {
			expect(screen.getByTestId('objective-value').textContent).toBe('1');
		});
	});

	it('includes the selected objective even when not returned in the paginated list', async () => {
		mockUseGetCampaignObjectives.mockReturnValue({
			data: { data: [] },
			isLoading: false,
			error: undefined,
		});
		mockUseGetCampaignObjectiveById.mockReturnValue({
			data: { id: 42, name: 'Retain Customers', category: { name: 'Support' } },
		});

		renderComponent(42);
		const user = userEvent.setup();

		await user.click(screen.getByText('Retain Customers'));

		expect(screen.getByText('Retain Customers')).toBeInTheDocument();
		expect(screen.getByTestId('objective-value').textContent).toBe('42');

		await user.click(screen.getByText('clear objective'));
	});

	it('clears the objective when the selection is removed', async () => {
		mockUseGetCampaignObjectives.mockReturnValue({
			data: {
				data: [{ id: 3, name: 'Expand Market', category: { name: 'Growth' } }],
			},
			isLoading: false,
			error: undefined,
		});

		renderComponent(3);
		const user = userEvent.setup();

		await user.click(screen.getByText('clear objective'));

		await waitFor(() => {
			expect(screen.getByTestId('objective-value').textContent).toBe('');
		});
	});
});
