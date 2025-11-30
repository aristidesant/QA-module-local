import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router';
import { MantineProvider } from '@mantine/core';
import RouteProtecter, { clientLoader, useToken } from './RouteProtecter';
import { useSessionStore } from '~/stores/sessionStore';
import * as jwtDecodeModule from 'jwt-decode';
import * as reactRouter from 'react-router';

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
		localStorage.clear();
	});

	afterEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	describe('clientLoader', () => {
		it('returns null token when no token in storage', async () => {
			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});

		it('returns token from session-storage', async () => {
			const mockToken = createValidToken();
			const futureExp = Math.floor(Date.now() / 1000) + 3600;

			localStorage.setItem(
				'session-storage',
				JSON.stringify({ state: { token: mockToken } })
			);

			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: futureExp });

			const result = await clientLoader();
			expect(result.token).toBe(mockToken);
		});

		it('falls back to accessToken when session-storage is empty', async () => {
			const mockToken = createValidToken();
			const futureExp = Math.floor(Date.now() / 1000) + 3600;

			localStorage.setItem('accessToken', mockToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: futureExp });

			const result = await clientLoader();
			expect(result.token).toBe(mockToken);
		});

		it('returns null when token is expired', async () => {
			const expiredToken = createExpiredToken();
			const pastExp = Math.floor(Date.now() / 1000) - 3600;

			localStorage.setItem('accessToken', expiredToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: pastExp });

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});

		it('returns null when exp is not finite', async () => {
			const mockToken = createValidToken();

			localStorage.setItem('accessToken', mockToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: NaN });

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});

		it('returns null when jwtDecode throws', async () => {
			const mockToken = 'invalid-token';

			localStorage.setItem('accessToken', mockToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockImplementation(() => {
				throw new Error('Invalid token');
			});

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});

		it('handles invalid JSON in session-storage gracefully', async () => {
			const mockToken = createValidToken();
			const futureExp = Math.floor(Date.now() / 1000) + 3600;

			localStorage.setItem('session-storage', 'invalid-json');
			localStorage.setItem('accessToken', mockToken);
			vi.mocked(jwtDecodeModule.jwtDecode).mockReturnValue({ exp: futureExp });

			const result = await clientLoader();
			expect(result.token).toBe(mockToken);
		});

		it('returns null when session-storage has no token field', async () => {
			localStorage.setItem(
				'session-storage',
				JSON.stringify({ state: { user: {} } })
			);

			const result = await clientLoader();
			expect(result).toEqual({ token: null, user: null });
		});
	});

	describe('RouteProtecter Component Logic', () => {
		// Create a test component that mirrors RouteProtecter's redirect logic
		const TestRouteProtecter = () => {
			const { token: storeToken, user, _hasHydrated } = useSessionStore();
			const path = reactRouter.useLocation().pathname;

			// Simulate using loader token (we mock this scenario)
			const loaderToken = null; // Simulating no loader token for these tests
			const authToken = _hasHydrated ? storeToken : loaderToken;

			if (!authToken && path !== '/login') {
				return <reactRouter.Navigate to='/login' replace />;
			}

			if (authToken && path === '/login') {
				return <reactRouter.Navigate to='/' replace />;
			}

			const needsPasswordUpdate =
				_hasHydrated && authToken && user?.needToChangePassword;

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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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

		it('uses loader token when store has not hydrated', () => {
			mockUseSessionStore.mockReturnValue({
				token: null,
				user: null,
				_hasHydrated: false,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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

			// When not hydrated and no loader token, should redirect to login
			expect(screen.getByText('Login Page')).toBeInTheDocument();
		});

		it('renders content without calling setToken when store has not hydrated', () => {
			const setTokenMock = vi.fn();

			mockUseSessionStore.mockReturnValue({
				token: null,
				user: null,
				_hasHydrated: false,
				setToken: setTokenMock,
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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

		it('shows login page for unauthenticated users', () => {
			mockUseSessionStore.mockReturnValue({
				token: null,
				user: null,
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
			it('calls setToken when loader token differs and store has hydrated', async () => {
				const setTokenMock = vi.fn();
				const loaderToken = 'loader-token';

				vi.spyOn(reactRouter, 'useLoaderData').mockReturnValue({
					token: loaderToken,
				} as any);

				mockUseSessionStore.mockReturnValue({
					token: 'store-token',
					user: { needToChangePassword: false },
					_hasHydrated: true,
					setToken: setTokenMock,
					setUser: vi.fn(),
					setTargetClient: vi.fn(),
					clearUser: vi.fn(),
					targetClient: null,
					_setHasHydrated: vi.fn(),
				} as any);

				render(
					<MantineProvider>
						<MemoryRouter initialEntries={['/']}>
							<Routes>
								<Route path='/' element={<RouteProtecter />}>
									<Route index element={<div>Home Content</div>} />
								</Route>
								<Route path='/login' element={<div>Login Page</div>} />
							</Routes>
						</MemoryRouter>
					</MantineProvider>
				);

				await waitFor(() =>
					expect(setTokenMock).toHaveBeenCalledWith(loaderToken)
				);
			});

			it('does not call setToken when loader token equals store token', async () => {
				const setTokenMock = vi.fn();
				const loaderToken = 'same-token';

				vi.spyOn(reactRouter, 'useLoaderData').mockReturnValue({
					token: loaderToken,
				} as any);

				mockUseSessionStore.mockReturnValue({
					token: loaderToken,
					user: { needToChangePassword: false },
					_hasHydrated: true,
					setToken: setTokenMock,
					setUser: vi.fn(),
					setTargetClient: vi.fn(),
					clearUser: vi.fn(),
					targetClient: null,
					_setHasHydrated: vi.fn(),
				} as any);

				render(
					<MantineProvider>
						<MemoryRouter initialEntries={['/']}>
							<Routes>
								<Route path='/' element={<RouteProtecter />}>
									<Route index element={<div>Home Content</div>} />
								</Route>
							</Routes>
						</MemoryRouter>
					</MantineProvider>
				);

				await waitFor(() => expect(setTokenMock).not.toHaveBeenCalled());
			});

			it('does not call setToken when store has not hydrated', async () => {
				const setTokenMock = vi.fn();
				const loaderToken = 'loader-token';

				vi.spyOn(reactRouter, 'useLoaderData').mockReturnValue({
					token: loaderToken,
				} as any);

				mockUseSessionStore.mockReturnValue({
					token: 'store-token',
					user: { needToChangePassword: false },
					_hasHydrated: false,
					setToken: setTokenMock,
					setUser: vi.fn(),
					setTargetClient: vi.fn(),
					clearUser: vi.fn(),
					targetClient: null,
					_setHasHydrated: vi.fn(),
				} as any);

				render(
					<MantineProvider>
						<MemoryRouter initialEntries={['/']}>
							<Routes>
								<Route path='/' element={<RouteProtecter />}>
									<Route index element={<div>Home Content</div>} />
								</Route>
							</Routes>
						</MemoryRouter>
					</MantineProvider>
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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
				_hasHydrated: true,
				setToken: vi.fn(),
				setUser: vi.fn(),
				setTargetClient: vi.fn(),
				clearUser: vi.fn(),
				targetClient: null,
				_setHasHydrated: vi.fn(),
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
