// AIPersonalityEditModal.tsx
import React, { useMemo, useState } from 'react';
import {
	Textarea,
	Button,
	Paper,
	Group,
	Title,
	Text,
	Divider,
	ScrollArea,
	Box,
	ActionIcon,
	Badge,
	Flex,
	CopyButton,
	Tooltip,
	Progress,
} from '@mantine/core';
import {
	IconDeviceFloppy,
	IconX,
	IconArrowBackUp,
	IconCheck,
	IconCopy,
} from '@tabler/icons-react';
import PromptTemplateSelect from '~/components/PromptTemplateSelect/PromptTemplateSelect';
import { useGetAllPrompts } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import styles from './AIPersonalityEditModal.module.css';

interface AIPersonalityEditModalProps {
	initialPrompt: string;
	onClose: () => void;
	onSave: (prompt: string) => void;
}

const promptBlueprint = [
	'# Persona',
	'- Introduce yourself in a warm, confident manner.',
	'- Highlight core mission and expertise boundaries.',
	'',
	'# Tone & Style',
	'- Voice: professional, empathetic, energetic.',
	'- Formatting: concise paragraphs with actionable bullets.',
	'',
	'# Knowledge Scope',
	'- Ground answers on verified product and policy data.',
	'- Escalate unknowns and never fabricate commitments.',
	'',
	'# Playbook',
	'- Always acknowledge context before answering.',
	'- Offer next steps or resources in every reply.',
	'',
	'# Guardrails',
	'- Decline misinformation, legal, or medical advice.',
	'- Route emergencies to human specialists immediately.',
].join('\n');

// structurePrompts removed — suggested building blocks panel was removed from the UI

