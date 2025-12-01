import { describe, it, expect } from 'vitest';
import { menuItems } from './menuItems';

describe('menuItems', () => {
	it('should export an array of menu items', () => {
		expect(Array.isArray(menuItems)).toBe(true);
		expect(menuItems).toHaveLength(3);
	});

	it('should have correct menu item structure', () => {
		menuItems.forEach((item) => {
			expect(item).toHaveProperty('label');
			expect(typeof item.label).toBe('string');
			expect(item).toHaveProperty('icon');
			expect(item.icon).toBeTruthy(); // Icon should be a ReactNode
			expect(item).toHaveProperty('to');
			expect(typeof item.to).toBe('string');
			expect(item.to.startsWith('/')).toBe(true); // Routes should start with /
		});
	});

	it('should have correct labels and routes', () => {
		expect(menuItems[0]).toMatchObject({
			label: 'Overview',
			to: '/',
			exact: true,
		});
		expect(menuItems[1]).toMatchObject({
			label: 'Campaigns',
			to: '/campaigns',
		});
		expect(menuItems[2]).toMatchObject({
			label: 'Conversations',
			to: '/conversations',
		});
	});

	it('should have exact only for Overview', () => {
		expect(menuItems[0].exact).toBe(true);
		expect(menuItems[1].exact).toBeUndefined();
		expect(menuItems[2].exact).toBeUndefined();
	});
});
