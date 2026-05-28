import type {
	DispositionCatalogImportNodePayload,
	DispositionCatalogImportRequest,
} from '~/models/DispositionCatalogModels';

export type DispositionImportErrorCode =
	| 'invalid-json'
	| 'missing-name'
	| 'missing-type'
	| 'missing-nodes'
	| 'missing-node-name'
	| 'invalid-order'
	| 'name-too-long'
	| 'description-too-long'
	| 'too-many-nodes'
	| 'too-deep';

export class DispositionImportError extends Error {
	code: DispositionImportErrorCode;

	constructor(code: DispositionImportErrorCode) {
		super(code);
		Object.setPrototypeOf(this, DispositionImportError.prototype);
		this.code = code;
		this.name = 'DispositionImportError';
	}
}

const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_TOTAL_NODES = 1000;
const MAX_DEPTH = 20;

const getString = (value: unknown): string | undefined =>
	typeof value === 'string' ? value : undefined;

const getTrimmedString = (value: unknown): string | undefined => {
	const stringValue = getString(value);
	const trimmedValue = stringValue?.trim();

	return trimmedValue ? trimmedValue : undefined;
};

const getBoolean = (value: unknown): boolean | undefined =>
	typeof value === 'boolean' ? value : undefined;

const getNumber = (value: unknown): number | undefined =>
	typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const normalizeNode = (
	node: unknown,
	depth: number,
	state: { count: number }
): DispositionCatalogImportNodePayload => {
	if (!node || typeof node !== 'object' || Array.isArray(node)) {
		throw new DispositionImportError('missing-node-name');
	}

	if (depth > MAX_DEPTH) {
		throw new DispositionImportError('too-deep');
	}

	if (state.count >= MAX_TOTAL_NODES) {
		throw new DispositionImportError('too-many-nodes');
	}

	state.count += 1;

	const record = node as Record<string, unknown>;
	const name = getTrimmedString(record.name);

	if (!name) {
		throw new DispositionImportError('missing-node-name');
	}

	if (name.length > MAX_NAME_LENGTH) {
		throw new DispositionImportError('name-too-long');
	}

	const description = getString(record.description)?.trim();
	if (description && description.length > MAX_DESCRIPTION_LENGTH) {
		throw new DispositionImportError('description-too-long');
	}

	const isFinal = getBoolean(record.isFinal);
	const isVoiceMail = getBoolean(record.isVoiceMail);
	const doNotCall = getBoolean(record.doNotCall);
	const isAbandoned = getBoolean(record.isAbandoned);
	const requiresReschedule = getBoolean(record.requiresReschedule);
	const isInvalidatesNumber = getBoolean(record.isInvalidatesNumber);
	const isActive = getBoolean(record.isActive);

	const order = getNumber(record.order);
	if (
		order !== undefined &&
		(!Number.isInteger(order) || order < 0 || !Number.isFinite(order))
	) {
		throw new DispositionImportError('invalid-order');
	}

	const childrenSource = Array.isArray(record.children)
		? record.children
		: Array.isArray(record.dispositionNodes)
			? record.dispositionNodes
			: [];

	return {
		name,
		...(description ? { description } : {}),
		...(order !== undefined ? { order } : {}),
		...(isFinal !== undefined ? { isFinal } : { isFinal: true }),
		...(isVoiceMail !== undefined
			? { isVoiceMail }
			: { isVoiceMail: false }),
		...(doNotCall !== undefined ? { doNotCall } : { doNotCall: false }),
		...(isAbandoned !== undefined
			? { isAbandoned }
			: { isAbandoned: false }),
		...(requiresReschedule !== undefined
			? { requiresReschedule }
			: { requiresReschedule: false }),
		...(isInvalidatesNumber !== undefined
			? { isInvalidatesNumber }
			: { isInvalidatesNumber: false }),
		...(isActive !== undefined ? { isActive } : { isActive: true }),
		children: childrenSource.map((child) => normalizeNode(child, depth + 1, state)),
	};
};

export const parseDispositionCatalogImportPayload = (
	rawJson: string
): DispositionCatalogImportRequest => {
	let parsed: unknown;

	try {
		parsed = JSON.parse(rawJson);
	} catch {
		throw new DispositionImportError('invalid-json');
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new DispositionImportError('missing-name');
	}

	const rawRecord = parsed as Record<string, unknown>;
	const name = getTrimmedString(rawRecord.name);

	if (!name) {
		throw new DispositionImportError('missing-name');
	}

	if (name.length > MAX_NAME_LENGTH) {
		throw new DispositionImportError('name-too-long');
	}

	const type = getTrimmedString(rawRecord.type)?.toUpperCase();

	if (type !== 'INBOUND' && type !== 'OUTBOUND') {
		throw new DispositionImportError('missing-type');
	}

	const description = getString(rawRecord.description)?.trim();
	if (description && description.length > MAX_DESCRIPTION_LENGTH) {
		throw new DispositionImportError('description-too-long');
	}

	const nodesSource = Array.isArray(rawRecord.dispositionNodes)
		? rawRecord.dispositionNodes
		: Array.isArray(rawRecord.children)
			? rawRecord.children
			: null;

	if (!nodesSource || nodesSource.length === 0) {
		throw new DispositionImportError('missing-nodes');
	}

	const state = { count: 0 };
	const dispositionNodes = nodesSource.map((node) =>
		normalizeNode(node, 1, state)
	);

	return {
		name,
		type: type as 'INBOUND' | 'OUTBOUND',
		...(typeof rawRecord.isDefault === 'boolean'
			? { isDefault: rawRecord.isDefault }
			: {}),
		...(description ? { description } : {}),
		dispositionNodes,
	};
};
