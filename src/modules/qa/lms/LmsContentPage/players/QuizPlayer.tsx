import { useState } from 'react';
import { Alert, Badge, Button, Group, Paper, Radio, Stack, Stepper, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsQuizQuestion } from '~/models/qa';

interface QuizPlayerProps {
	questions: LmsQuizQuestion[];
	passScore: number;
	readOnly: boolean;
	onComplete: (score: number) => void;
}

export function QuizPlayer({ questions, passScore, readOnly, onComplete }: QuizPlayerProps) {
	const { t } = useTranslation('qa.lms');
	const [step, setStep] = useState(0);
	const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
	const [submitted, setSubmitted] = useState(false);

	const answered = answers.every((a) => a !== null);
	const correct = answers.filter((a, i) => a === questions[i].correctIndex).length;
	const score = Math.round((correct / questions.length) * 100);
	const passed = score >= passScore;

	const handleSubmit = () => {
		setSubmitted(true);
		if (score >= passScore) onComplete(score);
	};

	const handleRetry = () => {
		setAnswers(questions.map(() => null));
		setStep(0);
		setSubmitted(false);
	};

	if (submitted) {
		return (
			<Stack gap='md'>
				<Alert color={passed ? 'green' : 'red'} variant='light' title={passed ? t('player.quiz.passed', { score }) : t('player.quiz.failed', { score, pass: passScore })}>
					<Text size='sm'>{t('player.quiz.passScore', { value: passScore })}</Text>
				</Alert>

				<Stack gap='sm'>
					{questions.map((q, i) => {
						const ok = answers[i] === q.correctIndex;
						return (
							<Paper key={q.id} withBorder p='sm' radius='md'>
								<Group gap='xs' align='flex-start' wrap='nowrap'>
									<ThemeIcon size='sm' radius='xl' color={ok ? 'green' : 'red'} variant='light'>
										{ok ? <IconCheck size={14} /> : <IconX size={14} />}
									</ThemeIcon>
									<Stack gap={4} flex={1}>
										<Text size='sm' fw={500}>
											{q.prompt}
										</Text>
										<Text size='xs' c='dimmed'>
											{t('player.quiz.yourAnswer')}: {answers[i] !== null ? q.options[answers[i] as number] : '—'}
										</Text>
										{!ok && (
											<Text size='xs' c='green'>
												{t('player.quiz.correctAnswer')}: {q.options[q.correctIndex]}
											</Text>
										)}
										<Text size='xs' c='dimmed'>
											<strong>{t('player.quiz.explanation')}:</strong> {q.explanation}
										</Text>
									</Stack>
								</Group>
							</Paper>
						);
					})}
				</Stack>

				{!passed && !readOnly && (
					<Group justify='flex-end'>
						<Button onClick={handleRetry}>{t('player.quiz.retry')}</Button>
					</Group>
				)}
			</Stack>
		);
	}

	const question = questions[step];

	return (
		<Stack gap='md'>
			<Group justify='space-between'>
				<Text size='sm' c='dimmed'>
					{t('player.quiz.question', { n: step + 1, total: questions.length })}
				</Text>
				<Badge variant='light'>{t('player.quiz.passScore', { value: passScore })}</Badge>
			</Group>

			<Stepper active={step} onStepClick={setStep} size='xs' iconSize={22}>
				{questions.map((q, i) => (
					<Stepper.Step key={q.id} label={`${i + 1}`} />
				))}
			</Stepper>

			<Paper withBorder p='md' radius='md'>
				<Radio.Group
					label={question.prompt}
					value={answers[step] === null ? null : String(answers[step])}
					onChange={(v) =>
						setAnswers((prev) => prev.map((a, i) => (i === step ? Number(v) : a)))
					}
				>
					<Stack gap='sm' mt='sm'>
						{question.options.map((opt, i) => (
							<Radio key={opt} value={String(i)} label={opt} />
						))}
					</Stack>
				</Radio.Group>
			</Paper>

			<Group justify='space-between'>
				<Button variant='default' disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
					{t('player.quiz.previous')}
				</Button>
				{step < questions.length - 1 ? (
					<Button onClick={() => setStep((s) => s + 1)} disabled={answers[step] === null}>
						{t('player.quiz.next')}
					</Button>
				) : (
					<Button onClick={handleSubmit} disabled={!answered}>
						{t('player.quiz.submit')}
					</Button>
				)}
			</Group>
		</Stack>
	);
}
