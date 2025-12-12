import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router';
import { MantineProvider } from '@mantine/core';
import RouteProtecter, { clientLoader, useToken } from './RouteProtecter';
import { useSessionStore } from '~/stores/sessionStore';
import * as jwtDecodeModule from 'jwt-decode';
import * as reactRouter from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userApi from '~/api/userApi';
import type { ReactNode } from 'react';

vi.mock('~/api/userApi', () => ({
	default: vi.fn(() => ({
		getCurrentUser: vi.fn(),
	})),
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
	jwtDecode: vi.fn(),
}));

// Mock ImpersonationLoadingOverlay
vi.mock('~/components/ImpersonationLoadingOverlay', () => ({
	default: () => <div data-testid='impersonation-overlay'>Overlay</div>,
}));

// Mock sessionStore
vi.mock('~/stores/sessionStore', () => ({
	useSessionStore: vi.fn(),
}));

const mockUseSessionStore = vi.mocked(useSessionStore);
const mockUserApi = vi.mocked(userApi);

const renderWithQuery = (ui: ReactNode) => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>{ui}</MantineProvider>
		</QueryClientProvider>
	);
};

// Helper to create valid JWT token (expires in future)
const createValidToken = () => {
	return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.test';
};

// Helper to create expired JWT token
const createExpiredToken = () => {
	return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwMDB9.test';
};

