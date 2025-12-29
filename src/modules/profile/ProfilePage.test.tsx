import { screen } from '@testing-library/react';
import { ProfilePage } from './ProfilePage';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import { describe, it, expect, vi } from 'vitest';

// Mock child components
vi.mock('./UserInfoCard', () => ({
	default: () => <div data-testid='UserInfoCard'>UserInfoCard</div>,
}));
vi.mock('./NameChangeSection', () => ({
	default: () => <div data-testid='NameChangeSection'>NameChangeSection</div>,
}));
vi.mock('./PasswordChangeSection', () => ({
	default: () => (
		<div data-testid='PasswordChangeSection'>PasswordChangeSection</div>
	),
}));
vi.mock('./MFASection', () => ({
	default: () => <div data-testid='MFASection'>MFASection</div>,
}));
vi.mock('~/components/ContentContainer/ContentContainer', () => ({
	ContentContainer: ({ children, title, description, rightSection }: any) => (
		<div data-testid='ContentContainer'>
			<h1>{title}</h1>
			<p>{description}</p>
			<div>{rightSection}</div>
			{children}
		</div>
	),
}));

describe('ProfilePage', () => {
	it('renders correctly with all sections', () => {
		renderWithProviders(<ProfilePage />);

		expect(screen.getByTestId('ContentContainer')).toBeInTheDocument();
		expect(screen.getByText('Profile Settings')).toBeInTheDocument();
		expect(
			screen.getByText('Manage your account security and preferences')
		).toBeInTheDocument();
		expect(screen.getByTestId('UserInfoCard')).toBeInTheDocument();
		expect(screen.getByTestId('NameChangeSection')).toBeInTheDocument();
		expect(screen.getByTestId('PasswordChangeSection')).toBeInTheDocument();
		expect(screen.getByTestId('MFASection')).toBeInTheDocument();
	});
});
