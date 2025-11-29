import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	renderWithProviders,
	queryClient,
} from '~/test-utils/renderWithProviders';
import UserDetails from './UserDetails';
import * as userQueries from '~/queries/userQueries';
import * as dateUtils from '~/utils/dateUtils';
import useUsersPageStore from '../store/useUsersPageStore';

vi.mock('~/components/RightSectionCard/RightSectionCard', () => ({
	__esModule: true,
	default: ({ title, children, rightSection }: any) => (
		<div>
			<div>{title}</div>
			{rightSection}
			<div>{children}</div>
		</div>
	),
}));

describe('UserDetails', () => {
	const mockUseGetUser = vi.spyOn(userQueries, 'useGetUser');
	const mockTimeAgo = vi.spyOn(dateUtils, 'timeAgo');

	const baseUser = {
		id: 1,
		email: 'user@example.com',
		username: 'user123',
		firstName: 'Jane',
		lastName: 'Doe',
		employeeId: 'E-1',
		status: 'active',
		clientId: 7,
		client: { id: 7, name: 'ACME', identifier: 'acme', email: 'acme@test.com' },
		createdAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-02T00:00:00Z',
		deletedAt: null,
		mfaEnabled: true,
		lastLogin: '2024-01-03T00:00:00Z',
	};

	beforeEach(() => {
		vi.clearAllMocks();
		queryClient.clear();
		useUsersPageStore.setState({ rightComponent: null });
		mockTimeAgo.mockImplementation((value) => `relative-${String(value)}`);
	});

	afterEach(() => {
		queryClient.clear();
	});

	it('renders loading skeleton while fetching', () => {
		mockUseGetUser.mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(<UserDetails userId={1} />);

		expect(screen.getAllByLabelText(/Close details/i)).toHaveLength(1);
	});

	it('shows error state when request fails', () => {
		mockUseGetUser.mockReturnValue({
			data: undefined,
			isLoading: false,
			isError: true,
			error: new Error('Failed'),
		} as any);

		renderWithProviders(<UserDetails userId={1} />);

		expect(
			screen.getByText(/Unable to load user details/i)
		).toBeInTheDocument();
		expect(screen.getByText('Failed')).toBeInTheDocument();
	});

	it('renders user information and supports closing details', async () => {
		const clearRightComponent = vi.fn();
		useUsersPageStore.setState({ clearRightComponent } as any);
		mockUseGetUser.mockReturnValue({
			data: baseUser,
			isLoading: false,
			isError: false,
			error: null,
		} as any);

		renderWithProviders(<UserDetails userId={1} />);

		expect(screen.getByText('Profile')).toBeInTheDocument();
		expect(screen.getByText('Jane Doe')).toBeInTheDocument();
		expect(screen.getByText(baseUser.email)).toBeInTheDocument();
		expect(screen.getByText(/@user123/i)).toBeInTheDocument();
		expect(screen.getByText(/Employee #E-1/i)).toBeInTheDocument();
		expect(screen.getByText(/Client name/i)).toBeInTheDocument();
		expect(screen.getByText('ACME')).toBeInTheDocument();
		expect(
			screen.getByText(/relative-2024-01-02T00:00:00Z/i)
		).toBeInTheDocument();

		await userEvent.click(screen.getByLabelText(/Close details/i));
		expect(clearRightComponent).toHaveBeenCalled();
	});
});

export {};
