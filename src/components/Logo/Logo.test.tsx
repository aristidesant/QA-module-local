import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router';
import Logo from './Logo';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
	const actual = await vi.importActual('react-router');
	return {
		...actual,
		useNavigate: () => mockNavigate,
	};
});

const renderLogo = (props: Partial<Parameters<typeof Logo>[0]> = {}) => {
	return render(
		<MemoryRouter>
			<MantineProvider>
				<Logo {...props} />
			</MantineProvider>
		</MemoryRouter>
	);
};

describe('Logo', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders with data-testid', () => {
			renderLogo();

			expect(screen.getByTestId('logo')).toBeInTheDocument();
		});

		it('renders full logo by default', () => {
			renderLogo();

			expect(screen.getByAltText('Logo')).toBeInTheDocument();
			expect(screen.getByText('Unified')).toBeInTheDocument();
			expect(screen.getByText('CXM')).toBeInTheDocument();
		});

		it('renders compact logo when compact is true', () => {
			renderLogo({ compact: true });

			expect(screen.getByAltText('Logo')).toBeInTheDocument();
			expect(screen.queryByText('Unified')).not.toBeInTheDocument();
			expect(screen.queryByText('CXM')).not.toBeInTheDocument();
		});
	});

	describe('Image Source', () => {
		it('uses full logo image when not compact', () => {
			renderLogo({ compact: false });

			const img = screen.getByAltText('Logo');
			expect(img).toHaveAttribute('src', '/images/logo-2.png');
		});

		it('uses compact logo image when compact', () => {
			renderLogo({ compact: true });

			const img = screen.getByAltText('Logo');
			expect(img).toHaveAttribute('src', '/images/logoonblack-small-nt.png');
		});
	});

	describe('Navigation', () => {
		it('navigates to home when clicked', () => {
			renderLogo();

			const logo = screen.getByTestId('logo');
			fireEvent.click(logo);

			expect(mockNavigate).toHaveBeenCalledWith('/');
		});
	});

	describe('Logo Text', () => {
		it('renders logo text with accent styling', () => {
			renderLogo();

			const accentText = screen.getByText('CXM');
			expect(accentText.className).toContain('logoAccent');
		});

		it('does not render logo text when compact', () => {
			renderLogo({ compact: true });

			expect(screen.queryByText('CXM')).not.toBeInTheDocument();
		});
	});
});
