import type { DispositionNode } from '~/models/DispositionNodeModel';

export const OUTBOUND_PROTECTED_ROOT_NODE_NAMES = [
	'Effective Contact',
	'No Effective Contact',
	'No Contact',
] as const;

export type OutboundProtectedRootNodeName =
	(typeof OUTBOUND_PROTECTED_ROOT_NODE_NAMES)[number];

type ProtectedDefaultNodeConfig = Pick<
	DispositionNode,
	| 'name'
	| 'description'
	| 'isInvalidatesNumber'
	| 'requiresReschedule'
	| 'isFinal'
> & {
	isVoiceMail?: boolean;
};

export const OUTBOUND_PROTECTED_ROOT_NODE_DEFAULTS: ProtectedDefaultNodeConfig[] =
	[
		{
			name: 'Effective Contact',
			description: '',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		},
		{
			name: 'No Effective Contact',
			description: '',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		},
		{
			name: 'No Contact',
			description: '',
			isInvalidatesNumber: false,
			requiresReschedule: false,
			isFinal: false,
		},
	];