const AIPersonalityEditModal: React.FC<AIPersonalityEditModalProps> = ({
	initialPrompt,
	onClose,
	onSave,
}) => {
	const [prompt, setPrompt] = useState<string>(initialPrompt);
	const [draft, setDraft] = useState<string>(initialPrompt);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null
	);

	// Fetch all prompt templates
	const { data: prompts } = useGetAllPrompts();

	// Handle template selection
	const handleTemplateChange = (value: string | null) => {
		setSelectedTemplateId(value);
		if (!value) return;
		const template = prompts?.find((item) => item.id === Number(value));
		if (template?.generatedPrompt) {
			setDraft(template.generatedPrompt);
		}
	};

	const handleCancel = () => {
		setDraft(prompt);
		onClose();
	};

	const handleSave = () => {
		setPrompt(draft);
		onSave(draft);
		onClose();
	};

	const handleReset = () => {
		setDraft(prompt);
		setSelectedTemplateId(null);
	};

	const handleInsertBlueprint = () => {
		setDraft((current) => {
			if (!current.trim()) {
				return promptBlueprint;
			}
			return `${current.trim()}\n\n${promptBlueprint}`;
		});
	};

	const selectedTemplateName = useMemo(() => {
		if (!selectedTemplateId) return null;
		const template = prompts?.find(
			(item) => item.id === Number(selectedTemplateId)
		);
		return template?.name || null;
	}, [prompts, selectedTemplateId]);

	const characterCount = draft.length;
	const wordCount = useMemo(() => {
		return draft.trim() ? draft.trim().split(/\s+/).length : 0;
	}, [draft]);

	const estimatedReadTime = useMemo(() => {
		if (wordCount === 0) return '0s';
		const minutes = wordCount / 180;
		if (minutes < 1) {
			return `${Math.ceil(minutes * 60)}s`;
		}
		return `${minutes < 2 ? 1 : Math.round(minutes)} min`;
	}, [wordCount]);

	const sectionCount = useMemo(() => {
		if (!draft.trim()) return 0;
		return draft
			.trim()
			.split(/\n{2,}/)
			.filter((block) => block.trim().length > 0).length;
	}, [draft]);

	const recommendedCharacterTarget = 1800;
	const lengthProgress = useMemo(() => {
		if (characterCount === 0) return 0;
		return Math.min(
			100,
			Math.round((characterCount / recommendedCharacterTarget) * 100)
		);
	}, [characterCount, recommendedCharacterTarget]);

	const lengthStatus = useMemo(() => {
		if (characterCount === 0) {
			return 'Start drafting to unlock tailored insights.';
		}
		if (characterCount < 900) {
			return 'Add richer context so the agent can anticipate edge cases.';
		}
		if (characterCount < recommendedCharacterTarget) {
			return 'Strong draft — expand sections for nuanced guardrails.';
		}
		if (characterCount > recommendedCharacterTarget * 1.4) {
			return 'Consider trimming repetitive guidance to keep output focused.';
		}
		return 'Balanced coverage — ideal for reliable agent behavior.';
	}, [characterCount, recommendedCharacterTarget]);

	const isDirty = draft !== prompt;
	const isEmpty = draft.trim().length === 0;

	const metrics = useMemo(
		() => [
			{ label: 'Words', value: wordCount.toLocaleString() },
			{ label: 'Characters', value: characterCount.toLocaleString() },
			{ label: 'Sections', value: sectionCount.toString() },
			{ label: 'Read time', value: estimatedReadTime },
		],
		[wordCount, characterCount, sectionCount, estimatedReadTime]
	);

	const editorStatusText = useMemo(() => {
		if (isEmpty) {
			return 'Introduce persona, tone, and guardrails to unlock insights.';
		}
		return isDirty
			? 'Draft has unsaved changes. Refine each section before saving.'
			: 'Everything is saved. Iterate on nuance whenever you need.';
	}, [isDirty, isEmpty]);

	return (
		<Paper radius='lg' className={styles.modalShell} withBorder>
			<Flex direction='column' className={styles.modalContent}>
				<div className={styles.header}>
					<div className={styles.headerCopy}>
						<Title order={2} className={styles.title}>
							AI personality studio
						</Title>
						<Text size='sm' className={styles.subtitle}>
							Compose an agent brief that captures persona, tone, compliance,
							and escalation playbooks. Everything updates instantly across the
							studio.
						</Text>
						<Group gap='xs' className={styles.statusRow}>
							{selectedTemplateName && (
								<Badge
									size='sm'
									color='gray'
									variant='light'
									className={styles.statusBadge}
								>
									Template · {selectedTemplateName}
								</Badge>
							)}
							<Badge
								size='sm'
								color={isDirty ? 'yellow' : 'teal'}
								variant='light'
								className={styles.statusBadge}
							>
								{isDirty ? 'Unsaved draft' : 'All changes saved'}
							</Badge>
							<Badge
								size='sm'
								color={sectionCount >= 4 ? 'blue' : 'gray'}
								variant='light'
								className={styles.statusBadge}
							>
								{sectionCount >= 4
									? 'Structure in place'
									: 'Add more structure'}
							</Badge>
						</Group>
					</div>
					<Group gap='xs'>
						<CopyButton value={draft} timeout={1500}>
							{({ copied, copy }) => (
								<Tooltip
									label={copied ? 'Copied!' : 'Copy prompt'}
									withArrow
									position='bottom'
								>
									<ActionIcon
										variant='subtle'
										color={copied ? 'teal' : 'gray'}
										size='lg'
										onClick={copy}
										aria-label='Copy prompt to clipboard'
									>
										{copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
									</ActionIcon>
								</Tooltip>
							)}
						</CopyButton>
						<ActionIcon
							variant='subtle'
							color='gray'
							onClick={onClose}
							size='lg'
							aria-label='Close editor'
						>
							<IconX size={18} />
						</ActionIcon>
					</Group>
				</div>

				<Divider className={styles.sectionDivider} />

				<div className={styles.canvas}>
					<aside
						className={styles.sidebar}
						aria-label='Prompt toolkit and insights'
					>
						<Paper withBorder radius='md' className={styles.sidebarCard}>
							<PromptTemplateSelect
								value={selectedTemplateId}
								withPreview={false}
								onChange={handleTemplateChange}
								description='Choosing a template replaces the current draft content.'
								clearable
								searchable
								size='sm'
								className={styles.compactTemplateSelect}
							/>
							<Button
								variant='light'
								color='gray'
								size='xs'
								onClick={handleInsertBlueprint}
								className={styles.outlineButton}
							>
								Insert guided outline
							</Button>
						</Paper>

						<Paper withBorder radius='md' className={styles.sidebarCard}>
							<Text className={styles.sidebarHeading}>Metrics</Text>
							<Text size='xs' className={styles.sidebarCopy}>
								Quick draft statistics for the current prompt.
							</Text>
							<div className={styles.metricsGrid}>
								{metrics.map((metric) => (
									<div key={metric.label} className={styles.statItemSidebar}>
										<Text size='xs' className={styles.statLabel}>
											{metric.label}
										</Text>
										<Text className={styles.statValue}>{metric.value}</Text>
									</div>
								))}
							</div>
						</Paper>

						<Paper withBorder radius='md' className={styles.sidebarCard}>
							<Text className={styles.sidebarHeading}>Prompt health</Text>
							<Progress
								value={lengthProgress}
								size='sm'
								className={styles.lengthProgress}
							/>
							<Text size='xs' className={styles.progressLabel}>
								{lengthStatus}
							</Text>
							<Text size='xs' className={styles.progressMeta}>
								Target length ≈ {recommendedCharacterTarget.toLocaleString()}{' '}
								characters
							</Text>
						</Paper>

						<Paper withBorder radius='md' className={styles.sidebarCard}>
							<Text className={styles.sidebarHeading}>Quality checklist</Text>
							<ul className={styles.tipsList}>
								<li>
									Lead each section with strong directives and sample phrasing.
								</li>
								<li>
									Pair every guardrail with escalation guidance so agents know
									the next move.
								</li>
								<li>
									Include fallback language for missing data or sensitive
									requests.
								</li>
								<li>
									Close with reminders about taboo topics and compliance
									policies.
								</li>
							</ul>
						</Paper>
					</aside>
					<section className={styles.editorStage} aria-label='Prompt editor'>
						<Paper withBorder radius='md' className={styles.editorSurface}>
							<div className={styles.editorHeader}>
								<Text size='xs' className={styles.editorStatus}>
									{editorStatusText}
								</Text>
							</div>
							<Divider className={styles.surfaceDivider} />
							<Box className={styles.editorWrapper}>
								<ScrollArea scrollbarSize={8} className={styles.editorScroll}>
									<Textarea
										label='Agent brief'
										placeholder='Lay out persona, tone, rules of engagement, escalation paths, and safety guardrails.'
										value={draft}
										onChange={(event) => setDraft(event.currentTarget.value)}
										className={styles.promptTextarea}
										description='Keep sections concise with action-led directives. Use lists for playbooks and guardrails.'
										autosize
										minRows={12}
										maxRows={24}
										autoFocus
									/>
								</ScrollArea>
							</Box>
						</Paper>
						<Text size='xs' className={styles.editorHint}>
							Pro tip: lead each section with a verb so the agent understands
							intent (e.g., "Adopt", "Avoid", "Offer").
						</Text>
					</section>
				</div>

				<Divider className={styles.sectionDivider} />

				<Group justify='space-between' className={styles.footer}>
					<Group gap='xs'>
						<Button
							variant='subtle'
							color='gray'
							onClick={handleReset}
							leftSection={<IconArrowBackUp size={16} />}
							disabled={!isDirty}
						>
							Reset to original
						</Button>
					</Group>
					<Group gap='sm'>
						<Button variant='default' onClick={handleCancel}>
							Discard & close
						</Button>
						<Button
							leftSection={<IconDeviceFloppy size={16} />}
							onClick={handleSave}
							disabled={!draft.trim()}
						>
							Save prompt
						</Button>
					</Group>
				</Group>
			</Flex>
		</Paper>
	);
};

export default AIPersonalityEditModal;
