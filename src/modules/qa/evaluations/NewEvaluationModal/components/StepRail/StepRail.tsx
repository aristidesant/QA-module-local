import { SegmentedControl, Text, UnstyledButton } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { EvaluatorType } from '~/models/qa';
import type { StepKey } from '../../NewEvaluationModal.types';
import classes from '../../NewEvaluationModal.module.css';

export interface StepRailProps {
	stepKeys: StepKey[];
	activeStep: number;
	stepValues: Record<StepKey, string | null>;
	stepComplete: Record<StepKey, boolean>;
	evaluationType: EvaluatorType;
	isAi: boolean;
	onTypeChange: (type: EvaluatorType) => void;
	onStepClick: (index: number) => void;
}

export default function StepRail({
	stepKeys,
	activeStep,
	stepValues,
	stepComplete,
	evaluationType,
	isAi,
	onTypeChange,
	onStepClick,
}: StepRailProps) {
	const { t } = useTranslation('qa.evaluations');

	return (
		<aside className={classes.rail}>
			<Text className={classes.railTitle} size='xs'>
				{t('modal.summary.title')}
			</Text>
			<SegmentedControl
				className={classes.segRoot}
				data={[
					{ label: t('modal.type.human'), value: 'HUMAN' },
					{ label: t('modal.type.ai'), value: 'AI' },
				]}
				fullWidth
				onChange={(value) => onTypeChange(value as EvaluatorType)}
				value={evaluationType}
			/>
			<Text c='dimmed' size='xs'>
				{t(isAi ? 'modal.type.aiHelper' : 'modal.type.humanHelper')}
			</Text>

			<div className={classes.steps}>
				{stepKeys.map((key, index) => {
					const isActive = index === activeStep;
					const done = stepComplete[key];
					const dotClass = done
						? `${classes.stepDot} ${classes.stepDotDone}`
						: isActive
							? `${classes.stepDot} ${classes.stepDotActive}`
							: classes.stepDot;

					return (
						<UnstyledButton
							className={
								isActive
									? `${classes.step} ${classes.stepActive}`
									: classes.step
							}
							key={key}
							onClick={() => onStepClick(index)}
						>
							<span className={dotClass}>
								{done ? <IconCheck size={15} /> : index + 1}
							</span>
							<span className={classes.stepText}>
								<Text fw={600} size='sm'>
									{t(`modal.steps.${key}`)}
								</Text>
								<Text
									c={stepValues[key] ? undefined : 'dimmed'}
									className={classes.stepValue}
									lineClamp={1}
									size='xs'
								>
									{stepValues[key] ?? t('modal.notSelected')}
								</Text>
							</span>
						</UnstyledButton>
					);
				})}
			</div>
		</aside>
	);
}
