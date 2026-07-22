import {
	Alert,
	Badge,
	Button,
	Group,
	Radio,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconGitBranch,
	IconSend,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppDrawer from '~/components/AppDrawer';
import type {
	CreateEvaluationDisputePayload,
	EvaluationDetail,
	EvaluationQuestion,
} from '~/models/qa';
import { answerValueToText } from '~/modules/qa/utils/evaluationAnswers';
import { notifyError, notifyWarning } from '~/modules/qa/utils/notifications';
import classes from './DisputeDrawer.module.css';

type DraftAnswers = Record<number, string>;

interface DisputeDrawerProps {
	detail: EvaluationDetail;
	loading: boolean;
	opened: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateEvaluationDisputePayload) => Promise<void>;
}

function getQuestionAnswerText(question: EvaluationQuestion) {
	return question.answerType === 'CHOICE'
		? (question.answer?.selectedLabel ?? '')
		: answerValueToText(question.answer?.answerValue);
}

export default function DisputeDrawer({
	detail,
	loading,
	opened,
	onClose,
	onSubmit,
}: DisputeDrawerProps) {
	const { t } = useTranslation('qa.evaluations');
	const questions = useMemo(
		() => detail.groups.flatMap((group) => group.questions),
		[detail.groups]
	);
	const [reason, setReason] = useState('');
	const [draftAnswers, setDraftAnswers] = useState<DraftAnswers>({});

	useEffect(() => {
		if (!opened) {
			return;
		}

		const nextDrafts: DraftAnswers = {};
		for (const question of questions) {
			nextDrafts[question.id] = getQuestionAnswerText(question);
		}

		setDraftAnswers(nextDrafts);
		setReason('');
	}, [opened, questions]);

	const changedQuestions = questions.filter((question) => {
		const original = getQuestionAnswerText(question).trim();
		const next = (draftAnswers[question.id] ?? '').trim();

		return original !== next;
	});
	const canSubmit = reason.trim().length > 0 && changedQuestions.length > 0;

	const submit = async () => {
		if (!canSubmit) {
			notifyWarning(t('disputes.form.validation'));
			return;
		}

		try {
			await onSubmit({
				reason: reason.trim(),
				answers: changedQuestions.map((question) => {
					const value = draftAnswers[question.id]?.trim() ?? '';

					return question.answerType === 'CHOICE'
						? {
								evaluationQuestionId: question.id,
								selectedLabel: value,
							}
						: {
								evaluationQuestionId: question.id,
								answerValue: { text: value },
							};
				}),
			});
		} catch (error) {
			notifyError(error);
		}
	};

	return (
		<AppDrawer
			classNames={{ body: classes.drawerBody }}
			onClose={onClose}
			opened={opened}
			position='right'
			size='xl'
			title={t('disputes.form.title', { id: detail.id })}
		>
			<Stack gap='md'>
				<Alert
					color='blue'
					icon={<IconGitBranch size={16} />}
					title={t('disputes.form.versionTitle', {
						version: detail.version ?? 1,
					})}
					variant='light'
				>
					{t('disputes.form.versionDescription')}
				</Alert>

				<Textarea
					autosize
					label={t('disputes.form.reason')}
					minRows={3}
					onChange={(event) => setReason(event.currentTarget.value)}
					placeholder={t('disputes.form.reasonPlaceholder')}
					required
					size='sm'
					value={reason}
				/>

				<Group className={classes.summaryBar} justify='space-between'>
					<Text fw={700} size='sm'>
						{t('disputes.form.changedCount', {
							count: changedQuestions.length,
						})}
					</Text>
					<Badge color={canSubmit ? 'green' : 'gray'} variant='light'>
						{canSubmit ? t('disputes.form.ready') : t('disputes.form.pending')}
					</Badge>
				</Group>

				<Stack gap='sm'>
					{questions.map((question) => {
						const isChanged = changedQuestions.some(
							(changed) => changed.id === question.id
						);

						return (
							<Stack
								className={[
									classes.questionCard,
									isChanged ? classes.questionCardChanged : undefined,
								]
									.filter(Boolean)
									.join(' ')}
								gap='sm'
								key={question.id}
							>
								<Group justify='space-between'>
									<Stack gap={4}>
										<Group gap='xs'>
											<Badge color='blue' variant='light'>
												{t(`answerTypes.${question.answerType.toLowerCase()}`)}
											</Badge>
											<Badge variant='outline'>
												{t('detail.weight', {
													weight: Number(question.weight),
												})}
											</Badge>
										</Group>
										<Text fw={700} size='sm'>
											{question.text}
										</Text>
										{question.description ? (
											<Text c='dimmed' size='xs'>
												{question.description}
											</Text>
										) : null}
									</Stack>
									{isChanged ? (
										<Badge color='green' variant='light'>
											{t('disputes.form.changed')}
										</Badge>
									) : null}
								</Group>

								{question.answerType === 'CHOICE' ? (
									<Radio.Group
										onChange={(value) =>
											setDraftAnswers((current) => ({
												...current,
												[question.id]: value,
											}))
										}
										value={draftAnswers[question.id] ?? ''}
									>
										<Stack gap='xs'>
											{(question.options ?? []).map((option) => (
												<Radio
													key={option.label}
													label={t('answer.optionLabel', {
														label: option.label,
														score: option.score,
													})}
													size='sm'
													value={option.label}
												/>
											))}
										</Stack>
									</Radio.Group>
								) : (
									<Textarea
										autosize
										minRows={3}
										onChange={(event) => {
											const value = event.currentTarget.value;

											setDraftAnswers((current) => ({
												...current,
												[question.id]: value,
											}));
										}}
										placeholder={t('answer.textPlaceholder')}
										size='sm'
										value={draftAnswers[question.id] ?? ''}
									/>
								)}
							</Stack>
						);
					})}
				</Stack>

				{!canSubmit ? (
					<Alert
						color='yellow'
						icon={<IconAlertTriangle size={16} />}
						variant='light'
					>
						{t('disputes.form.validation')}
					</Alert>
				) : null}

				<Group justify='flex-end'>
					<Button onClick={onClose} size='sm' variant='subtle'>
						{t('disputes.form.cancel')}
					</Button>
					<Button
						disabled={!canSubmit}
						leftSection={<IconSend size={16} />}
						loading={loading}
						onClick={() => void submit()}
						size='sm'
					>
						{t('disputes.form.submit')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}
