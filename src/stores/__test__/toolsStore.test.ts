import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useToolsStore from '../toolsStore';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';

describe('useToolsStore', () => {
	beforeEach(() => {
		act(() => {
			useToolsStore.setState({
				selectedToolCategory: null,
			});
		});
	});

	it('should have initial state', () => {
		const state = useToolsStore.getState();
		expect(state.selectedToolCategory).toBeNull();
	});

	it('should set tools category', () => {
		const mockCategory = { id: 1, name: 'Category' } as ToolCategoryModel;

		act(() => {
			useToolsStore.getState().setToolsCategory(mockCategory);
		});

		const state = useToolsStore.getState();
		expect(state.selectedToolCategory).toEqual(mockCategory);
	});

	it('should clear tools category when set to null', () => {
		const mockCategory = { id: 1, name: 'Category' } as ToolCategoryModel;

		act(() => {
			useToolsStore.getState().setToolsCategory(mockCategory);
		});

		act(() => {
			useToolsStore.getState().setToolsCategory(null);
		});

		const state = useToolsStore.getState();
		expect(state.selectedToolCategory).toBeNull();
	});
});
