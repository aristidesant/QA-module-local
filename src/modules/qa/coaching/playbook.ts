import type { EvaluationArea } from '~/models/qa';
import type { CallIssueKey } from '~/modules/qa/calls/issues';

export interface PlaybookEntry {
	/** Session topic (also the mock talking-point wording). */
	topic: string;
	area: EvaluationArea;
	/** LMS content ids to suggest, best first. */
	contentIds: string[];
	/** How the supervisor should bring it up with the agent. */
	approach: string;
	/** Conceptual fix. */
	solution: string;
	/** A concrete script or real example. */
	example: string;
}

/** Mock guidance per call issue — English-only, like COACHING_TOPICS. */
export const COACHING_PLAYBOOK: Record<CallIssueKey, PlaybookEntry> = {
	'auto-fail': {
		topic: 'Auto-fail prevention',
		area: 'QUALITY_ASSURANCE',
		contentIds: ['lms-c07', 'lms-c05'],
		approach:
			'Open with the fact, not the verdict: play the exact moment of the auto-fail and ask the agent what they would do differently. Auto-fails feel like a judgement on the person, so keep the focus on the one step that was skipped, and make clear the goal is zero repeats, not blame.',
		solution:
			'Turn the critical steps into a non-negotiable checklist the agent runs before moving on: identity confirmed, mandatory disclosure read, consent captured. The step is done when it is said out loud, not when it is "known".',
		example:
			'Last Thursday the customer interrupted during identification and the agent moved to the pitch without finishing it. Script: "Before I continue, I just need to confirm two details with you — your date of birth and the postcode on the account."',
	},
	'qa-ecn': {
		topic: 'Critical business errors',
		area: 'QUALITY_ASSURANCE',
		contentIds: ['lms-c07', 'lms-c03'],
		approach:
			'Show the agent the business consequence of the error (a wrong plan, a missed cancellation) rather than the scoring rule. Ask them to narrate the call back to you — most ECN errors come from assuming instead of confirming.',
		solution:
			'Introduce a "confirm before commit" habit: every change to the account is read back to the customer and acknowledged before it is saved.',
		example:
			'"So just to confirm: you want to move to the 50 GB plan from the 1st of next month and keep the same number — is that right?" Then wait for the yes.',
	},
	'qa-enc': {
		topic: 'Non-critical errors',
		area: 'QUALITY_ASSURANCE',
		contentIds: ['lms-c03', 'lms-c04'],
		approach:
			'These are the errors that add up: skipped recap, no next step, closing too fast. Pick two calls and go through the last 60 seconds of each with the agent; the pattern is usually the same.',
		solution:
			'Standardise the close: summarise what was done, state the next step and when, and ask if anything is unclear. Three sentences, every call.',
		example:
			'"Today we fixed the billing address and I have raised the refund — you will see it within five working days. Is there anything else you would like me to check before we end?"',
	},
	'qa-ecc': {
		topic: 'Critical compliance errors',
		area: 'COMPLIANCE',
		contentIds: ['lms-c12', 'lms-c08'],
		approach:
			'Treat it as a process gap, not a knowledge gap: the agent knows the disclosure, they skipped it under pressure. Ask when in the call they feel the pressure and anchor the disclosure before that moment.',
		solution:
			'Move the disclosure to the start of the relevant block, before the customer can interrupt, and read it from the script word for word.',
		example:
			'Before the offer: "This call is recorded for quality purposes and the plan I am about to describe has a 24-month term with an early-exit fee — I will send the details in writing." Then the pitch.',
	},
	'qa-ecuf': {
		topic: 'End-user critical errors',
		area: 'QUALITY_ASSURANCE',
		contentIds: ['lms-c01', 'lms-c02'],
		approach:
			'The customer left the call worse off (wrong information, unmet need). Listen to one call together and stop at the moment the need was misunderstood; ask the agent what question would have surfaced it.',
		solution:
			'Two discovery questions before any answer, and a one-line restatement of the need: "So what you need is…". Answer only after the restatement is confirmed.',
		example:
			'"Just so I get this right: the issue is not the price of the plan, it is that the second line stopped working after the change — correct?"',
	},
	'low-qa-score': {
		topic: 'QA fundamentals',
		area: 'QUALITY_ASSURANCE',
		contentIds: ['lms-c05', 'lms-c02'],
		approach:
			'Several small things rather than one big one. Share the scorecard breakdown and let the agent choose the single aspect they want to fix this week — ownership beats a list of ten corrections.',
		solution:
			"One behaviour per week, measured on next week's scorecard. Keep the rest of the evaluation as context, not as targets.",
		example:
			'Agreed behaviour for the week: "Open every call with the identification script in full." Check it on three calls on Friday together.',
	},
	'compliance-security': {
		topic: 'Security protocol & data protection',
		area: 'COMPLIANCE',
		contentIds: ['lms-c09'],
		approach:
			'Be direct: identity checks and data handling are not negotiable. Replay a call where the check was partial and ask the agent what a fraudster could have done with what was shared.',
		solution:
			'Full identity verification before any account detail is read out, no exceptions for "regular" customers, and never repeat card or ID numbers back on the line.',
		example:
			'"I can see the account, but before I share anything I need to verify you — can you confirm the security answer you set up?" If it fails twice, offer the written route instead.',
	},
	'compliance-regulatory': {
		topic: 'Mandatory disclosures',
		area: 'COMPLIANCE',
		contentIds: ['lms-c08', 'lms-c10'],
		approach:
			'Ask the agent to recite the disclosure from memory; most gaps are a paraphrase that drops a required clause. Compare it with the approved text side by side.',
		solution:
			'Read the disclosure from the script, in full, at the point the process defines — and confirm the customer heard it ("Is that clear?").',
		example:
			'"The price is 29.90 a month for 12 months, then 34.90. You can cancel within 14 days without any charge. Shall I go ahead?"',
	},
	'compliance-legal': {
		topic: 'Consent & terms acknowledgment',
		area: 'COMPLIANCE',
		contentIds: ['lms-c13', 'lms-c10'],
		approach:
			'Explain why an implicit yes is not consent: the recording must contain the explicit agreement. Play the call and point to where the agent moved on without it.',
		solution:
			'Always close the legal block with a yes/no question and wait for the answer before any change is made.',
		example:
			'"Do you agree to the terms I have just read and authorise the change today?" — and a pause until the customer says yes.',
	},
	'negative-customer-emotion': {
		topic: 'De-escalation',
		area: 'SENTIMENT_EMOTION',
		contentIds: ['lms-c15', 'lms-c17'],
		approach:
			'Start by acknowledging that angry calls are hard, then listen to one together and mark the moment the tone shifted. Usually the agent defended the process instead of acknowledging the frustration.',
		solution:
			'Acknowledge first, solve second: name the emotion, apologise for the experience (not the policy), and only then move to the next step.',
		example:
			'"I can hear this has been really frustrating, and you have been patient for far too long. Let me fix it now: here is what I am going to do…"',
	},
	'negative-agent-emotion': {
		topic: 'Keeping your own tone steady',
		area: 'SENTIMENT_EMOTION',
		contentIds: ['lms-c19'],
		approach:
			"This is about the agent's wellbeing as much as the customer's. Ask how the week felt before you show any call, and check for queue pressure or back-to-back escalations.",
		solution:
			'Micro-recovery between calls (a breath, a note, a reset of the greeting) and an agreed signal to take a five-minute break after a hard call.',
		example:
			'After an escalation: 30 seconds of wrap-up before the next call, greeting re-read aloud. Agreed: the agent can flag "I need five" in the team chat without explanation.',
	},
	'low-customer-sentiment': {
		topic: 'Empathy & active listening',
		area: 'SENTIMENT_EMOTION',
		contentIds: ['lms-c14', 'lms-c16'],
		approach:
			'Customers are leaving neutral-to-cold rather than angry. Listen to a call and count the empathy statements; often there are none, only process. Ask the agent what the customer felt.',
		solution:
			'One acknowledgement per customer statement before moving on, and a warmer close that names what was done for them.',
		example:
			'"That makes sense — nobody wants to be charged twice. I have removed it and I will make sure it does not happen again next month."',
	},
	'low-agent-sentiment': {
		topic: 'Agent tone & energy',
		area: 'SENTIMENT_EMOTION',
		contentIds: ['lms-c19', 'lms-c16'],
		approach:
			'Flat tone reads as disinterest to the customer. Share one call and ask the agent to rate their own energy; then ask what would make the next shift easier.',
		solution:
			'A short tonal reset at the start of each call (smile, name, pace) and shorter blocks of back-to-back calls where the schedule allows.',
		example:
			'Greeting re-recorded together: "Good morning, this is John from NewTech — how can I help you today?" at a slightly faster pace and with the customer\'s name used once early.',
	},
	'non-effective-contact': {
		topic: 'Effective contacts',
		area: 'BUSINESS_INSIGHTS',
		contentIds: ['lms-c02', 'lms-c22'],
		approach:
			'Many calls end without reaching the person or the goal. Review the opening of three calls: the agent often loses the contact in the first 15 seconds by starting with the pitch.',
		solution:
			'Confirm the right person and a reason to stay on the line before anything else; if it is not the right time, agree a callback instead of pushing.',
		example:
			'"Am I speaking with Ms Martínez? Great — I am calling about the line you asked us to look at last week; do you have two minutes now or shall I call back at six?"',
	},
};

/** Used when the week had no incident at all. */
export const CLEAN_WEEK_PLAYBOOK: PlaybookEntry = {
	topic: 'Weekly coaching review',
	area: 'QUALITY_ASSURANCE',
	contentIds: [],
	approach:
		'A clean week: no incident was detected in the evaluated calls. Use the session to recognise what went well and to agree the one skill the agent wants to stretch next.',
	solution:
		'Keep the current routine and pick a development goal (mentoring a newer colleague, handling a harder queue) rather than a correction.',
	example:
		'"Your calls this week were spotless — which part of the job would you like to get better at next?"',
};
