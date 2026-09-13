import { useState } from 'react';
import { Blockquote, Button, Group, Paper, Stack, Text, Textarea, Timeline } from '@mantine/core';
import { IconMasksTheater, IconMessage, IconSchool } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsContent } from '~/models/qa';
import { QuizPlayer } from './QuizPlayer';
import classes from './Players.module.css';

interface ScenarioPlayerProps {
	content: LmsContent;
	readOnly: boolean;
	onComplete: (score: number) => void;
}

export function ScenarioPlayer({ content, readOnly, onComplete }: ScenarioPlayerProps) {
	const { t } = useTranslation('qa.lms');
	const scenario = content.scenario;
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string>>({});
	const [inSelfCheck, setInSelfCheck] = useState(false);

	if (!scenario) return null;

	const coachSteps = scenario.steps
		.map((s, i) => ({ ...s, index: i }))
		.filter((s) => s.speaker === 'COACH');
	const visibleSteps = scenario.steps.slice(0, step + 1);
	const currentStep = scenario.steps[step];
	const isCoachStep = currentStep?.speaker === 'COACH';
	const canContinue = !isCoachStep || (answers[step]?.trim().length ?? 0) >= 20;
	const isLastStep = step === scenario.steps.length - 1;

	if (inSelfCheck) {
		return (
			<Stack gap='md'>
				<Text size='sm' fw={600}>
					{t('player.scenario.selfCheck')}
				</Text>
				<QuizPlayer
					questions={scenario.selfCheck}
					passScore={60}
					readOnly={readOnly}
					onComplete={onComplete}
				/>
			</Stack>
		);
	}

	return (
		<Stack gap='md'>
			<Blockquote color='pink' icon={<IconMasksTheater size={20} />} p='md'>
				<Text size='xs' c='dimmed' tt='uppercase' fw={600} mb={4}>
					{t('player.scenario.situation')}
				</Text>
				<Text size='sm'>{scenario.situation}</Text>
			</Blockquote>

			<Timeline active={step} bulletSize={24} lineWidth={2}>
				{visibleSteps.map((s, i) => (
					<Timeline.Item
						key={`${s.speaker}-${i}`}
						bullet={s.speaker === 'CUSTOMER' ? <IconMessage size={12} /> : <IconSchool size={12} />}
						title={
							<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
								{s.speaker === 'CUSTOMER' ? t('player.scenario.customerSays') : t('player.scenario.coachAsks')}
							</Text>
						}
					>
						<Paper
							p='sm'
							radius='md'
							className={s.speaker === 'CUSTOMER' ? classes.bubbleCustomer : classes.bubbleCoach}
						>
							<Text size='sm'>{s.text}</Text>
						</Paper>

						{s.speaker === 'COACH' && (
							<Textarea
								mt='xs'
								label={t('player.scenario.yourAnswer')}
								placeholder={t('player.scenario.answerPlaceholder')}
								autosize
								minRows={2}
								value={answers[i] ?? ''}
								onChange={(e) => setAnswers((prev) => ({ ...prev, [i]: e.currentTarget.value }))}
							/>
						)}
					</Timeline.Item>
				))}
			</Timeline>

			<Group justify='space-between'>
				<Text size='xs' c='dimmed'>
					{coachSteps.length > 0 &&
						`${Object.values(answers).filter((a) => a.trim().length >= 20).length} / ${coachSteps.length}`}
				</Text>
				{isLastStep ? (
					<Button onClick={() => setInSelfCheck(true)} disabled={!canContinue}>
						{t('player.scenario.finish')}
					</Button>
				) : (
					<Button onClick={() => setStep((s) => s + 1)} disabled={!canContinue}>
						{t('player.scenario.continue')}
					</Button>
				)}
			</Group>
		</Stack>
	);
}
