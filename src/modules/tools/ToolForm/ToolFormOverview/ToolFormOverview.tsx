import { Badge, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import type { Section, SectionId, SectionMetaMap } from '../toolForm.types';
import { getSectionProgress } from '../toolForm.utils';
import styles from '../ToolForm.module.css';

interface ToolFormOverviewProps {
	sections: Section[];
	sectionMeta: SectionMetaMap;
	activeSection: SectionId;
	nextSection: SectionId | null;
	remainingRequiredSections: number;
	t: (key: string, options?: Record<string, unknown>) => string;
}

export default function ToolFormOverview({
	sections,
	sectionMeta,
	activeSection,
	nextSection,
	remainingRequiredSections,
	t,
}: ToolFormOverviewProps) {
	const progress = getSectionProgress(sections, sectionMeta);
	const progressValue =
		progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;
	const isComplete = progress.completed === progress.total;
	const currentSection = sections.find(
		(section) => section.id === activeSection
	);
	const nextSectionLabel = sections.find(
		(section) => section.id === nextSection
	)?.label;

	return (
		<Paper withBorder radius='lg' p='sm' className={styles.overviewShell}>
			<div className={styles.overviewGrid}>
				<Stack gap={4} className={styles.overviewText}>
					<Group gap='xs' align='center' wrap='wrap'>
						<Text
							size='xs'
							fw={700}
							tt='uppercase'
							c='dimmed'
							className={styles.overviewEyebrow}
						>
							{t('form.overview.title')}
						</Text>
						<Badge
							size='xs'
							variant='light'
							radius='sm'
							color={isComplete ? 'green' : 'blue'}
						>
							{t('form.overview.progressLabel', {
								completed: progress.completed,
								total: progress.total,
							})}
						</Badge>
					</Group>
					<Text size='sm' fw={700} className={styles.overviewTitle}>
						{isComplete
							? t('form.overview.complete')
							: t('form.overview.stepsComplete', {
									completed: progress.completed,
									total: progress.total,
								})}
					</Text>
					<Text size='xs' c='dimmed' className={styles.overviewSubtext}>
						{isComplete
							? t('form.overview.readyToSave')
							: nextSectionLabel
								? t('form.overview.nextStep', { section: nextSectionLabel })
								: t('form.overview.currentStep', {
										section: currentSection?.label ?? '',
									})}
					</Text>
				</Stack>
				<div className={styles.overviewProgress}>
					<Progress
						value={progressValue}
						size='md'
						radius='xl'
						className={styles.overviewBar}
					/>
				</div>
				<div className={styles.overviewAside}>
					<Text
						size='xs'
						fw={700}
						c={remainingRequiredSections > 0 ? 'orange.7' : 'green.7'}
					>
						{remainingRequiredSections > 0
							? t('form.overview.requiredRemaining', {
									count: remainingRequiredSections,
								})
							: t('form.overview.requiredDone')}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('form.overview.currentStep', {
							section: currentSection?.label ?? '',
						})}
					</Text>
				</div>
			</div>
		</Paper>
	);
}
