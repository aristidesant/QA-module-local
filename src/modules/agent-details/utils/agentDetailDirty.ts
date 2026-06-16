import type { AgentConfigModel } from '~/models/AgentListObject';

type AgentDetailSnapshot = Partial<AgentConfigModel> | null | undefined;
type NormalizedSnapshot = Record<string, unknown>;
type NormalizeOptions = {
	omitPaths?: string[][];
};

const matchesPath = (path: string[], omitPath: string[]) =>
	path.length === omitPath.length &&
	path.every((segment, index) => segment === omitPath[index]);

const shouldOmitPath = (path: string[], omitPaths: string[][]) =>
	omitPaths.some((omitPath) => matchesPath(path, omitPath));

const normalizeValue = (
	value: unknown,
	path: string[] = [],
	omitPaths: string[][] = []
): unknown | undefined => {
	if (value === null) {
		return null;
	}

	if (typeof value === 'string') {
		// Ignore formatting-only whitespace differences when comparing snapshots.
		const trimmed = value.trim();
		return trimmed === '' ? undefined : trimmed;
	}

	if (Array.isArray(value)) {
		return value
			.map((item, index) =>
				normalizeValue(item, [...path, String(index)], omitPaths)
			)
			.filter((item): item is unknown => item !== undefined);
	}

	if (value && typeof value === 'object') {
		const normalizedEntries = Object.entries(value as Record<string, unknown>)
			.flatMap(([key, entry]) => {
				const nextPath = [...path, key];

				if (shouldOmitPath(nextPath, omitPaths)) {
					return [];
				}

				const normalizedEntry = normalizeValue(entry, nextPath, omitPaths);
				return normalizedEntry === undefined
					? []
					: ([[key, normalizedEntry]] as const);
			})
			.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

		if (normalizedEntries.length === 0) {
			return undefined;
		}

		return normalizedEntries.reduce<NormalizedSnapshot>(
			(accumulator, [key, entry]) => {
				accumulator[key] = entry;
				return accumulator;
			},
			{}
		);
	}

	return value;
};

export const normalizeDirtySnapshot = (
	snapshot: unknown,
	options?: NormalizeOptions
): NormalizedSnapshot => {
	const omitPaths = options?.omitPaths ?? [];
	const normalizedSnapshot = normalizeValue(snapshot, [], omitPaths);

	if (!normalizedSnapshot || typeof normalizedSnapshot !== 'object') {
		return {};
	}

	return normalizedSnapshot as NormalizedSnapshot;
};

export const areDirtySnapshotsDifferent = (
	currentSnapshot: unknown,
	savedSnapshot: unknown,
	options?: NormalizeOptions
) => {
	return (
		JSON.stringify(normalizeDirtySnapshot(currentSnapshot, options)) !==
		JSON.stringify(normalizeDirtySnapshot(savedSnapshot, options))
	);
};

export const normalizeAgentDetailSnapshot = (
	snapshot: AgentDetailSnapshot
): NormalizedSnapshot => normalizeDirtySnapshot(snapshot);

export const areAgentDetailSnapshotsDifferent = (
	currentSnapshot: AgentDetailSnapshot,
	savedSnapshot: AgentDetailSnapshot
) => areDirtySnapshotsDifferent(currentSnapshot, savedSnapshot);

export const isAgentDetailDirty = areAgentDetailSnapshotsDifferent;
