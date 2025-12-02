import { screen } from '@testing-library/react';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import BaseTable from '~/components/BaseTable/BaseTable';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import useKnowledgeBaseTableColumns from './useKnowledgeBaseTableColumns';

const data: KnowledgeBaseModel[] = [
	{
		id: 1,
		name: 'KB File',
		description: 'File desc',
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
			name: 'manual.pdf',
			mime: 'application/pdf',
			repositoryKey: '',
			repositoryRoute: '',
			extension: 'pdf',
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
		name: 'KB URL',
		description: '',
		type: 'URL' as any,
		sourceUrl: 'https://docs.example.com',
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
		name: 'KB Text',
		description: 'Short snippet',
		type: 'TEXT' as any,
		sourceUrl: null,
		textContent: 'hello world',
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

function TestTable() {
	const columns = useKnowledgeBaseTableColumns();
	return (
		<BaseTable<KnowledgeBaseModel>
			data={data}
			columns={columns as any}
			density='compact'
			enablePagination={false}
			enableFiltering={false}
			showPaginationControls={false}
		/>
	);
}

describe('useKnowledgeBaseTableColumns', () => {
	it('renders Name, Description, and Type columns with correct content', () => {
		renderWithProviders(<TestTable />);

		// Column headers (robust to role differences)
		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Description')).toBeInTheDocument();
		expect(screen.getByText('Type')).toBeInTheDocument();

		// Row 1: FILE type, description shown, type badge text "File"
		expect(screen.getByText('KB File')).toBeInTheDocument();
		expect(screen.getByText('File desc')).toBeInTheDocument();
		expect(screen.getAllByText('File').length).toBeGreaterThan(0);

		// Row 2: URL type, description fallback to sourceUrl
		expect(screen.getByText('KB URL')).toBeInTheDocument();
		expect(screen.getByText('https://docs.example.com')).toBeInTheDocument();
		expect(screen.getAllByText('URL').length).toBeGreaterThan(0);

		// Row 3: TEXT type, description present
		expect(screen.getByText('KB Text')).toBeInTheDocument();
		expect(screen.getByText('Short snippet')).toBeInTheDocument();
		expect(screen.getAllByText('Text').length).toBeGreaterThan(0);
	});
});