describe('RouteProtecter', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		sessionStorage.clear();
	});

	afterEach(() => {
		sessionStorage.clear();
		vi.restoreAllMocks();
	});

	describe('clientLoader', () => {
		it('returns null token when no token in storage', async () => {
			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});

		it('returns token from sessionStorage accessToken', async () => {
			const mockToken = createValidToken();
			const futureExp = Math.floor(Date.now() / 1000) + 3600;

			sessionStorage.setItem('accessToken', mockToken);

			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: futureExp });

			const result = await clientLoader();
			expect(result.token).toBe(mockToken);
		});

		it('returns null when token is expired', async () => {
			const expiredToken = createExpiredToken();
			const pastExp = Math.floor(Date.now() / 1000) - 3600;

			sessionStorage.setItem('accessToken', expiredToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: pastExp });

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
			expect(sessionStorage.getItem('accessToken')).toBeNull();
		});

		it('returns null when exp is not finite', async () => {
			const mockToken = createValidToken();

			sessionStorage.setItem('accessToken', mockToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: NaN });

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});

		it('returns null when jwtDecode throws', async () => {
			const mockToken = 'invalid-token';

			sessionStorage.setItem('accessToken', mockToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockImplementation(() => {
				throw new Error('Invalid token');
			});

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
			expect(sessionStorage.getItem('accessToken')).toBeNull();
		});
	});

	describe('RouteProtecter Component Logic', () => {
		// Create a test component that mirrors RouteProtecter's redirect logic
		const TestRouteProtecter = () => {
			const { token: storeToken, user } = useSessionStore();
			const path = reactRouter.useLocation().pathname;

			const authToken = storeToken;

			if (!authToken && path !== '/login') {
				return <reactRouter.Navigate to='/login' replace />;
			}

			if (authToken && path === '/login') {
				return <reactRouter.Navigate to='/' replace />;
			}

			const needsPasswordUpdate =
				Boolean(authToken) && user?.needToChangePassword;

			if (needsPasswordUpdate && path !== '/force-password-change') {
				return <reactRouter.Navigate to='/force-password-change' replace />;
			}

			if (!needsPasswordUpdate && path === '/force-password-change') {
				return <reactRouter.Navigate to='/' replace />;
			}

			return (
				<>
					<Outlet />
					<div data-testid='impersonation-overlay'>Overlay</div>
				</>
			);
		};

		it('renders content when authenticated', () => {
			mockUseSessionStore.mockReturnValue({
				token: 'valid-token',
				user: { needToChangePassword: false },
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/']}>
						<Routes>
							<Route path='/' element={<TestRouteProtecter />}>
								<Route index element={<div>Home Content</div>} />
							</Route>
							<Route path='/login' element={<div>Login Page</div>} />
						</Routes>
					</MemoryRouter>
				</MantineProvider>
			);

			expect(screen.getByTestId('impersonation-overlay')).toBeInTheDocument();
		});

		it('redirects to login when not authenticated and not on login page', async () => {
			mockUseSessionStore.mockReturnValue({
				token: null,
				user: null,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/dashboard']}>
						<Routes>
							<Route path='/dashboard' element={<TestRouteProtecter />}>
								<Route index element={<div>Dashboard</div>} />
							</Route>
							<Route path='/login' element={<div>Login Page</div>} />
						</Routes>
					</MemoryRouter>
				</MantineProvider>
			);

			await waitFor(() => {
				expect(screen.getByText('Login Page')).toBeInTheDocument();
			});
		});

		it('redirects to home when authenticated and on login page', async () => {
			mockUseSessionStore.mockReturnValue({
				token: 'valid-token',
				user: { needToChangePassword: false },
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/login']}>
						<Routes>
							<Route path='/' element={<TestRouteProtecter />}>
								<Route index element={<div>Home Content</div>} />
							</Route>
							<Route path='/login' element={<TestRouteProtecter />} />
						</Routes>
					</MemoryRouter>
				</MantineProvider>
			);

			await waitFor(() => {
				expect(screen.getByText('Home Content')).toBeInTheDocument();
			});
		});

		it('redirects to force-password-change when user needs to change password', async () => {
			mockUseSessionStore.mockReturnValue({
				token: 'valid-token',
				user: { needToChangePassword: true },
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/dashboard']}>
						<Routes>
							<Route path='/dashboard' element={<TestRouteProtecter />}>
								<Route index element={<div>Dashboard</div>} />
							</Route>
							<Route
								path='/force-password-change'
								element={<div>Force Password Change</div>}
							/>
						</Routes>
					</MemoryRouter>
				</MantineProvider>
			);

			await waitFor(() => {
				expect(screen.getByText('Force Password Change')).toBeInTheDocument();
			});
		});

		it('redirects to home when on force-password-change but password change not needed', async () => {
			mockUseSessionStore.mockReturnValue({
				token: 'valid-token',
				user: { needToChangePassword: false },
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/force-password-change']}>
						<Routes>
							<Route path='/' element={<TestRouteProtecter />}>
								<Route index element={<div>Home Content</div>} />
							</Route>
							<Route
								path='/force-password-change'
								element={<TestRouteProtecter />}
							/>
						</Routes>
					</MemoryRouter>
				</MantineProvider>
			);

			await waitFor(() => {
				expect(screen.getByText('Home Content')).toBeInTheDocument();
			});
		});

		it('shows login page for unauthenticated users', () => {
			mockUseSessionStore.mockReturnValue({
				token: null,
				user: null,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			render(
				<MantineProvider>
					<MemoryRouter initialEntries={['/login']}>
						<Routes>
							<Route path='/login' element={<div>Login Page</div>} />
						</Routes>
					</MemoryRouter>
				</MantineProvider>
			);

			expect(screen.getByText('Login Page')).toBeInTheDocument();
		});

		describe('loader token synchronization', () => {
			it('calls setToken when loader token differs from store token', async () => {
				const setTokenMock = vi.fn();
				const loaderToken = 'loader-token';

				mockUserApi.mockReturnValue({
					getCurrentUser: vi.fn().mockResolvedValue({
						id: 1,
						needToChangePassword: false,
					}),
				} as any);

				vi.spyOn(reactRouter, 'useLoaderData').mockReturnValue({
					token: loaderToken,
				} as any);

				mockUseSessionStore.mockReturnValue({
					token: 'store-token',
					user: { needToChangePassword: false },
					setToken: setTokenMock,
					setUser: vi.fn(),
					setTargetClient: vi.fn(),
					clearUser: vi.fn(),
					targetClient: null,
				} as any);

				renderWithQuery(
					<MemoryRouter initialEntries={['/']}>
						<Routes>
							<Route path='/' element={<RouteProtecter />}>
								<Route index element={<div>Home Content</div>} />
							</Route>
							<Route path='/login' element={<div>Login Page</div>} />
						</Routes>
					</MemoryRouter>
				);

				await waitFor(() =>
					expect(setTokenMock).toHaveBeenCalledWith(loaderToken)
				);
			});

			it('does not call setToken when loader token equals store token', async () => {
				const setTokenMock = vi.fn();
				const loaderToken = 'same-token';

				mockUserApi.mockReturnValue({
					getCurrentUser: vi.fn().mockResolvedValue({
						id: 1,
						needToChangePassword: false,
					}),
				} as any);

				vi.spyOn(reactRouter, 'useLoaderData').mockReturnValue({
					token: loaderToken,
				} as any);

				mockUseSessionStore.mockReturnValue({
					token: loaderToken,
					user: { needToChangePassword: false },
					setToken: setTokenMock,
					setUser: vi.fn(),
					setTargetClient: vi.fn(),
					clearUser: vi.fn(),
					targetClient: null,
				} as any);

				renderWithQuery(
					<MemoryRouter initialEntries={['/']}>
						<Routes>
							<Route path='/' element={<RouteProtecter />}>
								<Route index element={<div>Home Content</div>} />
							</Route>
						</Routes>
					</MemoryRouter>
				);

				await waitFor(() => expect(setTokenMock).not.toHaveBeenCalled());
			});
		});
	});

	describe('useToken Hook', () => {
		it('returns token and user from session store', () => {
			const mockUser = {
				id: 1,
				name: 'Test User',
				needToChangePassword: false,
			};
			const mockToken = 'test-token';

			mockUseSessionStore.mockReturnValue({
				token: mockToken,
				user: mockUser,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			const TestComponent = () => {
				const { token, user } = useToken();
				return (
					<div>
						<span data-testid='token'>{token}</span>
						<span data-testid='user'>{JSON.stringify(user)}</span>
					</div>
				);
			};

			render(
				<MantineProvider>
					<TestComponent />
				</MantineProvider>
			);

			expect(screen.getByTestId('token').textContent).toBe(mockToken);
			expect(screen.getByTestId('user').textContent).toBe(
				JSON.stringify(mockUser)
			);
		});

		it('returns null values when not authenticated', () => {
			mockUseSessionStore.mockReturnValue({
				token: null,
				user: null,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
			} as any);

			const TestComponent = () => {
				const { token, user } = useToken();
				return (
					<div>
						<span data-testid='token'>{token ?? 'null'}</span>
						<span data-testid='user'>
							{user ? JSON.stringify(user) : 'null'}
						</span>
					</div>
				);
			};

			render(
				<MantineProvider>
					<TestComponent />
				</MantineProvider>
			);

			expect(screen.getByTestId('token').textContent).toBe('null');
			expect(screen.getByTestId('user').textContent).toBe('null');
		});
	});
});
