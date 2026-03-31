import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import WorkflowImportModal from './WorkflowImportModal';

const validWorkflowJson = JSON.stringify(
	{
		prevent_subagent_loops: true,
		nodes: {
			start_node: {
				type: 'start',
				position: { x: 0, y: 0 },
				edge_order: ['edge_1'],
			},
			node_end: {
				type: 'end',
				position: { x: 100, y: 100 },
				edge_order: [],
			},
		},
		edges: {
			edge_1: {
				source: 'start_node',
				target: 'node_end',
			},
		},
	},
	null,
	2
);

const renderModal = (autoReadClipboardRequestKey = 1) =>
	renderWithProviders(
		<WorkflowImportModal
			opened
			onClose={vi.fn()}
			onReplace={vi.fn()}
			fallbackPreventSubagentLoops={false}
			autoReadClipboardRequestKey={autoReadClipboardRequestKey}
		/>
	);

const mockClipboardReadText = (
	readText: () => Promise<string>
): ReturnType<typeof vi.fn> => {
	const readTextMock = vi.fn(readText);

	Object.defineProperty(window.navigator, 'clipboard', {
		configurable: true,
		value: {
			readText: readTextMock,
		},
	});

	return readTextMock;
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe('WorkflowImportModal', () => {
	it('reads clipboard content on open and pre-fills the textarea', async () => {
		const readTextMock = mockClipboardReadText(() =>
			Promise.resolve(validWorkflowJson)
		);

		renderModal();

		const textarea = screen.getByLabelText('Workflow JSON');

		await waitFor(() => {
			expect(readTextMock).toHaveBeenCalledTimes(1);
			expect(textarea).toHaveValue(validWorkflowJson);
		});

		expect(screen.getByText('Clipboard content loaded.')).toBeInTheDocument();
	});

	it('falls back to manual mode when clipboard reading fails', async () => {
		const readTextMock = mockClipboardReadText(() =>
			Promise.reject(new Error('Clipboard denied'))
		);

		renderModal();

		const textarea = screen.getByLabelText('Workflow JSON');

		await waitFor(() => {
			expect(readTextMock).toHaveBeenCalledTimes(1);
			expect(
				screen.getByText(
					'Could not read the clipboard automatically. Paste manually.'
				)
			).toBeInTheDocument();
		});

		expect(textarea).toHaveValue('');
	});

	it('does not overwrite user input when clipboard resolves after typing', async () => {
		let resolveClipboardRead: ((value: string) => void) | null = null;

		mockClipboardReadText(
			() =>
				new Promise((resolve) => {
					resolveClipboardRead = resolve;
				})
		);

		renderModal();

		const textarea = screen.getByLabelText('Workflow JSON');

		fireEvent.change(textarea, { target: { value: 'manual workflow' } });

		await act(async () => {
			resolveClipboardRead?.(validWorkflowJson);
			await Promise.resolve();
		});

		await waitFor(() => {
			expect(textarea).toHaveValue('manual workflow');
		});

		expect(
			screen.queryByText('Clipboard content loaded.')
		).not.toBeInTheDocument();
	});
});
