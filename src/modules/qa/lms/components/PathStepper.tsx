import { Badge, Group, Stepper, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsContent, LmsLearningPath, LmsPathEnrollment } from '~/models/qa';
import { LMS_FORMAT_META } from '../constants';
import pointerStyles from './Cards.module.css';

interface PathStepperProps {
	path: LmsLearningPath;
	enrollment?: LmsPathEnrollment;
	contentById: Record<string, LmsContent>;
	onOpenModule?: (contentId: string) => void;
}

export function PathStepper({ path, enrollment, contentById, onOpenModule }: PathStepperProps) {
	const { t } = useTranslation('qa.lms');
	const completed = enrollment?.completedContentIds ?? [];
	const activeIndex = path.modules.findIndex((m) => !completed.includes(m.contentId));

	return (
		<Stepper
			orientation='vertical'
			active={activeIndex === -1 ? path.modules.length : activeIndex}
			size='sm'
			iconSize={30}
			allowNextStepsSelect={false}
		>
			{path.modules.map((module) => {
				const content = contentById[module.contentId];
				if (!content) return null;
				const Icon = LMS_FORMAT_META[content.format].icon;
				return (
					<Stepper.Step
						key={module.contentId}
						icon={<Icon size={16} />}
						completedIcon={<Icon size={16} />}
						label={
							<Text
								size='sm'
								fw={500}
								className={onOpenModule ? pointerStyles.pointer : undefined}
								onClick={onOpenModule ? () => onOpenModule(module.contentId) : undefined}
							>
								{content.title}
							</Text>
						}
						description={
							<Group gap='xs'>
								<Text size='xs' c='dimmed'>
									{t(`formats.${content.format}`)} · {t('common.minutes', { count: content.durationMin })}
								</Text>
								<Badge size='xs' variant='outline' color={module.required ? 'red' : 'gray'}>
									{module.required ? t('agent.paths.required') : t('agent.paths.optional')}
								</Badge>
							</Group>
						}
					/>
				);
			})}
		</Stepper>
	);
}
