import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { usePromptVariables } from './usePromptVariables';

// Mock the query hooks
vi.mock('~/queries/campaignsQueries', () => ({
	useGetCampaign: vi.fn(),
}));

vi.mock('~/queries/campaignContactSchemasQueries', () => ({
	useGetSchemaByObjectiveId: vi.fn(),
}));

vi.mock('~/queries/clientConfigQueries', () => ({
	useGetClientConfig: vi.fn(),
}));

import { useGetCampaign } from '~/queries/campaignsQueries';
import { useGetSchemaByObjectiveId } from '~/queries/campaignContactSchemasQueries';
import { useGetClientConfig } from '~/queries/clientConfigQueries';

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

describe('usePromptVariables', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('when campaign has no objectiveId', () => {
		it('should return empty array when campaign data is not available', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: undefined,
			} as any);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: undefined,
			} as any);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: undefined,
			} as any);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toEqual([]);
		});
	});

	describe('dynamic variables from schema', () => {
		it('should return schema fields as dynamic variables', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as any);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							schemaFields: [
								{
									name: 'firstName',
									label: 'First Name',
									description: 'Customer first name',
								},
								{ name: 'lastName', label: 'Last Name', description: '' },
							],
						},
					],
				},
			} as any);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: undefined,
			} as any);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toContainEqual({
				name: 'firstName',
				description: 'Customer first name',
				source: 'schema',
			});

			expect(result.current).toContainEqual({
				name: 'lastName',
				description: 'Last Name',
				source: 'schema',
			});
		});

		it('should handle empty schema response', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as any);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: { data: [] },
			} as any);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toEqual([]);
		});

		it('should handle schema with no schemaFields', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: {
					data: [{ id: 1, schemaFields: undefined }],
				},
			} as any);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toEqual([]);
		});

		it('should flatten fields from multiple schemas', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							schemaFields: [{ name: 'field1', label: 'Field 1' }],
						},
						{
							id: 2,
							schemaFields: [{ name: 'field2', label: 'Field 2' }],
						},
					],
				},
			} as any);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: undefined,
			} as any);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toHaveLength(2);
			expect(result.current[0].name).toBe('field1');
			expect(result.current[1].name).toBe('field2');
		});
	});

	describe('system variables from client config', () => {
		it('should return contact columns as system variables', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: undefined },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: {
					value: JSON.stringify([
						{ name: 'phone', label: 'Phone Number' },
						{ name: 'email', description: 'Email Address' },
					]),
				},
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toContainEqual({
				name: 'phone',
				description: 'Phone Number',
				source: 'system',
			});

			expect(result.current).toContainEqual({
				name: 'email',
				description: 'Email Address',
				source: 'system',
			});
		});

		it('should handle invalid JSON in contact columns config', () => {
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: undefined },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: { value: 'invalid json' },
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toEqual([]);
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});

		it('should handle empty contact columns config', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: undefined },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: { value: undefined },
			} as any);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toEqual([]);
		});
	});

	describe('combined variables', () => {
		it('should combine system and dynamic variables', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							schemaFields: [{ name: 'customField', label: 'Custom Field' }],
						},
					],
				},
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: {
					value: JSON.stringify([
						{ name: 'systemField', label: 'System Field' },
					]),
				},
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current).toHaveLength(2);

			const systemVar = result.current.find((v) => v.source === 'system');
			const schemaVar = result.current.find((v) => v.source === 'schema');

			expect(systemVar).toBeDefined();
			expect(schemaVar).toBeDefined();
		});

		it('should place system variables before dynamic variables', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							schemaFields: [{ name: 'dynamicField', label: 'Dynamic' }],
						},
					],
				},
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: {
					value: JSON.stringify([{ name: 'systemField', label: 'System' }]),
				},
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			expect(result.current[0].source).toBe('system');
			expect(result.current[1].source).toBe('schema');
		});
	});

	describe('edge cases', () => {
		it('should use description or label as description for schema fields', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: 10 },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: {
					data: [
						{
							id: 1,
							schemaFields: [
								{
									name: 'withDesc',
									label: 'Label',
									description: 'Description takes priority',
								},
								{ name: 'withLabel', label: 'Label Only' },
							],
						},
					],
				},
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			const withDesc = result.current.find((v) => v.name === 'withDesc');
			const withLabel = result.current.find((v) => v.name === 'withLabel');

			expect(withDesc?.description).toBe('Description takes priority');
			expect(withLabel?.description).toBe('Label Only');
		});

		it('should use label or description for system variables', () => {
			vi.mocked(useGetCampaign).mockReturnValue({
				data: { id: 1, objectiveId: undefined },
			} as ReturnType<typeof useGetCampaign>);

			vi.mocked(useGetSchemaByObjectiveId).mockReturnValue({
				data: undefined,
			} as ReturnType<typeof useGetSchemaByObjectiveId>);

			vi.mocked(useGetClientConfig).mockReturnValue({
				data: {
					value: JSON.stringify([
						{ name: 'withLabel', label: 'Label Value' },
						{ name: 'withDesc', description: 'Desc Value' },
					]),
				},
			} as ReturnType<typeof useGetClientConfig>);

			const { result } = renderHook(() => usePromptVariables(1), {
				wrapper: createWrapper(),
			});

			const withLabel = result.current.find((v) => v.name === 'withLabel');
			const withDesc = result.current.find((v) => v.name === 'withDesc');

			expect(withLabel?.description).toBe('Label Value');
			expect(withDesc?.description).toBe('Desc Value');
		});
	});
});
