import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { vi, describe, it, expect, afterEach } from 'vitest';
// Note: RolesPage will be imported dynamically per-test to enable test-time module mocks
import * as roleQueries from '~/queries/roleQueries';
import * as modals from '@mantine/modals';
import * as notifications from '@mantine/notifications';
import useRolesPageStore from '../store/useRolesPageStore';
import type { RolesPageState } from '../store/useRolesPageStore';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('~/queries/roleQueries');
vi.mock('@mantine/modals');
vi.mock('@mantine/notifications');
vi.mock('../store/useRolesPageStore');
// We'll mock RolesList per-test when necessary via vi.doMock and dynamic import

const mockRoles = [
	{
		id: 1,
		name: 'Admin',
		code: 'ADMIN',
		isActive: true,
		isSystem: true,
	},
	{
		id: 2,
		name: 'Support',
		code: 'SUPPORT',
		isActive: false,
		isSystem: false,
	},
];

describe('RolesPage', () => {
	beforeEach(() => {
		vi.resetModules();
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('opens new role modal when New Role clicked', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const openMock = vi.fn();
		(modals as any).modals = { open: openMock, openConfirmModal: vi.fn() };
		const mockStore1 = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore1)
		);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);

		const newButton = screen.getByRole('button', { name: /New Role/ });
		await userEvent.click(newButton);

		expect(openMock).toHaveBeenCalled();
	});

	it('updates search input value', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		(modals as any).modals = { open: vi.fn(), openConfirmModal: vi.fn() };
		const mockStore2 = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore2)
		);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);
		const search = screen.getByPlaceholderText('Search roles');
		await userEvent.type(search, 'Admin');
		expect((search as HTMLInputElement).value).toBe('Admin');
	});

	it('shows confirm modal and deletes role on confirm', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const mutateAsync = vi.fn().mockResolvedValue(undefined);
		vi.mocked(roleQueries.useDeleteRole).mockReturnValue({
			mutateAsync,
		} as any);

		const openConfirmModal = vi.fn();
		(modals as any).modals = { openConfirmModal, open: vi.fn() };
		const notify = vi.fn();
		(notifications as any).notifications = { show: notify };

		const clearRightComponent = vi.fn();
		const mockStore3 = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent,
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore3)
		);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);

		// Click delete on the non-system role (Support)
		const deleteButtons = screen.getAllByLabelText(/Delete role/);
		expect(deleteButtons[1]).not.toBeDisabled();
		await userEvent.click(deleteButtons[1]);

		// openConfirmModal should be called; capture the config and simulate confirm
		expect(openConfirmModal).toHaveBeenCalled();
		const args = openConfirmModal.mock.calls[0][0];
		// simulate confirmation
		await args.onConfirm();

		expect(mutateAsync).toHaveBeenCalledWith(2);
		// Failure is unexpected; we assert notifications for success
		expect(notify).toHaveBeenCalled();
		expect(clearRightComponent).toHaveBeenCalled();
	});

	it('shows cannot delete notification when role is system via injected roles list', async () => {
		// Replace RolesList with a component that calls onDelete with a system role
		vi.doMock('../RolesList', () => ({
			default: (props: any) => {
				props.onDelete?.({ id: 5, isSystem: true, name: 'SYS' });
				return <div />;
			},
		}));

		const notify = vi.fn();
		(notifications as any).notifications = { show: notify };

		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);

		vi.unmock('../RolesList');

		expect(notify).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Cannot delete system role',
				color: 'orange',
			})
		);
	});

	it('calls modals.closeAll when RoleForm.onSuccess is triggered via modal open', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const closeAll = vi.fn();
		(modals as any).modals = {
			open: vi.fn(),
			openConfirmModal: vi.fn(),
			closeAll,
		};

		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);

		// Simulate user clicking New Role which opens a modal; capture the call args
		const newButton = screen.getByRole('button', { name: /New Role/ });
		await userEvent.click(newButton);
		const openCall = (modals as any).modals.open.mock.calls[0][0];
		// Extract children element and call onSuccess prop
		const children = openCall.children as any;
		expect(children.props.onSuccess).toBeDefined();
		await act(async () => children.props.onSuccess());

		expect(closeAll).toHaveBeenCalled();
	});

	it('opens edit modal when edit action clicked', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const open = vi.fn();
		(modals as any).modals = { open, openConfirmModal: vi.fn() };

		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		vi.doMock('../RolesList', () => ({
			default: (props: any) => {
				props.onEdit?.(1);
				return <div />;
			},
		}));
		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);

		expect(open).toHaveBeenCalled();
		const args = open.mock.calls[0][0];
		expect(args.title).toBe('Edit Role');
		vi.unmock('../RolesList');
	});

	it('shows error notification when delete fails', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const mutateAsync = vi.fn().mockRejectedValue(new Error('Delete failed'));
		vi.mocked(roleQueries.useDeleteRole).mockReturnValue({
			mutateAsync,
		} as any);

		const openConfirmModal = vi.fn();
		(modals as any).modals = { openConfirmModal, open: vi.fn() };
		const notify = vi.fn();
		(notifications as any).notifications = { show: notify };

		const clearRightComponent = vi.fn();
		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent,
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		vi.doMock('../RolesList', () => ({
			default: (props: any) => {
				props.onDelete?.({ id: 2, name: 'Support', isSystem: false });
				return <div />;
			},
		}));
		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);
		expect(openConfirmModal).toHaveBeenCalled();
		const args = openConfirmModal.mock.calls[0][0];
		await args.onConfirm();

		expect(mutateAsync).toHaveBeenCalledWith(2);
		expect(notify).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Unable to delete role', color: 'red' })
		);
		vi.unmock('../RolesList');
	});

	it('shows unknown error message when delete rejects with non-Error', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const mutateAsync = vi.fn().mockRejectedValue('oops');
		vi.mocked(roleQueries.useDeleteRole).mockReturnValue({
			mutateAsync,
		} as any);

		const openConfirmModal = vi.fn();
		(modals as any).modals = { openConfirmModal, open: vi.fn() };
		const notify = vi.fn();
		(notifications as any).notifications = { show: notify };

		const clearRightComponent = vi.fn();
		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent,
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		vi.doMock('../RolesList', () => ({
			default: (props: any) => {
				props.onDelete?.({ id: 2, name: 'Support', isSystem: false });
				return <div />;
			},
		}));
		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);
		expect(openConfirmModal).toHaveBeenCalled();
		const args = openConfirmModal.mock.calls[0][0];
		await args.onConfirm();

		expect(mutateAsync).toHaveBeenCalledWith(2);
		expect(notify).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Unable to delete role', color: 'red' })
		);
		vi.unmock('../RolesList');
	});

	it('calls clearRightComponent on mount and cleanup', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		(modals as any).modals = { open: vi.fn(), openConfirmModal: vi.fn() };
		const clearRightComponent = vi.fn();
		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent,
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		const { default: RolesPage } = await import('./RolesPage');
		const { unmount } = renderWithProviders(<RolesPage />);
		// Mount should call clearRightComponent once
		expect(clearRightComponent).toHaveBeenCalledTimes(1);
		// Unmount should call it again
		unmount();
		expect(clearRightComponent).toHaveBeenCalledTimes(2);
	});

	it('sets right component when viewing a row (assert element passed)', async () => {
		// We'll inspect the element passed to setRightComponent, ensuring it contains the expected prop
		const mockSet = vi.fn();
		const mockStore = {
			rightComponent: null,
			setRightComponent: mockSet,
			clearRightComponent: vi.fn(),
		} as any;
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		vi.doMock('../RolesList', () => ({
			default: (props: any) => {
				props.onView?.(7);
				return <div />;
			},
		}));

		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);
		expect(mockSet).toHaveBeenCalled();
		const el = mockSet.mock.calls[0][0];
		// React element should have props with roleId 7
		expect(el.props.roleId).toBe(7);
		vi.unmock('../RolesList');
	});

	it('remounts RolesList when handleModalSuccess increments refreshKey', async () => {
		let mountCount = 0;
		vi.doMock('../RolesList', () => ({
			default: () => {
				mountCount += 1;
				return <div data-testid={`mounted-${mountCount}`} />;
			},
		}));

		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);
		const closeAll = vi.fn();
		(modals as any).modals = {
			open: vi.fn(),
			openConfirmModal: vi.fn(),
			closeAll,
		};
		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);
		// initial mount
		expect(mountCount).toBe(1);
		// open create modal and call onSuccess to trigger remount
		const newButton = screen.getByRole('button', { name: /New Role/ });
		await userEvent.click(newButton);
		const openCall = (modals as any).modals.open.mock.calls[0][0];
		const children = openCall.children as any;
		await act(async () => children.props.onSuccess());
		expect(mountCount).toBe(2);
		vi.unmock('../RolesList');
	});

	it('calls setRightComponent when row is clicked (view)', async () => {
		vi.mocked(roleQueries.useGetAllRoles).mockReturnValue({
			data: mockRoles as any,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		const mockStore = {
			rightComponent: null,
			setRightComponent: vi.fn(),
			clearRightComponent: vi.fn(),
		};
		(useRolesPageStore as any).mockImplementation(
			(selector: (state: RolesPageState) => any) => selector(mockStore)
		);

		vi.doMock('../RolesList', () => ({
			default: (props: any) => {
				props.onView?.(1);
				return <div />;
			},
		}));
		const { default: RolesPage } = await import('./RolesPage');
		renderWithProviders(<RolesPage />);
		expect(mockStore.setRightComponent).toHaveBeenCalled();
		vi.unmock('../RolesList');
	});
});

export {};
