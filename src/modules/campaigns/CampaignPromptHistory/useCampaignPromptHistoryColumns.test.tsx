import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCampaignPromptHistoryColumns } from './useCampaignPromptHistoryColumns';
import { TestProviders } from '~/test-utils/renderWithProviders';

const wrapper = TestProviders;

describe('useCampaignPromptHistoryColumns', () => {
	it('returns expected column definitions', () => {
		const mockOnSelect = vi.fn();
		const mockOnView = vi.fn();
		const { result } = renderHook(
			() =>
				useCampaignPromptHistoryColumns({
					onSelect: mockOnSelect,
					onViewPrompt: mockOnView,
				}),
			{ wrapper }
		);
		const columns = result.current;

		// Expect columns for version, createdAt, user, prompt preview, and actions
		expect(Array.isArray(columns)).toBe(true);
		expect(columns.length).toBeGreaterThanOrEqual(5);
		expect(columns.some((c: any) => c.accessorKey === 'version')).toBe(true);
		expect(columns.some((c: any) => c.accessorKey === 'createdAt')).toBe(true);
		expect(columns.some((c: any) => c.accessorKey === 'user')).toBe(true);
		expect(columns.some((c: any) => c.accessorKey === 'promptText')).toBe(true);
		expect(columns.some((c: any) => c.id === 'actions')).toBe(true);
	});
});
