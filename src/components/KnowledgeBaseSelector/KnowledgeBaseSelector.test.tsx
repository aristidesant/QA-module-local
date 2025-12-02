import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import KnowledgeBaseSelector from './KnowledgeBaseSelector';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import * as queries from '~/queries/knowledgeBaseQueries';
import type { KnowledgeBaseModel } from '~/models/KnowledgeBaseModel';

const kbData: KnowledgeBaseModel[] = [
	{
		id: 1,
		name: 'Doc A',
		description: 'Desc A',
		type: 'FILE' as any,
		sourceUrl: null,
		textContent: null,
		status: 'ACTIVE' as any,
		identifier: null,
		uploadError: null,
		retryCount: 0,
		lastSyncAt: null,
		clientId: 1,
		fileId: 10,
		file: {
			id: 10,
			name: 'a.txt',
			mime: 'text/plain',
			repositoryKey: '',
			repositoryRoute: '',
			extension: 'txt',
			description: null,
			typeId: 0,
			userId: 1,
			clientId: 1,
			createdAt: '',
			updatedAt: '',
			deletedAt: null,
		},
		userId: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	},
	{
		id: 2,
		name: 'URL B',
		description: '',
		type: 'URL' as any,
		sourceUrl: 'https://example.com',
		textContent: null,
		status: 'ACTIVE' as any,
		identifier: null,
		uploadError: null,
		retryCount: 0,
		lastSyncAt: null,
		clientId: 1,
		fileId: null,
		file: null,
		userId: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	},
	{
		id: 3,
		name: 'Text C',
		description: 'Snippet',
		type: 'TEXT' as any,
		sourceUrl: null,
		textContent: 'hello',
		status: 'ACTIVE' as any,
		identifier: null,
		uploadError: null,
		retryCount: 0,
		lastSyncAt: null,
		clientId: 1,
		fileId: null,
		file: null,
		userId: 1,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		deletedAt: null,
	},
];

vi.mock('~/queries/knowledgeBaseQueries', async () => {
	const actual = await vi.importActual<typeof queries>(
		'~/queries/knowledgeBaseQueries'
	);
	return {
		...actual,
		useKnowledgeBases: vi.fn(() => ({ data: kbData, isLoading: false })),
	};
});

function setup(initialSelectedIds: number[] = []) {
	const onCancel = vi.fn();
	const onSave = vi.fn();
	renderWithProviders(
		<KnowledgeBaseSelector
			initialSelectedIds={initialSelectedIds}
			onCancel={onCancel}
			onSave={onSave}
		/>
	);
	return { onCancel, onSave };
}

describe('KnowledgeBaseSelector', () => {
	it('renders search and type filter controls', async () => {
		setup();
		expect(
			screen.getByPlaceholderText('Search knowledge bases')
		).toBeInTheDocument();
		expect(screen.getByRole('radiogroup')).toBeInTheDocument(); // segmented control group
	});

	it('toggles selection via row click', async () => {
		setup();
		const user = userEvent.setup();
		const rows = screen.getAllByRole('row');
		// Skip header row; click first data row
		await user.click(rows[1]);
		// After clicking row, its checkbox should be checked
		let checkboxes = screen.getAllByRole('checkbox');
		// first column header checkbox + 3 row checkboxes
		await waitFor(() => expect(checkboxes[1]).toBeChecked());
		// clicking again should uncheck
		await user.click(rows[1]);
		checkboxes = screen.getAllByRole('checkbox');
		await waitFor(() => expect(checkboxes[1]).not.toBeChecked());
	});

	it('selects/deselects via checkbox and header select-all', async () => {
		setup();
		const user = userEvent.setup();
		let checkboxes = screen.getAllByRole('checkbox');
		const headerSelectAll = checkboxes[0];

		// header select all
		await user.click(headerSelectAll);
		// all row checkboxes should be checked
		await waitFor(() => {
			checkboxes = screen.getAllByRole('checkbox');
			expect(
				checkboxes.slice(1).every((cb) => (cb as HTMLInputElement).checked)
			).toBe(true);
		});

		// deselect one row via checkbox
		await user.click(checkboxes[2]);
		expect((checkboxes[2] as HTMLInputElement).checked).toBe(false);
	});

	it('saves selected ids on Save Selections', async () => {
		const { onSave } = setup();
		const user = userEvent.setup();
		const rows = screen.getAllByRole('row');
		await user.click(rows[2]); // select second row id=2
		await user.click(screen.getByRole('button', { name: /save selections/i }));
		expect(onSave).toHaveBeenCalledWith([2]);
	});
});
