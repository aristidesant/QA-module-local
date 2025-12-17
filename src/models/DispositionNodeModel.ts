export interface DispositionNode {
	id: number;
	clientId: number;
	userId?: number;
	name: string;
	description?: string;
	isInvalidatesNumber: boolean;
	/**
	 * When true, selecting this disposition means the client should not be called again.
	 * Backend enforces behavior; frontend only allows editing.
	 */
	doNotCall?: boolean;
	/** Backend compatibility (snake_case). */
	do_not_call?: boolean;
	requiresReschedule: boolean;
	isFinal: boolean;
	/** Backend compatibility (snake_case). */
	isVoiceMail?: boolean;
	is_voice_mail?: boolean;
	order: number;
	isActive: boolean;
	catalogId?: number;
	parentId?: number | null;
	parent?: DispositionNode;
	children?: DispositionNode[];
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	deletedAt?: string; // ISO date string | undefined
}
