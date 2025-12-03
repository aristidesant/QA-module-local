import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BaseTable from '~/components/BaseTable';
import useRolesColumns from './useRolesColumns';
import type { RoleModel } from '~/models/RoleModel';
import { vi, describe, it, expect } from 'vitest';

const role: RoleModel = {
	id: 1,
	name: 'Admin',
	code: 'ADMIN',
	description: 'Administrator role',
	isActive: true,
	isSystem: true,
	createdAt: '2024-01-15T10:00:00Z',
	updatedAt: '2024-01-20T15:30:00Z',
	modulePermissions: [],
};

function TestTable(props: { onView: any; onEdit: any; onDelete: any }) {
	const cols = useRolesColumns(props);
	return (
		<BaseTable
			data={[role]}
			columns={cols}
			onRowClick={() => props.onView(1)}
		/>
	);
}

describe('useRolesColumns', () => {
	it('renders columns and binds actions correctly', async () => {
		const onView = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		renderWithProviders(
			<TestTable onView={onView} onEdit={onEdit} onDelete={onDelete} />
		);

		expect(screen.getByText('Admin')).toBeInTheDocument();
		expect(screen.getByText('ADMIN')).toBeInTheDocument();

		// Check action buttons exist; delete should be disabled for system role
		const viewBtn = screen.getByLabelText('View role');
		const editBtn = screen.getByLabelText('Edit role');
		const deleteBtn = screen.getByLabelText('Delete role');

		await userEvent.click(viewBtn);
		await userEvent.click(editBtn);

		expect(onView).toHaveBeenCalled();
		expect(onEdit).toHaveBeenCalled();
		expect(deleteBtn).toBeDisabled();
	});

	it('enables delete for non-system roles', async () => {
		const nonSystemRole = { ...role, id: 3, isSystem: false };
		const onView = vi.fn();
		const onEdit = vi.fn();
		const onDelete = vi.fn();

		function Table2() {
			const cols = useRolesColumns({ onView, onEdit, onDelete });
			return <BaseTable data={[nonSystemRole as RoleModel]} columns={cols} />;
		}

		renderWithProviders(<Table2 />);

		const deleteBtn = screen.getByLabelText('Delete role');
		expect(deleteBtn).not.toBeDisabled();
	});
});

export {};
