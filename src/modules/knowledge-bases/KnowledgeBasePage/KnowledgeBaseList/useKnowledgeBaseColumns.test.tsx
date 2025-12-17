import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BaseTable from '~/components/BaseTable';
import {
	KnowledgeBaseStatus,
	KnowledgeBaseType,
} from '~/models/KnowledgeBaseModel';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';
import { useKnowledgeBaseColumns } from './useKnowledgeBaseColumns';

const kb: KnowledgeBaseModel = {
	id: 1,
	name: 'Alpha',
	description: 'Description',
	type: KnowledgeBaseType.FILE,
	status: KnowledgeBaseStatus.FAILED,
	clientId: 1,
	userId: 1,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
	file: {
		id: 10,
		name: 'alpha.pdf',
		repositoryRoute: 'https://example.com/alpha.pdf',
	} as any,
};

function TestTable(props: { canUpdate: boolean; canDelete: boolean }) {
	const retryMutation = { mutateAsync: vi.fn(), status: 'idle' } as any;
	const deleteMutation = { mutate: vi.fn(), status: 'idle' } as any;
	const setRight = vi.fn();
	const refetch = vi.fn(async () => ({}));

	const columns = useKnowledgeBaseColumns(
		retryMutation,
		deleteMutation,
		setRight,
		refetch,
		{
			canUpdate: props.canUpdate,
			canDelete: props.canDelete,
		}
	);

	return <BaseTable data={[kb]} columns={columns} />;
}

describe('useKnowledgeBaseColumns', () => {
	it('hides edit/delete/retry when permissions are missing', () => {
		renderWithProviders(<TestTable canUpdate={false} canDelete={false} />);

		expect(screen.queryByLabelText('Retry upload')).not.toBeInTheDocument();
		expect(
			screen.queryByLabelText('Edit knowledge base')
		).not.toBeInTheDocument();
		expect(
			screen.queryByLabelText('Delete knowledge base')
		).not.toBeInTheDocument();
	});

	it('shows edit and retry when update permission exists, and delete when delete permission exists', () => {
		renderWithProviders(<TestTable canUpdate canDelete />);

		expect(screen.getByLabelText('Retry upload')).toBeInTheDocument();
		expect(screen.getByLabelText('Edit knowledge base')).toBeInTheDocument();
		expect(screen.getByLabelText('Delete knowledge base')).toBeInTheDocument();
	});
});

export {};
