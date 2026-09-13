/**
 * LMS catalogue: published content and learning paths.
 *
 * This module must NOT import anything from `~/modules/qa/team/*` at runtime:
 * `team/constants.ts` derives the legacy `LMS_CATALOG` from `LMS_CONTENT`, and a
 * team import here would close an import cycle.
 */
import type { LmsContent, LmsLearningPath } from '~/models/qa';

const AUTHOR = 'Elena Ruiz';
const PUBLISHED_AT = '2026-06-01';
const UPDATED_AT = '2026-08-20';

export const LMS_CONTENT: LmsContent[] = [
	// ── Quality Assurance ───────────────────────────────────────────────────────
	{
		id: 'lms-c01',
		title: 'Opening & Identification: the first 30 seconds',
		summary:
			'How to greet, identify yourself and verify the customer before touching the account, without sounding like a script.',
		format: 'VIDEO',
		area: 'QUALITY_ASSURANCE',
		subItem: 'openingIdentification',
		impactMetricId: 'QA_OVERALL_SCORE',
		durationMin: 12,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['opening', 'verification'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'Why the first 30 seconds decide the call', startSec: 0 },
			{ title: 'The four elements of a compliant greeting', startSec: 180 },
			{ title: 'Verifying identity without friction', startSec: 420 },
			{ title: 'Common openings that cost points', startSec: 600 },
		],
		stats: { assigned: 18, completed: 15, avgScore: null, avgRating: 4.6 },
	},
	{
		id: 'lms-c02',
		title: 'Needs Assessment Questions that uncover the real problem',
		summary:
			'Five open questions that surface the customer goal and constraint before you present anything.',
		format: 'DOCUMENT',
		area: 'QUALITY_ASSURANCE',
		subItem: 'needsAssessment',
		impactMetricId: 'QA_OVERALL_SCORE',
		durationMin: 10,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['discovery', 'questions'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## Why discovery questions matter
Agents who ask two open questions before presenting an offer score 11 points higher on QA and convert 8% more.

## The five questions
- **What prompted your call today?** — opens the conversation without assumptions.
- **How is this affecting you right now?** — surfaces urgency and emotion.
- **What have you already tried?** — avoids repeating failed steps.
- **What would a good outcome look like?** — aligns the offer with the customer's goal.
- **Is there anything else I should know?** — catches hidden constraints.

## Checklist before you present anything
1. Two open questions asked.
2. Customer's goal repeated back in their words.
3. Constraint (budget, time, decision-maker) identified.`,
		stats: { assigned: 21, completed: 17, avgScore: null, avgRating: 4.4 },
	},
	{
		id: 'lms-c03',
		title: 'Objection Handling Fundamentals',
		summary:
			'Acknowledge, isolate, answer, confirm: the four-step loop that keeps an objection from ending the call.',
		format: 'VIDEO',
		area: 'QUALITY_ASSURANCE',
		subItem: 'objectionHandling',
		impactMetricId: 'QA_ENC_COUNT',
		durationMin: 20,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['objections', 'structure'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'What an objection actually signals', startSec: 0 },
			{ title: 'Step 1-2: acknowledge and isolate', startSec: 300 },
			{ title: 'Step 3-4: answer and confirm', startSec: 680 },
			{ title: 'Live call breakdown', startSec: 980 },
		],
		stats: { assigned: 20, completed: 14, avgScore: null, avgRating: 4.5 },
	},
	{
		id: 'lms-c04',
		title: 'Closing the Call: recap & next steps',
		summary: 'The recap that prevents repeat calls and the two sentences that close every call cleanly.',
		format: 'DOCUMENT',
		area: 'QUALITY_ASSURANCE',
		subItem: 'closing',
		impactMetricId: 'QA_ENC_COUNT',
		durationMin: 8,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['closing', 'recap'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## The close is part of the resolution
Half of our repeat calls come from a customer who did not know what would happen next. The recap is not a formality.

## What a complete close contains
- **What we did** — one sentence, in plain words, no internal jargon.
- **What happens next** — the action, who performs it and by when.
- **What the customer must do** — even if the answer is nothing, say it.
- **How they can come back** — reference number or the channel to use.
- **A real closing question** — "Is there anything else I can help you with?" asked once, and answered.

## Checklist before you release the call
1. Next step stated with a date.
2. Reference number given.
3. Closing question asked and answered.`,
		stats: { assigned: 16, completed: 13, avgScore: null, avgRating: 4.2 },
	},
	{
		id: 'lms-c05',
		title: 'QA Fundamentals check',
		summary: 'Four questions on the evaluation form: what is scored, what is critical and what is an auto-fail.',
		format: 'QUIZ',
		area: 'QUALITY_ASSURANCE',
		subItem: null,
		impactMetricId: 'QA_OVERALL_SCORE',
		durationMin: 10,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['assessment'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		passScore: 80,
		questions: [
			{
				id: 'q1',
				prompt: 'Which error type is an ECN?',
				options: [
					'A non-critical wording slip',
					'A critical business error',
					'A critical compliance error',
					'A critical end-user error',
				],
				correctIndex: 1,
				explanation: 'ECN is the critical business error: it costs the company money or the sale.',
			},
			{
				id: 'q2',
				prompt: 'When does a call become an auto-fail?',
				options: [
					'When the total score is below 70',
					'When any critical error is present',
					'When the call lasts more than 10 minutes',
					'When the customer asks for a supervisor',
				],
				correctIndex: 1,
				explanation: 'A single critical error fails the whole call regardless of the total score.',
			},
			{
				id: 'q3',
				prompt: 'How many open questions should you ask before presenting an offer?',
				options: ['None, present first', 'At least two', 'Exactly five', 'As many as the script lists'],
				correctIndex: 1,
				explanation: 'Two open questions are the minimum for a complete needs assessment.',
			},
			{
				id: 'q4',
				prompt: 'The recap at the end of the call must always include…',
				options: [
					'The customer date of birth',
					'The next step and who performs it',
					'A sales offer',
					'The internal ticket queue name',
				],
				correctIndex: 1,
				explanation: 'The next step with an owner and a date is what prevents repeat calls.',
			},
		],
		stats: { assigned: 19, completed: 16, avgScore: 84, avgRating: 4.1 },
	},
	{
		id: 'lms-c06',
		title: 'Practice: the unclear request',
		summary:
			'A customer who cannot explain the problem. Practise discovery questions before jumping to a solution.',
		format: 'SCENARIO',
		area: 'QUALITY_ASSURANCE',
		subItem: 'needsAssessment',
		impactMetricId: 'QA_OVERALL_SCORE',
		durationMin: 15,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['role-play', 'discovery'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		scenario: {
			situation:
				'A customer calls saying only that "the service is not working properly" and cannot describe what happens. They are in a hurry and have called once before.',
			steps: [
				{
					speaker: 'CUSTOMER',
					text: 'Look, it just does not work properly. I already called last week and nobody fixed it. Can you just fix it?',
				},
				{
					speaker: 'COACH',
					text: 'The customer gave you no symptom at all. Write the first open question you would ask, without guessing the problem.',
				},
				{
					speaker: 'CUSTOMER',
					text: 'It fails in the evenings, I think. Sometimes it is fine in the morning. I do not know, I am not technical.',
				},
				{
					speaker: 'COACH',
					text: 'You now have a time pattern. Write the follow-up question that narrows this down and the sentence you use to confirm their goal.',
				},
			],
			selfCheck: [
				{
					id: 's1',
					prompt: 'What should you do before proposing any fix on this call?',
					options: [
						'Offer the standard reset procedure',
						'Ask open questions until you have a concrete symptom',
						'Transfer to technical support',
						'Apologise and schedule a callback',
					],
					correctIndex: 1,
					explanation: 'Without a symptom you cannot resolve, and a guessed fix causes the repeat call.',
				},
				{
					id: 's2',
					prompt: 'The customer says they already called last week. What do you do with that?',
					options: [
						'Ignore it, it is a new case',
						'Ask what was tried so you do not repeat it',
						'Apologise repeatedly',
						'Escalate immediately',
					],
					correctIndex: 1,
					explanation: 'Asking what was already tried avoids repeating a failed step and shows you listened.',
				},
				{
					id: 's3',
					prompt: 'How do you confirm you understood before acting?',
					options: [
						'Repeat the goal back in the customer own words',
						'Read the internal notes out loud',
						'Ask them to confirm the account number again',
						'Summarise the terms and conditions',
					],
					correctIndex: 0,
					explanation: 'Repeating the goal back is what the evaluation form scores as a complete needs assessment.',
				},
			],
		},
		stats: { assigned: 9, completed: 6, avgScore: 78, avgRating: 4.7 },
	},
	{
		id: 'lms-c07',
		title: 'Auto-fail prevention: critical errors explained',
		summary: 'The four COPC error types, what triggers each one and how to catch yourself before it happens.',
		format: 'VIDEO',
		area: 'QUALITY_ASSURANCE',
		subItem: 'ECN',
		impactMetricId: 'QA_AUTO_FAIL_COUNT',
		durationMin: 14,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['copc', 'critical-errors'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'ECN, ENC, ECC, ECUF in one minute', startSec: 0 },
			{ title: 'The three most common auto-fails', startSec: 240 },
			{ title: 'Self-check habits that prevent them', startSec: 520 },
			{ title: 'What to do when you realise mid-call', startSec: 700 },
		],
		stats: { assigned: 11, completed: 9, avgScore: null, avgRating: 4.3 },
	},

	// ── Compliance ──────────────────────────────────────────────────────────────
	{
		id: 'lms-c08',
		title: 'Regulatory Disclosures 2026',
		summary: 'The disclosures you must read, when each one applies and the wording that keeps them valid.',
		format: 'DOCUMENT',
		area: 'COMPLIANCE',
		subItem: 'disclosureCompliance',
		impactMetricId: 'COMPLIANCE_SECURITY_SCORE',
		durationMin: 15,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['disclosures', '2026'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## What changed in 2026
The recording disclosure now has to be given **before** any account data is discussed, not merely within the first minute. Two disclosures were merged and one was added for digital channels.

## The disclosures and when they apply
- **Recording** — every inbound and outbound call, before identity verification.
- **Data processing** — whenever you read back or update personal data.
- **Contract terms** — before any offer is accepted, including renewals.
- **Cancellation rights** — on every sale, stated with the number of days.
- **Third-party transfer** — before passing the customer to a partner service.

## Checklist for a compliant call
1. Recording disclosure read before the account is opened.
2. Cancellation window stated in days, not "the legal period".
3. Customer confirmation captured verbally for any accepted offer.`,
		stats: { assigned: 21, completed: 12, avgScore: null, avgRating: 4.0 },
	},
	{
		id: 'lms-c09',
		title: 'Data Protection on Calls',
		summary: 'What you may read back, what you must never repeat out loud, and how to verify identity safely.',
		format: 'VIDEO',
		area: 'COMPLIANCE',
		subItem: 'dataProtection',
		impactMetricId: 'COMPLIANCE_SECURITY_SCORE',
		durationMin: 18,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['data-protection', 'verification'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'What counts as personal data', startSec: 0 },
			{ title: 'Safe identity verification', startSec: 360 },
			{ title: 'What you must never read aloud', startSec: 700 },
			{ title: 'Handling a third party on the line', startSec: 940 },
		],
		stats: { assigned: 21, completed: 18, avgScore: null, avgRating: 4.4 },
	},
	{
		id: 'lms-c10',
		title: 'Transparency & consent in billing conversations',
		summary: 'How to explain a charge, capture consent and handle a dispute without a compliance finding.',
		format: 'DOCUMENT',
		area: 'COMPLIANCE',
		subItem: 'transparenciaConsentimiento',
		impactMetricId: 'COMPLIANCE_REGULATORY_SCORE',
		durationMin: 12,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['billing', 'consent'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## Transparency is a scored behaviour
Regulatory findings in billing calls almost never come from the amount. They come from how the charge was explained and whether consent was captured.

## Explaining a charge
- **Name the charge** exactly as it appears on the statement.
- **Give the date and the period** it covers.
- **Say what caused it** in one sentence, without blaming the customer.
- **State the dispute route** before the customer has to ask for it.
- **Capture consent verbally** for anything that changes the recurring amount.

## Checklist
1. Charge, date and period stated.
2. Dispute route offered proactively.
3. Verbal consent captured and repeated back for any recurring change.`,
		stats: { assigned: 12, completed: 8, avgScore: null, avgRating: 4.1 },
	},
	{
		id: 'lms-c11',
		title: 'Compliance certification quiz',
		summary: 'The annual certification: disclosures, do-not-call, identity verification and billing transparency.',
		format: 'QUIZ',
		area: 'COMPLIANCE',
		subItem: null,
		impactMetricId: 'COMPLIANCE_OVERALL_SCORE',
		durationMin: 15,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['certification', 'annual'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		passScore: 90,
		questions: [
			{
				id: 'q1',
				prompt: 'When must the recording disclosure be given?',
				options: [
					'After identity verification',
					'Within the first 30 seconds, before any account data',
					'Only if the customer asks',
					'At the end of the call',
				],
				correctIndex: 1,
				explanation: 'Disclosure precedes any account discussion.',
			},
			{
				id: 'q2',
				prompt: 'A number is on the Do-Not-Call list. You should…',
				options: [
					'Call once and log it',
					'Not call and flag the record',
					'Call from a different line',
					'Send an SMS instead',
				],
				correctIndex: 1,
				explanation: 'DNC numbers must never be contacted.',
			},
			{
				id: 'q3',
				prompt: 'Which data can be read back to confirm identity?',
				options: [
					'Full card number',
					'Last 4 digits of the ID',
					'Full password',
					'Mother maiden name in full',
				],
				correctIndex: 1,
				explanation: 'Only partial identifiers are allowed.',
			},
			{
				id: 'q4',
				prompt: 'A customer disputes a charge. Transparency requires you to…',
				options: [
					'Explain the charge, the date and how to dispute it',
					'Transfer immediately',
					'Offer a discount',
					'End the call',
				],
				correctIndex: 0,
				explanation: 'Billing transparency = what, when and how to dispute.',
			},
		],
		stats: { assigned: 17, completed: 11, avgScore: 88, avgRating: 3.9 },
	},
	{
		id: 'lms-c12',
		title: 'Practice: the customer asks you to skip the disclosure',
		summary: 'A rushed customer pushes back on the legal wording. Practise staying compliant without friction.',
		format: 'SCENARIO',
		area: 'COMPLIANCE',
		subItem: 'disclosureCompliance',
		impactMetricId: 'COMPLIANCE_VIOLATION_COUNT',
		durationMin: 12,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['role-play', 'disclosures'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		scenario: {
			situation:
				'You are halfway through the mandatory cancellation-rights disclosure on a sale. The customer interrupts, says they have heard it before and asks you to skip to the end.',
			steps: [
				{
					speaker: 'CUSTOMER',
					text: 'Yes, yes, I know all that, I have been a customer for years. Just skip it and confirm the order, I am late for something.',
				},
				{
					speaker: 'COACH',
					text: 'Write how you keep the disclosure without making the customer feel you ignored them.',
				},
				{
					speaker: 'CUSTOMER',
					text: 'Fine, but make it quick. And I do not want to be recorded saying anything.',
				},
				{
					speaker: 'COACH',
					text: 'The customer has now objected to the recording as well. Write what you say next and what you do if they refuse.',
				},
			],
			selfCheck: [
				{
					id: 's1',
					prompt: 'Can you shorten a mandatory disclosure when the customer asks?',
					options: [
						'Yes, if they confirm they know it',
						'No, the wording must be given in full',
						'Yes, if the call is recorded',
						'Only for existing customers',
					],
					correctIndex: 1,
					explanation: 'The disclosure wording is fixed; only your framing around it can change.',
				},
				{
					id: 's2',
					prompt: 'The customer refuses to be recorded. What happens to the sale?',
					options: [
						'Complete it and note the refusal',
						'It cannot be completed on this channel',
						'Record anyway, it is our system',
						'Ask a colleague to take over',
					],
					correctIndex: 1,
					explanation: 'Without the recorded consent the transaction cannot be completed on the call.',
				},
				{
					id: 's3',
					prompt: 'What is the best framing when a customer is in a hurry?',
					options: [
						'Acknowledge the hurry, state it takes 20 seconds, and read it',
						'Read it faster than normal',
						'Ask them to call back later',
						'Send it by email instead',
					],
					correctIndex: 0,
					explanation: 'Naming the time cost up front gets you the 20 seconds without an argument.',
				},
			],
		},
		stats: { assigned: 8, completed: 5, avgScore: 82, avgRating: 4.6 },
	},
	{
		id: 'lms-c13',
		title: 'Do-Not-Call list: what you must check',
		summary: 'Where the DNC flag lives, when to check it and what to do when a listed number reaches you.',
		format: 'VIDEO',
		area: 'COMPLIANCE',
		subItem: 'noLlamarList',
		impactMetricId: 'COMPLIANCE_LEGAL_SCORE',
		durationMin: 9,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['dnc', 'outbound'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'What the Do-Not-Call list is', startSec: 0 },
			{ title: 'The pre-call check', startSec: 200 },
			{ title: 'When a listed customer calls you', startSec: 380 },
		],
		stats: { assigned: 6, completed: 6, avgScore: null, avgRating: 4.2 },
	},

	// ── Sentiment & Emotion ─────────────────────────────────────────────────────
	{
		id: 'lms-c14',
		title: 'Active Listening & Empathy',
		summary: 'Hearing the emotion under the words, and the three responses that make a customer feel heard.',
		format: 'VIDEO',
		area: 'SENTIMENT_EMOTION',
		subItem: 'FRUSTRATION',
		impactMetricId: 'CUSTOMER_SENTIMENT_SCORE',
		durationMin: 20,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['empathy', 'listening'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'Listening for the emotion, not the words', startSec: 0 },
			{ title: 'Acknowledge, name, validate', startSec: 380 },
			{ title: 'Silence as a tool', startSec: 760 },
			{ title: 'Call breakdown: before and after', startSec: 1000 },
		],
		stats: { assigned: 20, completed: 16, avgScore: null, avgRating: 4.8 },
	},
	{
		id: 'lms-c15',
		title: 'De-escalation Techniques',
		summary:
			'Recognise anger early, lower the temperature with tone and pacing, and get the call back to problem-solving.',
		format: 'VIDEO',
		area: 'SENTIMENT_EMOTION',
		subItem: 'ANGER',
		impactMetricId: 'NEGATIVE_EMOTION_CALL_SHARE',
		durationMin: 25,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['de-escalation', 'anger'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'Spotting the escalation curve', startSec: 0 },
			{ title: 'Tone, pace and silence', startSec: 320 },
			{ title: 'Reframing the problem', startSec: 780 },
			{ title: 'Closing with commitment', startSec: 1200 },
		],
		stats: { assigned: 18, completed: 11, avgScore: null, avgRating: 4.7 },
	},
	{
		id: 'lms-c16',
		title: 'Empathy statements that work',
		summary: 'A short list of phrases that land, and the well-meant ones that make customers angrier.',
		format: 'DOCUMENT',
		area: 'SENTIMENT_EMOTION',
		subItem: null,
		impactMetricId: 'CUSTOMER_SENTIMENT_SCORE',
		durationMin: 8,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['empathy', 'phrases'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## Empathy is specific or it is noise
"I understand how you feel" scores nothing when it is not attached to what the customer just said. The evaluation looks for a statement that names the situation.

## Statements that work
- **"That is two weeks without service — I would be frustrated too."** — names the fact and the emotion.
- **"You have already explained this once, I can see the notes."** — removes the fear of repeating.
- **"I am going to stay on this until it is resolved."** — a commitment, not a feeling.
- **"Let me tell you exactly what I can do right now."** — moves from emotion to action.
- **"You were right to call about this."** — validates the decision to escalate.

## What to avoid
1. "Calm down" in any form.
2. Apologising five times instead of acting once.
3. Empathy with no next step attached.`,
		stats: { assigned: 15, completed: 14, avgScore: null, avgRating: 4.5 },
	},
	{
		id: 'lms-c17',
		title: 'Practice: turning a negative call around',
		summary: 'A disappointed customer ready to cancel. Practise recovering the call to a neutral or positive close.',
		format: 'SCENARIO',
		area: 'SENTIMENT_EMOTION',
		subItem: 'DISAPPOINTMENT',
		impactMetricId: 'SENTIMENT_RECOVERY_COUNT',
		durationMin: 15,
		level: 'ADVANCED',
		status: 'PUBLISHED',
		tags: ['role-play', 'recovery'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		scenario: {
			situation:
				'A customer of six years calls after a second failed installation appointment. They are not shouting, they are disappointed and have already mentioned the competitor.',
			steps: [
				{
					speaker: 'CUSTOMER',
					text: 'I took a day off work. Twice. Nobody called, nobody came. I have been with you six years and this is what I get.',
				},
				{
					speaker: 'COACH',
					text: 'Write your first response. Do not offer a solution yet, and do not apologise more than once.',
				},
				{
					speaker: 'CUSTOMER',
					text: 'Honestly I am looking at other providers. A colleague pays less and they show up. Give me one reason to stay.',
				},
				{
					speaker: 'COACH',
					text: 'The customer asked a direct question. Write what you commit to, in concrete terms, and how you close the call.',
				},
			],
			selfCheck: [
				{
					id: 's1',
					prompt: 'What recovers a disappointed customer fastest?',
					options: [
						'Repeated apologies',
						'A specific commitment with a name and a date',
						'A discount offered immediately',
						'Explaining the internal process failure',
					],
					correctIndex: 1,
					explanation: 'Disappointment comes from broken promises, so only a concrete new promise repairs it.',
				},
				{
					id: 's2',
					prompt: 'The customer mentions a competitor. You should…',
					options: [
						'Criticise the competitor',
						'Ignore the comment',
						'Acknowledge it and return to what you can control',
						'Transfer to retention immediately',
					],
					correctIndex: 2,
					explanation: 'Acknowledging without arguing keeps the conversation on your commitment.',
				},
				{
					id: 's3',
					prompt: 'A call counts as recovered when…',
					options: [
						'The customer stops complaining',
						'The customer ends neutral or positive with a clear next step',
						'You offered compensation',
						'The call lasted under five minutes',
					],
					correctIndex: 1,
					explanation: 'Recovery is measured by the closing sentiment plus an agreed next step.',
				},
			],
		},
		stats: { assigned: 7, completed: 4, avgScore: 75, avgRating: 4.6 },
	},
	{
		id: 'lms-c18',
		title: 'Emotion recognition check',
		summary: 'Four questions on reading customer emotion and choosing the right response.',
		format: 'QUIZ',
		area: 'SENTIMENT_EMOTION',
		subItem: null,
		impactMetricId: 'AGENT_SENTIMENT_SCORE',
		durationMin: 8,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['assessment', 'emotion'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		passScore: 75,
		questions: [
			{
				id: 'q1',
				prompt: 'A customer goes quiet and answers in single words. This usually signals…',
				options: ['Satisfaction', 'Disappointment or resignation', 'A bad line', 'Agreement'],
				correctIndex: 1,
				explanation: 'Withdrawal is the most missed negative signal on evaluated calls.',
			},
			{
				id: 'q2',
				prompt: 'Which response lowers anger fastest?',
				options: [
					'Explaining the policy in detail',
					'Naming the impact on the customer and committing to an action',
					'Asking them to calm down',
					'Putting them on hold to check',
				],
				correctIndex: 1,
				explanation: 'Naming the impact plus a commitment moves the call from emotion to action.',
			},
			{
				id: 'q3',
				prompt: 'Your own tone drops flat on a difficult call. What does the evaluation record?',
				options: [
					'Nothing, only the customer is scored',
					'A lower agent sentiment score',
					'An automatic fail',
					'A compliance finding',
				],
				correctIndex: 1,
				explanation: 'Agent sentiment is scored separately from customer sentiment.',
			},
			{
				id: 'q4',
				prompt: 'A call that starts negative and ends positive is counted as…',
				options: ['A recovered call', 'A neutral call', 'An escalation', 'A repeat call'],
				correctIndex: 0,
				explanation: 'Recovery is tracked as its own metric and is one of the strongest quality signals.',
			},
		],
		stats: { assigned: 14, completed: 12, avgScore: 81, avgRating: 4.0 },
	},
	{
		id: 'lms-c19',
		title: 'Managing your own stress on high-volume days',
		summary: 'Micro-recovery habits between calls that keep your tone steady when the queue does not stop.',
		format: 'DOCUMENT',
		area: 'SENTIMENT_EMOTION',
		subItem: 'WELLBEING',
		impactMetricId: 'AGENT_SENTIMENT_SCORE',
		durationMin: 6,
		level: 'BEGINNER',
		status: 'DRAFT',
		tags: ['wellbeing', 'burnout'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## Your tone is the first thing to go
On high-volume days agent sentiment drops before quality does. The customer hears it two calls before an evaluator sees it.

## Micro-recovery between calls
- **Two slow breaths before you accept** — resets pace more than it sounds.
- **Physically reset your posture** — shoulders down, feet flat, screen at eye level.
- **Close the previous call mentally** — one sentence to yourself: it is finished.
- **Use your breaks as breaks** — away from the screen, not on it.
- **Flag a bad streak early** — three hard calls in a row is a reason to tell your supervisor.

## Checklist
1. One real break taken away from the desk.
2. Difficult calls named to your supervisor, not absorbed.
3. Tone checked after every escalation.`,
		stats: { assigned: 10, completed: 9, avgScore: null, avgRating: 4.9 },
	},

	// ── Business Insights ───────────────────────────────────────────────────────
	{
		id: 'lms-c20',
		title: 'Handling Competitor Comparisons',
		summary: 'What to do when the customer quotes a cheaper competitor, without discounting or arguing.',
		format: 'VIDEO',
		area: 'BUSINESS_INSIGHTS',
		subItem: 'COMPETITOR_PLUS_COST',
		impactMetricId: 'BI_COMPETITOR_PLUS_COST_RATE',
		durationMin: 18,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['competitors', 'value'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'Why price comparisons are rarely about price', startSec: 0 },
			{ title: 'Comparing total value, not the headline number', startSec: 360 },
			{ title: 'What you must never say about a competitor', startSec: 700 },
			{ title: 'Live call breakdown', startSec: 900 },
		],
		stats: { assigned: 13, completed: 9, avgScore: null, avgRating: 4.3 },
	},
	{
		id: 'lms-c21',
		title: 'Objection handling playbook: price',
		summary: 'The five price objections we actually hear and a tested response for each one.',
		format: 'DOCUMENT',
		area: 'BUSINESS_INSIGHTS',
		subItem: 'UNHANDLED_OBJECTION',
		impactMetricId: 'BI_UNHANDLED_OBJECTION_RATE',
		durationMin: 12,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['objections', 'price'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## An unhandled objection is a lost call
Our data shows that 38% of non-conversions are recorded as "price too high", but most of those calls never contained a real answer to the objection.

## The five objections and the response
- **"It is too expensive."** — Ask what they are comparing it to before answering.
- **"The competitor is cheaper."** — Compare the total, including what is bundled.
- **"I cannot afford it right now."** — Move to the timing, not the price.
- **"I need to ask my partner."** — Give them something concrete to take to that conversation.
- **"I am not sure it is worth it."** — Return to the goal they stated in discovery.

## Checklist
1. Objection repeated back before answering.
2. One answer given, then a confirming question.
3. Non-conversion reason logged honestly.`,
		stats: { assigned: 14, completed: 10, avgScore: null, avgRating: 4.4 },
	},
	{
		id: 'lms-c22',
		title: 'Practice: the early objection',
		summary: 'The customer objects before you have presented anything. Practise not defending too early.',
		format: 'SCENARIO',
		area: 'BUSINESS_INSIGHTS',
		subItem: 'EARLY_OBJECTION',
		impactMetricId: 'BI_EARLY_OBJECTION_RATE',
		durationMin: 15,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['role-play', 'objections'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		scenario: {
			situation:
				'Thirty seconds into an outbound call, before you have described anything, the customer says they are not interested and that it is too expensive.',
			steps: [
				{
					speaker: 'CUSTOMER',
					text: 'Whatever it is, I am not interested. It is always too expensive with you people anyway.',
				},
				{
					speaker: 'COACH',
					text: 'They objected to a price you never mentioned. Write your response without defending the price.',
				},
				{
					speaker: 'CUSTOMER',
					text: 'Well... what would it actually cost? I am paying 45 now and I am not paying more than that.',
				},
				{
					speaker: 'COACH',
					text: 'You now have a number and a constraint. Write how you use them before presenting anything.',
				},
			],
			selfCheck: [
				{
					id: 's1',
					prompt: 'What does an early objection usually mean?',
					options: [
						'A firm no',
						'A reflex, not a considered position',
						'The customer knows the price list',
						'The call should be ended',
					],
					correctIndex: 1,
					explanation: 'Early objections are reflexes; answering them as if final is what loses the call.',
				},
				{
					id: 's2',
					prompt: 'The worst response to an early price objection is…',
					options: [
						'Asking what they pay today',
						'Immediately defending or discounting the price',
						'Acknowledging and asking one question',
						'Naming the goal of the call in one sentence',
					],
					correctIndex: 1,
					explanation: 'Defending a price you never stated confirms the customer assumption.',
				},
				{
					id: 's3',
					prompt: 'Once the customer states a number and a limit, you should…',
					options: [
						'Present the cheapest option immediately',
						'Use the number as the comparison frame for what you present',
						'End the call as unqualified',
						'Escalate to a supervisor',
					],
					correctIndex: 1,
					explanation: 'Their number becomes the frame; presenting against it is what converts.',
				},
			],
		},
		stats: { assigned: 6, completed: 3, avgScore: 79, avgRating: 4.5 },
	},
	{
		id: 'lms-c23',
		title: 'Offer targeting check',
		summary: 'Four questions on matching the offer to the customer profile and the need you uncovered.',
		format: 'QUIZ',
		area: 'BUSINESS_INSIGHTS',
		subItem: 'MISTARGETED_OFFER',
		impactMetricId: 'BI_MISTARGETED_OFFER_RATE',
		durationMin: 8,
		level: 'INTERMEDIATE',
		status: 'PUBLISHED',
		tags: ['assessment', 'offers'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		passScore: 80,
		questions: [
			{
				id: 'q1',
				prompt: 'An offer is recorded as mis-targeted when…',
				options: [
					'The customer declines it',
					'It does not match the need or profile uncovered on the call',
					'It is more expensive than the current plan',
					'It is presented twice',
				],
				correctIndex: 1,
				explanation: 'Mis-targeting is about fit, not about the outcome of the call.',
			},
			{
				id: 'q2',
				prompt: 'Before presenting, you should be able to state…',
				options: [
					'The customer tenure',
					'The need, the constraint and why this offer fits',
					'The margin of the product',
					'The competitor price list',
				],
				correctIndex: 1,
				explanation: 'Need plus constraint plus fit is the minimum before any presentation.',
			},
			{
				id: 'q3',
				prompt: 'The customer says the decision depends on someone else. The best next step is…',
				options: [
					'Close anyway',
					'Give them a one-line summary they can take to that person',
					'Log it as not interested',
					'Offer a discount to decide now',
				],
				correctIndex: 1,
				explanation: 'Equipping the customer for the internal conversation is what recovers these calls.',
			},
			{
				id: 'q4',
				prompt: 'Why does logging the real non-conversion reason matter?',
				options: [
					'It is required for payroll',
					'It is what tells the business which offers are mis-targeted',
					'It shortens the wrap-up time',
					'It removes the call from QA sampling',
				],
				correctIndex: 1,
				explanation: 'The non-conversion reason is the signal the business uses to fix the offer mix.',
			},
		],
		stats: { assigned: 9, completed: 7, avgScore: 86, avgRating: 4.0 },
	},

	// ── General ─────────────────────────────────────────────────────────────────
	{
		id: 'lms-c24',
		title: 'Welcome to Quality at NewTech: how you are evaluated',
		summary: 'The four aspects we evaluate, who evaluates them and what happens with the result.',
		format: 'VIDEO',
		area: 'GENERAL',
		subItem: null,
		impactMetricId: null,
		durationMin: 15,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['onboarding'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		chapters: [
			{ title: 'The four aspects we evaluate', startSec: 0 },
			{ title: 'AI evaluation and manual calibration', startSec: 300 },
			{ title: 'What happens after a low score', startSec: 600 },
			{ title: 'Disputes, coaching and learning', startSec: 780 },
		],
		stats: { assigned: 21, completed: 21, avgScore: null, avgRating: 4.6 },
	},
	{
		id: 'lms-c25',
		title: 'Reading your evaluation report',
		summary: 'How to read your scorecard, what each error type means and how to file a dispute.',
		format: 'DOCUMENT',
		area: 'GENERAL',
		subItem: null,
		impactMetricId: null,
		durationMin: 7,
		level: 'BEGINNER',
		status: 'PUBLISHED',
		tags: ['onboarding', 'evaluations'],
		author: AUTHOR,
		publishedAt: PUBLISHED_AT,
		updatedAt: UPDATED_AT,
		body: `## Your scorecard in one page
Every evaluated call produces a score on four aspects. Your profile shows the monthly average of each one plus a weighted overall.

## What to look at first
- **The overall score and its trend** — a single month tells you little, three months tell you a lot.
- **The weakest aspect** — this is what coaching rules react to.
- **Failed items, not just the score** — the item text names the exact behaviour.
- **The error type** — critical errors weigh far more than non-critical ones.
- **Who evaluated it** — AI or manual; both can be disputed.

## If you disagree
1. Open the call and read the item that was failed.
2. File a dispute from the evaluation, quoting the moment in the call.
3. Your supervisor and the QA manager review it and the score is corrected if you are right.`,
		stats: { assigned: 21, completed: 19, avgScore: null, avgRating: 4.3 },
	},
	{
		id: 'lms-c26',
		title: 'Regulatory Disclosures 2025 (superseded)',
		summary: 'Archived: replaced by Regulatory Disclosures 2026. Kept for reference on calls audited before June.',
		format: 'DOCUMENT',
		area: 'COMPLIANCE',
		subItem: 'disclosureCompliance',
		impactMetricId: null,
		durationMin: 15,
		level: 'INTERMEDIATE',
		status: 'ARCHIVED',
		tags: ['disclosures', '2025', 'superseded'],
		author: AUTHOR,
		publishedAt: '2025-01-15',
		updatedAt: '2026-06-01',
		body: `> **Superseded.** This document describes the 2025 rules. Use *Regulatory Disclosures 2026* for any call after 1 June 2026.

## The 2025 disclosures
The recording disclosure had to be given within the first minute of the call, and the data-processing notice was part of the same wording.

## The disclosures and when they applied
- **Recording** — within the first minute of every call.
- **Contract terms** — before any offer was accepted.
- **Cancellation rights** — on every sale.
- **Third-party transfer** — before passing the customer to a partner service.

## Checklist (2025)
1. Recording disclosure within the first minute.
2. Cancellation window stated.
3. Customer confirmation captured verbally.`,
		stats: { assigned: 30, completed: 28, avgScore: null, avgRating: 3.8 },
	},
];

export const LMS_PATHS: LmsLearningPath[] = [
	{
		id: 'path-qa',
		title: 'QA Essentials',
		description: 'The four behaviours the evaluation form scores on every call, from the opening to the close.',
		area: 'QUALITY_ASSURANCE',
		level: 'BEGINNER',
		modules: [
			{ contentId: 'lms-c01', required: true },
			{ contentId: 'lms-c02', required: true },
			{ contentId: 'lms-c04', required: true },
			{ contentId: 'lms-c06', required: false },
			{ contentId: 'lms-c05', required: true },
		],
		estimatedMin: 55,
		status: 'PUBLISHED',
		badgeName: 'QA Foundations',
		enrolledCount: 14,
		completionRate: 64,
	},
	{
		id: 'path-compliance',
		title: 'Compliance Certification 2026',
		description: 'Disclosures, data protection, billing transparency and do-not-call, closing with the annual quiz.',
		area: 'COMPLIANCE',
		level: 'INTERMEDIATE',
		modules: [
			{ contentId: 'lms-c09', required: true },
			{ contentId: 'lms-c08', required: true },
			{ contentId: 'lms-c10', required: true },
			{ contentId: 'lms-c13', required: true },
			{ contentId: 'lms-c12', required: false },
			{ contentId: 'lms-c11', required: true },
		],
		estimatedMin: 81,
		status: 'PUBLISHED',
		badgeName: 'Compliance Guardian',
		enrolledCount: 17,
		completionRate: 47,
	},
	{
		id: 'path-sentiment',
		title: 'Emotional Intelligence on Calls',
		description: 'Listening, empathy and de-escalation for agents whose customer sentiment needs work.',
		area: 'SENTIMENT_EMOTION',
		level: 'INTERMEDIATE',
		modules: [
			{ contentId: 'lms-c14', required: true },
			{ contentId: 'lms-c16', required: true },
			{ contentId: 'lms-c15', required: true },
			{ contentId: 'lms-c17', required: false },
			{ contentId: 'lms-c18', required: true },
		],
		estimatedMin: 76,
		status: 'PUBLISHED',
		badgeName: 'Empathy Champion',
		enrolledCount: 11,
		completionRate: 55,
	},
	{
		id: 'path-business',
		title: 'Sales Conversations that Convert',
		description: 'Objections, competitor comparisons and offer targeting for agents on sales campaigns.',
		area: 'BUSINESS_INSIGHTS',
		level: 'INTERMEDIATE',
		modules: [
			{ contentId: 'lms-c21', required: true },
			{ contentId: 'lms-c20', required: true },
			{ contentId: 'lms-c22', required: false },
			{ contentId: 'lms-c23', required: true },
		],
		estimatedMin: 53,
		status: 'PUBLISHED',
		badgeName: 'Business Driver',
		enrolledCount: 8,
		completionRate: 38,
	},
	{
		id: 'path-onboarding',
		title: 'New Agent Onboarding',
		description: 'How quality works here, how to read your scorecard and the first behaviours to master.',
		area: 'GENERAL',
		level: 'BEGINNER',
		modules: [
			{ contentId: 'lms-c24', required: true },
			{ contentId: 'lms-c25', required: true },
			{ contentId: 'lms-c01', required: true },
			{ contentId: 'lms-c05', required: true },
		],
		estimatedMin: 44,
		status: 'PUBLISHED',
		badgeName: null,
		enrolledCount: 21,
		completionRate: 90,
	},
];
