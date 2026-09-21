import type { RolePlayModel } from '~/models/qa';
import { AGENT_PERSONA } from './constants';

// A few other roster agents get unlocks too, so this isn't AGT-004-only data.
const OTHER_AGENTS = ['AGT-001', 'AGT-002', 'AGT-007'];

export const ROLE_PLAY_MODEL_SEEDS: RolePlayModel[] = [
	{
		id: 'rp-01',
		name: 'Angry Billing Customer',
		description:
			'A customer who was charged twice this month and opens the call already furious, demanding a refund on the spot.',
		area: 'SENTIMENT_EMOTION',
		subItem: 'ANGER',
		persona: 'HOSTILE',
		difficulty: 'HARD',
		objectives: [
			'De-escalate before addressing the billing issue',
			'Stay on script while acknowledging the frustration',
			'Close with a clear next step and timeline',
		],
		unlockedForAgentIds: [AGENT_PERSONA.id, ...OTHER_AGENTS],
	},
	{
		id: 'rp-02',
		name: 'Skeptical Price Shopper',
		description:
			'Comparing your offer against two competitors and pushes back on every price point before committing to anything.',
		area: 'BUSINESS_INSIGHTS',
		subItem: 'COMPETITOR_PLUS_COST',
		persona: 'SKEPTICAL',
		difficulty: 'MEDIUM',
		objectives: [
			'Lead with value before discounting',
			'Handle the early objection without going defensive',
			'Ask for the close at the right moment',
		],
		unlockedForAgentIds: [AGENT_PERSONA.id, ...OTHER_AGENTS],
	},
	{
		id: 'rp-03',
		name: 'Confused First-Time Caller',
		description:
			"Doesn't know the product terminology and keeps asking you to repeat things — needs a slower, plainer walkthrough.",
		area: 'QUALITY_ASSURANCE',
		subItem: 'needsAssessment',
		persona: 'CONFUSED',
		difficulty: 'EASY',
		objectives: [
			'Confirm understanding before moving on',
			'Avoid jargon during needs assessment',
			'Summarize next steps in plain language',
		],
		unlockedForAgentIds: [AGENT_PERSONA.id, ...OTHER_AGENTS],
	},
	{
		id: 'rp-04',
		name: 'Rushed Commuter',
		description:
			'Calling from the car between meetings — wants the shortest possible path to a resolution and will hang up if it drags.',
		area: 'QUALITY_ASSURANCE',
		subItem: 'closing',
		persona: 'RUSHED',
		difficulty: 'MEDIUM',
		objectives: [
			'Keep the call tight without skipping required disclosures',
			'Prioritize the one thing the caller actually needs',
			'Close cleanly in under the target handle time',
		],
		unlockedForAgentIds: [AGENT_PERSONA.id, ...OTHER_AGENTS],
	},
	{
		id: 'rp-05',
		name: 'Anxious Data-Protection Caller',
		description:
			'Worried about identity theft after a data breach headline and wants every disclosure explained before sharing any details.',
		area: 'COMPLIANCE',
		subItem: 'dataProtection',
		persona: 'FRUSTRATED',
		difficulty: 'HARD',
		objectives: [
			'Deliver every mandatory disclosure without sounding rehearsed',
			'Reassure without over-promising',
			'Recognize when to escalate to a specialist',
		],
		unlockedForAgentIds: OTHER_AGENTS,
	},
	{
		id: 'rp-06',
		name: 'Calm Renewal Customer',
		description:
			'An easygoing long-term customer up for renewal — low friction, but a good rep for practicing upsell timing.',
		area: 'BUSINESS_INSIGHTS',
		subItem: 'BEST_TIME_FRAME',
		persona: 'CALM',
		difficulty: 'EASY',
		objectives: [
			'Find a natural moment to introduce the upgrade',
			'Read buying signals without being pushy',
			'Confirm the renewal terms clearly before closing',
		],
		unlockedForAgentIds: OTHER_AGENTS,
	},
	{
		id: 'rp-07',
		name: 'Persistent Objection Caller',
		description:
			'Raises the same objection three different ways and only backs down once they feel genuinely heard.',
		area: 'QUALITY_ASSURANCE',
		subItem: 'objectionHandling',
		persona: 'SKEPTICAL',
		difficulty: 'HARD',
		objectives: [
			'Vary the response instead of repeating the same rebuttal',
			'Name the objection back before answering it',
			'Recognize when the objection has actually been resolved',
		],
		unlockedForAgentIds: OTHER_AGENTS,
	},
	{
		id: 'rp-08',
		name: 'Overwhelmed Social Media Escalation',
		description:
			'Threatening to post about the issue online — the call opens hot and needs careful de-escalation before any resolution talk.',
		area: 'SENTIMENT_EMOTION',
		subItem: 'rrss',
		persona: 'FRUSTRATED',
		difficulty: 'MEDIUM',
		objectives: [
			'Acknowledge the threat without getting defensive',
			'Move the conversation from public venting to resolution',
			'Document the interaction per the escalation policy',
		],
		unlockedForAgentIds: OTHER_AGENTS,
	},
];
