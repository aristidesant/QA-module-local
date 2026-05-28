export const OUTBOUND_PROTECTED_ROOT_NODE_NAMES = [
	'Effective Contact',
	'No Effective Contact',
	'No Contact',
	'Contacto Efectivo',
	'Contacto No Efectivo',
	'Sin Contacto',
] as const;

export type OutboundProtectedRootNodeName =
	(typeof OUTBOUND_PROTECTED_ROOT_NODE_NAMES)[number];
