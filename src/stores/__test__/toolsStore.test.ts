import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import useToolsStore from '../toolsStore';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';

describe('useToolsStore', () => {
	beforeEach(() => {
		act(() => {
			useToolsStore.setState({
				selectedToolCategory: null,
				rightComponent: null,
			});
		});
	});

	it('should have initial state', () => {
		const state = useToolsStore.getState();
		expect(state.selectedToolCategory).toBeNull();
		expect(state.rightComponent).toBeNull();
	});

	it('should set tools category and right component', () => {
		const mockCategory = { id: 1, name: 'Category' } as ToolCategoryModel;
		const mockComponent = 'Component';

		act(() => {
			useToolsStore.getState().setToolsCategory(mockCategory, mockComponent);
		});

		const state = useToolsStore.getState();
		expect(state.selectedToolCategory).toEqual(mockCategory);
		expect(state.rightComponent).toBe(mockComponent);
	});
});
