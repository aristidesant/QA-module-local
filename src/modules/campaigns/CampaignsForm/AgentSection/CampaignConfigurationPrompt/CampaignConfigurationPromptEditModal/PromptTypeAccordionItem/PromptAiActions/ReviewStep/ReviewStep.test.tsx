import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import renderWithProviders from '~/test-utils/renderWithProviders';
import ReviewStep from './ReviewStep';
import type { DiffResult } from '../diffUtils';

describe('ReviewStep', () => {
	const mockOnApply = vi.fn();
	const mockOnCancel = vi.fn();

	const createMockDiffData = (
		options: Partial<{
			hasChanges: boolean;
			error: boolean;
			files: DiffResult['files'];
		}> = {}
	): DiffResult => ({
		hasChanges: options.hasChanges ?? true,
		error: options.error,
		files:
			options.files ??
			([
				{
					type: 'modify',
					oldPath: 'prompt',
					newPath: 'prompt',
					oldEndingNewLine: true,
					newEndingNewLine: true,
					oldMode: '100644',
					newMode: '100644',
					oldRevision: 'a',
					newRevision: 'b',
					hunks: [
						{
							content: '@@ -1,3 +1,3 @@',
							oldStart: 1,
							oldLines: 3,
							newStart: 1,
							newLines: 3,
							changes: [
								{
									type: 'normal',
									content: ' Line 1',
									isNormal: true,
									oldLineNumber: 1,
									newLineNumber: 1,
								},
								{
									type: 'delete',
									content: '-Old line 2',
									isDelete: true,
									lineNumber: 2,
									oldLineNumber: 2,
								},
								{
									type: 'insert',
									content: '+New line 2',
									isInsert: true,
									lineNumber: 2,
									newLineNumber: 2,
								},
								{
									type: 'normal',
									content: ' Line 3',
									isNormal: true,
									oldLineNumber: 3,
									newLineNumber: 3,
								},
							],
						},
					],
				},
			] as DiffResult['files']),
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders cancel and apply buttons', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData()}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(
				screen.getByRole('button', { name: 'Cancel' })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: 'Apply changes' })
			).toBeInTheDocument();
		});

		it('renders version labels', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData()}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByText('Current version')).toBeInTheDocument();
			expect(screen.getByText('AI suggestion')).toBeInTheDocument();
		});
	});

	describe('Null Diff Data', () => {
		it('renders nothing for diff content when diffData is null', () => {
			renderWithProviders(
				<ReviewStep
					diffData={null}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.queryByText('Current version')).not.toBeInTheDocument();
			expect(screen.queryByText('AI suggestion')).not.toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /apply changes/i })
			).toBeInTheDocument();
		});
	});

	describe('Error State', () => {
		it('shows error alert when diffData has error', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ error: true })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByText('Error')).toBeInTheDocument();
			expect(
				screen.getByText(
					'Failed to generate diff view. The AI suggestion may still be valid.'
				)
			).toBeInTheDocument();
		});

		it('does not show diff when error is present', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ error: true })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.queryByText('Current version')).not.toBeInTheDocument();
			expect(screen.queryByText('AI suggestion')).not.toBeInTheDocument();
		});
	});

	describe('No Changes State', () => {
		it('shows no changes alert when hasChanges is false', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ hasChanges: false })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByText('No Changes')).toBeInTheDocument();
			expect(
				screen.getByText(
					'The AI suggestion is identical to your current prompt.'
				)
			).toBeInTheDocument();
		});

		it('does not show diff when there are no changes', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ hasChanges: false })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.queryByText('Current version')).not.toBeInTheDocument();
		});
	});

	describe('Empty Files State', () => {
		it('renders nothing for diff content when files array is empty', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ files: [] })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.queryByText('Current version')).not.toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /apply changes/i })
			).toBeInTheDocument();
		});
	});

	describe('Diff Display', () => {
		it('renders diff component when valid diffData is provided', () => {
			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData()}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(screen.getByText('Current version')).toBeInTheDocument();
			expect(screen.getByText('AI suggestion')).toBeInTheDocument();
		});
	});

	describe('Button Actions', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData()}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Cancel' }));

			expect(mockOnCancel).toHaveBeenCalledTimes(1);
		});

		it('calls onApply when apply changes button is clicked', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData()}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Apply changes' }));

			expect(mockOnApply).toHaveBeenCalledTimes(1);
		});

		it('can apply changes even with error state', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ error: true })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Apply changes' }));

			expect(mockOnApply).toHaveBeenCalledTimes(1);
		});

		it('can apply changes even with no changes state', async () => {
			const user = userEvent.setup();

			renderWithProviders(
				<ReviewStep
					diffData={createMockDiffData({ hasChanges: false })}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			await user.click(screen.getByRole('button', { name: 'Apply changes' }));

			expect(mockOnApply).toHaveBeenCalledTimes(1);
		});
	});

	describe('Edge Cases', () => {
		it('handles diffData with undefined files array', () => {
			const diffData: DiffResult = {
				hasChanges: true,
				files: [] as unknown as DiffResult['files'],
			};

			renderWithProviders(
				<ReviewStep
					diffData={diffData}
					onApply={mockOnApply}
					onCancel={mockOnCancel}
				/>
			);

			expect(
				screen.getByRole('button', { name: /apply changes/i })
			).toBeInTheDocument();
		});
	});
});
