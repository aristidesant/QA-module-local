import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useFilteredAndSortedCampaigns } from './useFilteredAndSortedCampaigns';
import type { Campaign } from '~/models/CampaignsModel';
import { CampaignStatus } from '~/models/CampaignStatus';

const createMockCampaign = (overrides: Partial<Campaign> = {}): Campaign => ({
	id: 1,
	name: 'Test Campaign',
	agentName: 'Test Agent',
	description: 'Test description',
	budget: 1000,
	configId: 'config-1',
	spent: 500,
	type: 'OUTBOUND',
	status: CampaignStatus.RUNNING,
	userId: 1,
	clientId: 1,
	createdAt: '2024-01-01T00:00:00Z',
	updatedAt: '2024-01-01T00:00:00Z',
	...overrides,
});

describe('useFilteredAndSortedCampaigns', () => {
	describe('when data is undefined', () => {
		it('should return an empty array', () => {
			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(undefined, '', 'createdAt')
			);

			expect(result.current).toEqual([]);
		});
	});

	describe('when data is empty', () => {
		it('should return an empty array', () => {
			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns([], '', 'createdAt')
			);

			expect(result.current).toEqual([]);
		});
	});

	describe('filtering by search', () => {
		it('should return all campaigns when search is empty', () => {
			const campaigns = [
				createMockCampaign({ id: 1, name: 'Campaign A' }),
				createMockCampaign({ id: 2, name: 'Campaign B' }),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'createdAt')
			);

			expect(result.current).toHaveLength(2);
		});

		it('should filter campaigns by name (case-insensitive)', () => {
			const campaigns = [
				createMockCampaign({ id: 1, name: 'Sales Campaign' }),
				createMockCampaign({ id: 2, name: 'Marketing Campaign' }),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, 'sales', 'createdAt')
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].name).toBe('Sales Campaign');
		});

		it('should filter campaigns by description', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					description: 'For sales team',
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					description: 'For marketing team',
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, 'marketing', 'createdAt')
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].name).toBe('Campaign B');
		});

		it('should filter campaigns by status', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					status: CampaignStatus.RUNNING,
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					status: CampaignStatus.PAUSED,
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, 'paused', 'createdAt')
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].status).toBe(CampaignStatus.PAUSED);
		});

		it('should filter campaigns by tags', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					tags: ['priority', 'urgent'],
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					tags: ['low-priority'],
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, 'urgent', 'createdAt')
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].name).toBe('Campaign A');
		});

		it('should trim whitespace from search', () => {
			const campaigns = [
				createMockCampaign({ id: 1, name: 'Sales Campaign' }),
				createMockCampaign({ id: 2, name: 'Marketing Campaign' }),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '  sales  ', 'createdAt')
			);

			expect(result.current).toHaveLength(1);
			expect(result.current[0].name).toBe('Sales Campaign');
		});

		it('should handle campaigns without optional fields', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					description: undefined,
					tags: undefined,
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, 'nonexistent', 'createdAt')
			);

			expect(result.current).toHaveLength(0);
		});
	});

	describe('sorting', () => {
		it('should sort by name alphabetically', () => {
			const campaigns = [
				createMockCampaign({ id: 1, name: 'Zebra Campaign' }),
				createMockCampaign({ id: 2, name: 'Alpha Campaign' }),
				createMockCampaign({ id: 3, name: 'Beta Campaign' }),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'name')
			);

			expect(result.current[0].name).toBe('Alpha Campaign');
			expect(result.current[1].name).toBe('Beta Campaign');
			expect(result.current[2].name).toBe('Zebra Campaign');
		});

		it('should sort by status alphabetically', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					status: CampaignStatus.PAUSED,
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					status: CampaignStatus.COMPLETED,
				}),
				createMockCampaign({
					id: 3,
					name: 'Campaign C',
					status: CampaignStatus.FAILED,
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'status')
			);

			expect(result.current[0].status).toBe(CampaignStatus.COMPLETED);
			expect(result.current[1].status).toBe(CampaignStatus.FAILED);
			expect(result.current[2].status).toBe(CampaignStatus.PAUSED);
		});

		it('should sort by lastActivity (updatedAt) descending', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					updatedAt: '2024-01-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					updatedAt: '2024-03-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 3,
					name: 'Campaign C',
					updatedAt: '2024-02-01T00:00:00Z',
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'lastActivity')
			);

			expect(result.current[0].name).toBe('Campaign B');
			expect(result.current[1].name).toBe('Campaign C');
			expect(result.current[2].name).toBe('Campaign A');
		});

		it('should sort by createdAt descending by default', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					createdAt: '2024-01-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					createdAt: '2024-03-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 3,
					name: 'Campaign C',
					createdAt: '2024-02-01T00:00:00Z',
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'createdAt')
			);

			expect(result.current[0].name).toBe('Campaign B');
			expect(result.current[1].name).toBe('Campaign C');
			expect(result.current[2].name).toBe('Campaign A');
		});

		it('should use createdAt as default sort for unknown sortBy values', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					createdAt: '2024-01-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					createdAt: '2024-03-01T00:00:00Z',
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'unknownField')
			);

			expect(result.current[0].name).toBe('Campaign B');
			expect(result.current[1].name).toBe('Campaign A');
		});

		it('should handle campaigns with missing status when sorting by status', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					status: undefined as unknown as CampaignStatus,
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					status: CampaignStatus.RUNNING,
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'status')
			);

			expect(result.current).toHaveLength(2);
		});

		it('should handle campaigns with missing dates when sorting by date', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Campaign A',
					updatedAt: undefined as unknown as string,
				}),
				createMockCampaign({
					id: 2,
					name: 'Campaign B',
					updatedAt: '2024-01-01T00:00:00Z',
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'lastActivity')
			);

			expect(result.current).toHaveLength(2);
		});
	});

	describe('combined filtering and sorting', () => {
		it('should filter first then sort', () => {
			const campaigns = [
				createMockCampaign({
					id: 1,
					name: 'Sales Alpha',
					createdAt: '2024-01-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 2,
					name: 'Marketing Beta',
					createdAt: '2024-03-01T00:00:00Z',
				}),
				createMockCampaign({
					id: 3,
					name: 'Sales Gamma',
					createdAt: '2024-02-01T00:00:00Z',
				}),
			];

			const { result } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, 'sales', 'name')
			);

			expect(result.current).toHaveLength(2);
			expect(result.current[0].name).toBe('Sales Alpha');
			expect(result.current[1].name).toBe('Sales Gamma');
		});
	});

	describe('memoization', () => {
		it('should return the same reference when inputs do not change', () => {
			const campaigns = [createMockCampaign({ id: 1, name: 'Campaign A' })];

			const { result, rerender } = renderHook(() =>
				useFilteredAndSortedCampaigns(campaigns, '', 'createdAt')
			);

			const firstResult = result.current;
			rerender();
			const secondResult = result.current;

			expect(firstResult).toBe(secondResult);
		});
	});
});
