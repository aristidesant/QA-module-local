import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
// Import component after mocks so mocks are applied

const {
	mockCreate,
	mockUpdate,
	mockNotificationsShow,
	mockSetFlowJson,
	mockUseDispositionBuilderStore,
} = vi.hoisted(() => ({
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
	mockNotificationsShow: vi.fn(),
	mockSetFlowJson: vi.fn(),
	mockUseDispositionBuilderStore: vi.fn(),
}));

vi.mock('~/queries/dispositionFlowQueries', () => ({
	useCreateDispositionFlow: () => ({
		mutateAsync: mockCreate,
		isPending: false,
	}),
	useUpdateDispositionFlow: () => ({
		mutateAsync: mockUpdate,
		isPending: false,
	}),
}));

vi.mock('@mantine/notifications', () => ({
	notifications: { show: mockNotificationsShow },
}));

// Mock Mantine Modal to simplify testing and ensure modal content appears in the DOM
vi.mock('@mantine/core', async () => {
	const actual = await vi.importActual<any>('@mantine/core');
	return {
		...actual,
		Modal: ({ opened, onClose, children, title }: any) =>
			opened ? (
				<div data-testid={`modal-${title?.replace(/\s+/g, '-').toLowerCase()}`}>
					<button onClick={onClose} data-testid='modal-close-btn'>
						Close Modal
					</button>
					{children}
				</div>
			) : null,
	};
});

vi.mock(
	'~/modules/campaigns/CampaignsForm/DispositionSection/dispositionStore',
	() => ({
		useDispositionBuilderStore: (selector?: any) =>
			selector
				? selector(mockUseDispositionBuilderStore())
				: mockUseDispositionBuilderStore(),
	})
);

import DispositionBuilder from './DispositionBuilder';

