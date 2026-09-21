/**
 * Role Play domain model (My Learning). Mock-only, API-shaped.
 * A catalog of practice client personas the agent can rehearse against.
 * Access is granted per agent by their supervisor — see `unlockedForAgentIds`.
 */
import type { EvaluationArea } from './triggerRules';

export type RolePlayDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type RolePlayPersonaTrait =
	| 'FRUSTRATED'
	| 'SKEPTICAL'
	| 'CONFUSED'
	| 'RUSHED'
	| 'CALM'
	| 'HOSTILE';

export interface RolePlayModel {
	id: string;
	/** Display name of the client persona, e.g. "Angry Billing Customer". */
	name: string;
	/** 1-2 sentence scenario the agent will be practicing. */
	description: string;
	area: EvaluationArea;
	subItem: string | null;
	persona: RolePlayPersonaTrait;
	difficulty: RolePlayDifficulty;
	/** What the agent should focus on / demonstrate during the session. */
	objectives: string[];
	/** Agent ids that currently have supervisor access to practice with this model. */
	unlockedForAgentIds: string[];
}
