import { screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { renderWithProviders } from '~/test-utils/renderWithProviders';
import ToolsModal from './ToolsModal';

// Mock ToolForm since we tested it separately and it's complex
vi.mock('../ToolForm', () => ({
	default: ({ onSuccess, onCancel, toolId }: any) => (
		<div data-testid='mock-tool-form'>
			Mock Tool Form {toolId ? `ID: ${toolId}` : 'Create'}
			<button onClick={onSuccess}>Success</button>
			<button onClick={onCancel}>Cancel</button>
		</div>
	),
}));

// Mock Modal components from Mantine to avoid Portal issues in some test envs,
// though renderWithProviders usually handles MantineProvider.
// But fullScreen modal might render into portal.
// Let's rely on standard rendering first. The Modal usually renders children if opened=true.

describe('ToolsModal', () => {
	it('renders nothing when not opened', () => {
		renderWithProviders(<ToolsModal opened={false} onClose={vi.fn()} />);
		expect(screen.queryByTestId('mock-tool-form')).not.toBeInTheDocument();
	});

	it('renders ToolForm when opened', () => {
		renderWithProviders(<ToolsModal opened={true} onClose={vi.fn()} />);
		// Mantine Modal renders in a Portal by default.
		// @testing-library/react `screen` usually inspects document.body so it should find it.
		expect(screen.getByTestId('mock-tool-form')).toBeInTheDocument();
		expect(screen.getByText('Mock Tool Form Create')).toBeInTheDocument();
	});

	it('passes toolId props correctly', () => {
		renderWithProviders(
			<ToolsModal opened={true} onClose={vi.fn()} toolId='123' />
		);
		expect(screen.getByText('Mock Tool Form ID: 123')).toBeInTheDocument();
	});

	it('calls onClose when ToolForm calls onCancel', () => {
		const onClose = vi.fn();
		renderWithProviders(<ToolsModal opened={true} onClose={onClose} />);

		fireEvent.click(screen.getByText('Cancel'));
		expect(onClose).toHaveBeenCalled();
	});

	it('calls onClose when ToolForm calls onSuccess', () => {
		const onClose = vi.fn();
		renderWithProviders(<ToolsModal opened={true} onClose={onClose} />);

		fireEvent.click(screen.getByText('Success'));
		expect(onClose).toHaveBeenCalled();
	});
});