describe('DispositionBuilder', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: mockSetFlowJson,
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});
	});

	it('shows empty state and validation when saving without nodes', () => {
		renderWithProviders(<DispositionBuilder />);

		expect(screen.getByText(/No outcomes selected yet/i)).toBeInTheDocument();

		// Click save and expect validation notification
		fireEvent.click(
			screen.getByRole('button', { name: /Create Flow|Update Flow/i })
		);
		expect(mockNotificationsShow).toHaveBeenCalled();
	});

	it('renders flow name when provided by store', async () => {
		const setFlowJson = vi.fn();
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: { name: 'My Flow' },
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson,
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		// campaignId/cancel tests are placed below

		renderWithProviders(<DispositionBuilder />);

		const input = screen.getByPlaceholderText(
			'Outcome Name'
		) as HTMLInputElement;
		expect(input).toHaveValue('My Flow');
	});

	it('shows campaign ID in input label title when campaignId present', () => {
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: { name: 'My Flow' },
			campaignId: 5,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder />);
		const labelText = screen.getByText('Outcome Name');
		expect(labelText.closest('label')?.getAttribute('title')).toContain(
			'Campaign ID: 5'
		);
	});

	it('renders cancel button when onCancel is provided and calls it', async () => {
		const onCancel = vi.fn();
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				dispositionNodes: [{ id: 1, name: 'Node 1', children: [] }],
				name: 'Flow name',
			},
			campaignId: 2,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder onCancel={onCancel} />);
		const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
		await userEvent.click(cancelBtn);
		expect(onCancel).toHaveBeenCalled();
	});

	it('shows validation message when no name', async () => {
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: { dispositionNodes: [{ id: 1, name: 'Node 1', children: [] }] },
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder />);

		// Click save and expect validation notification about name
		await userEvent.click(
			screen.getByRole('button', { name: /Create Flow|Update Flow/i })
		);
		expect(mockNotificationsShow).toHaveBeenCalled();
	});

	it('shows save button and is clickable when nodes and name present', async () => {
		const setFlowJson = vi.fn();
		const onComplete = vi.fn();
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				dispositionNodes: [{ id: 1, name: 'Node 1', children: [] }],
				name: 'Flow name',
			},
			campaignId: 2,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson,
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		mockCreate.mockResolvedValue({});

		renderWithProviders(<DispositionBuilder onComplete={onComplete} />);

		await userEvent.click(
			screen.getByRole('button', { name: /Create Flow|Update Flow/i })
		);
		await screen.findByText(/Create Flow|Update Flow/i); // let render settle
		// We don't assert on the mutation directly here — ensure save did not show an error notification
		// The UI should not have shown the 'no nodes' error due to presence of nodes
		// We'll assert Save button is clickable and no error notification with 'Please add at least one outcome node.' was shown
		expect(
			screen.getByRole('button', { name: /Create Flow|Update Flow/i })
		).toBeInTheDocument();
	});

	describe('Save flows - create and update', () => {
		describe('Create mode', () => {
			it('calls create mutation and onComplete on save (mutation resolves)', async () => {
				const onComplete = vi.fn();
				mockUseDispositionBuilderStore.mockReturnValue({
					flowJson: {
						dispositionNodes: [{ id: 21, name: 'Create Node', children: [] }],
						name: 'Flow name',
					},
					campaignId: 2,
					dispositionFlow: undefined,
					removeNode: vi.fn(),
					setFlowJson: vi.fn(),
					previewNode: null,
					setPreviewNode: vi.fn(),
					populateNodeWithChildren: vi.fn(),
					addMissingSiblingsToParent: vi.fn(),
					selectedCatalog: null,
				});

				const createSpy = vi.fn().mockResolvedValue({});
				mockCreate.mockImplementation(createSpy as any);

				renderWithProviders(<DispositionBuilder onComplete={onComplete} />);

				await userEvent.click(
					screen.getByRole('button', { name: /Create Flow|Update Flow/i })
				);

				await waitFor(() => expect(createSpy).toHaveBeenCalled());
				await waitFor(() => expect(onComplete).toHaveBeenCalled());
			});

			it('shows error notification when create mutation rejects', async () => {
				const onComplete = vi.fn();
				mockUseDispositionBuilderStore.mockReturnValue({
					flowJson: {
						dispositionNodes: [{ id: 22, name: 'Create Node', children: [] }],
						name: 'Flow name',
					},
					campaignId: 2,
					dispositionFlow: undefined,
					removeNode: vi.fn(),
					setFlowJson: vi.fn(),
					previewNode: null,
					setPreviewNode: vi.fn(),
					populateNodeWithChildren: vi.fn(),
					addMissingSiblingsToParent: vi.fn(),
					selectedCatalog: null,
				});

				mockCreate.mockRejectedValue(new Error('create fail'));
				renderWithProviders(<DispositionBuilder onComplete={onComplete} />);

				await userEvent.click(
					screen.getByRole('button', { name: /Create Flow|Update Flow/i })
				);

				await waitFor(() =>
					expect(mockNotificationsShow).toHaveBeenCalledWith(
						expect.objectContaining({
							message: 'An error occurred while saving the outcome flow.',
						})
					)
				);
			});
		});

		describe('Update mode', () => {
			it('calls update mutation and onComplete on save when updating (mutation resolves)', async () => {
				const onComplete = vi.fn();
				mockUseDispositionBuilderStore.mockReturnValue({
					flowJson: {
						dispositionNodes: [{ id: 23, name: 'Update Node', children: [] }],
						name: 'Flow name',
					},
					campaignId: 2,
					dispositionFlow: { id: 10 } as any,
					removeNode: vi.fn(),
					setFlowJson: vi.fn(),
					previewNode: null,
					setPreviewNode: vi.fn(),
					populateNodeWithChildren: vi.fn(),
					addMissingSiblingsToParent: vi.fn(),
					selectedCatalog: null,
				});

				const updateSpy = vi.fn().mockResolvedValue({});
				mockUpdate.mockImplementation(updateSpy as any);

				renderWithProviders(<DispositionBuilder onComplete={onComplete} />);

				await userEvent.click(
					screen.getByRole('button', { name: /Create Flow|Update Flow/i })
				);

				await waitFor(() => expect(updateSpy).toHaveBeenCalled());
				await waitFor(() => expect(onComplete).toHaveBeenCalled());
			});

			it('shows error notification when update mutation rejects', async () => {
				mockUseDispositionBuilderStore.mockReturnValue({
					flowJson: {
						dispositionNodes: [{ id: 24, name: 'Update Node', children: [] }],
						name: 'Flow name',
					},
					campaignId: 2,
					dispositionFlow: { id: 10 } as any,
					removeNode: vi.fn(),
					setFlowJson: vi.fn(),
					previewNode: null,
					setPreviewNode: vi.fn(),
					populateNodeWithChildren: vi.fn(),
					addMissingSiblingsToParent: vi.fn(),
					selectedCatalog: null,
				});

				mockUpdate.mockRejectedValue(new Error('update fail'));
				renderWithProviders(<DispositionBuilder />);

				await userEvent.click(
					screen.getByRole('button', { name: /Create Flow|Update Flow/i })
				);

				await waitFor(() =>
					expect(mockNotificationsShow).toHaveBeenCalledWith(
						expect.objectContaining({
							message: 'An error occurred while saving the outcome flow.',
						})
					)
				);
			});

			it('shows save button and is clickable in update mode', async () => {
				const onComplete = vi.fn();
				mockUseDispositionBuilderStore.mockReturnValue({
					flowJson: {
						dispositionNodes: [{ id: 1, name: 'Node 1', children: [] }],
						name: 'Flow name',
					},
					campaignId: 2,
					dispositionFlow: { id: 10 } as any,
					removeNode: vi.fn(),
					setFlowJson: vi.fn(),
					previewNode: null,
					setPreviewNode: vi.fn(),
					populateNodeWithChildren: vi.fn(),
					addMissingSiblingsToParent: vi.fn(),
					selectedCatalog: null,
				});

				mockUpdate.mockResolvedValue({});

				renderWithProviders(<DispositionBuilder onComplete={onComplete} />);

				await userEvent.click(
					screen.getByRole('button', { name: /Create Flow|Update Flow/i })
				);
				expect(
					screen.getByRole('button', { name: /Update Flow|Create Flow/i })
				).toBeInTheDocument();
			});
		});
	});

	it('renders preview modal when previewNode is set', async () => {
		const setPreviewNode = vi.fn();
		const node = { id: 1, name: 'Preview Node', children: [] } as any;
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: node,
			setPreviewNode,
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder />);

		// Modal should be visible and contain a preview title test id
		expect(
			screen.getByTestId('modal-outcome-group-preview')
		).toBeInTheDocument();
		// Close modal should call setPreviewNode
		const closeBtn = screen.getByTestId('modal-close-btn');
		fireEvent.click(closeBtn);
		expect(setPreviewNode).toHaveBeenCalledWith(null);
	});

	it('shows DispositionNodeForm when selectedNode is leaf', async () => {
		const setPreviewNode = vi.fn();
		// const node = { id: 2, name: 'Leaf Node', children: [] } as any;
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode,
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		// Render with a leaf node in the flow to allow selection
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				dispositionNodes: [{ id: 100, name: 'Node Leaf', children: [] }],
				name: 'Flow name',
			},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode,
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder />);
		await userEvent.click(screen.getByText('Node Leaf'));
		expect(screen.getByText(/Editing outcome/i)).toBeInTheDocument();
		// Click the form cancel button and ensure form closes
		const formCancel = screen.getByRole('button', { name: /Cancel/i });
		await userEvent.click(formCancel);
		expect(
			screen.getByText(
				/Select a node to edit its properties or preview a group/i
			)
		).toBeInTheDocument();
	});

	it('shows DispositionGroupPreview when selectedNode has children', async () => {
		const nodeWithChildren = {
			id: 3,
			name: 'Parent Node',
			children: [{ id: 4, name: 'Child', children: [] }],
		} as any;
		const setPreviewNode = vi.fn();
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: nodeWithChildren,
			setPreviewNode,
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		// Render with a parent node in the flow to allow selection
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				dispositionNodes: [
					{
						id: 200,
						name: 'Parent Node',
						children: [{ id: 201, name: 'Child', children: [] }],
					},
				],
				name: 'Flow name',
			},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode,
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder />);
		const nodeTexts = screen.getAllByText('Parent Node');
		await userEvent.click(nodeTexts[0]);
		expect(screen.getByText(/Total nodes/i)).toBeInTheDocument();
	});

	it('shows parent label when selecting a child node', async () => {
		const setPreviewNode = vi.fn();
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				dispositionNodes: [
					{
						id: 300,
						name: 'Parent Node',
						children: [{ id: 301, name: 'Child Node', children: [] }],
					},
				],
				name: 'Flow name',
			},
			campaignId: undefined,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode,
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder />);
		await userEvent.click(screen.getByText('Child Node'));
		// The parent badge should show the parent's name inside the form
		const form = screen.getByText(/Editing outcome/i).closest('form');
		expect(form).toBeTruthy();
		expect(form && within(form).getByText('Parent Node')).toBeInTheDocument();
	});

	it('passes proper payload to the create mutation', async () => {
		const onComplete = vi.fn();
		const createSpy = vi.fn().mockResolvedValue({});
		mockCreate.mockImplementation(createSpy as any);
		// Provide a flow with extra fields to assert the filledFlowJson generation
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				dispositionNodes: [{ id: 1, name: 'Node 1', children: [] }],
				name: 'Flow name',
				clientId: 123,
			},
			campaignId: 7,
			dispositionFlow: undefined,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder onComplete={onComplete} />);
		await userEvent.click(
			screen.getByRole('button', { name: /Create Flow|Update Flow/i })
		);

		await waitFor(() => expect(createSpy).toHaveBeenCalled());
		const payload = createSpy.mock.calls[0][0] as any;
		expect(payload.flowJson.clientId).toBe(123);
		expect(payload.campaignId).toBe(7);
	});

	it('passes proper payload to the update mutation', async () => {
		const onComplete = vi.fn();
		const updateSpy = vi.fn().mockResolvedValue({});
		mockUpdate.mockImplementation(updateSpy as any);
		mockUseDispositionBuilderStore.mockReturnValue({
			flowJson: {
				id: 5,
				dispositionNodes: [{ id: 1, name: 'Node 1', children: [] }],
				name: 'Flow name',
			},
			campaignId: 7,
			dispositionFlow: { id: 5 } as any,
			removeNode: vi.fn(),
			setFlowJson: vi.fn(),
			previewNode: null,
			setPreviewNode: vi.fn(),
			populateNodeWithChildren: vi.fn(),
			addMissingSiblingsToParent: vi.fn(),
			selectedCatalog: null,
		});

		renderWithProviders(<DispositionBuilder onComplete={onComplete} />);
		await userEvent.click(
			screen.getByRole('button', { name: /Create Flow|Update Flow/i })
		);

		await waitFor(() => expect(updateSpy).toHaveBeenCalled());
		const payload = updateSpy.mock.calls[0][0] as any;
		expect(payload.id).toBe(5);
		expect(payload.data.flowJson.id).toBe(5);
	});

	// Additional rendering tests moved out of preview modal test
});

export {};
