import {
	ActionIcon,
	Badge,
	Group,
	Stack,
	Text,
	Title,
	Tooltip,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconEdit,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type {
	FormGroup,
	FormQuestion,
	FormQuestionErrorType,
} from '~/models/qa';
import classes from './GroupPanel.module.css';

export interface GroupPanelProps {
	group: FormGroup;
	questions: FormQuestion[];
	errorTypes: FormQuestionErrorType[];
	collapsed: boolean;
	onToggle: () => void;
	onAddQuestion: () => void;
	onEditGroup: () => void;
	onDeleteGroup: () => void;
	onEditQuestion: (question: FormQuestion) => void;
	onDeleteQuestion: (question: FormQuestion) => void;
}

export default function GroupPanel({
	group,
	questions,
	errorTypes,
	collapsed,
	onToggle,
	onAddQuestion,
	onEditGroup,
	onDeleteGroup,
	onEditQuestion,
	onDeleteQuestion,
}: GroupPanelProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<Stack className={classes.groupPanel} gap='sm'>
			<Group className={classes.groupPanelHeader} justify='space-between'>
				<button
					aria-expanded={!collapsed}
					className={classes.groupToggle}
					onClick={onToggle}
					type='button'
				>
					<ActionIcon
						aria-hidden='true'
						className={classes.groupToggleIcon}
						component='span'
						radius='md'
						variant='subtle'
					>
						{collapsed ? (
							<IconChevronRight size={16} />
						) : (
							<IconChevronDown size={16} />
						)}
					</ActionIcon>
					<Stack gap={2}>
						<Group gap='xs'>
							<Title order={3}>{group.name}</Title>
							<Badge color='blue' variant='light'>
								{t('groups.questionCount', {
									count: questions.length,
								})}
							</Badge>
						</Group>
						<Text c='dimmed' size='sm'>
							{group.description || t('groups.noDescription')}
						</Text>
					</Stack>
				</button>
				<Group gap='xs'>
					<Tooltip label={t('questions.add')}>
						<ActionIcon
							aria-label={t('questions.add')}
							onClick={onAddQuestion}
							radius='md'
							variant='light'
						>
							<IconPlus size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.edit')}>
						<ActionIcon
							aria-label={t('actions.edit')}
							onClick={onEditGroup}
							radius='md'
							variant='subtle'
						>
							<IconEdit size={16} />
						</ActionIcon>
					</Tooltip>
					<Tooltip label={t('actions.delete')}>
						<ActionIcon
							aria-label={t('actions.delete')}
							color='red'
							onClick={onDeleteGroup}
							radius='md'
							variant='subtle'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>

			{!collapsed ? (
				<>
					{questions.length === 0 ? (
						<Text c='dimmed' size='sm'>
							{t('questions.empty')}
						</Text>
					) : null}

					{questions.map((question) => {
						const errorType = errorTypes.find(
							(candidate) => candidate.id === question.errorTypeId
						);
						const errorTypeTooltip = errorType
							? errorType.isActive
								? errorType.label
								: t('errorTypes.badges.inactiveTooltip', {
										label: errorType.label,
									})
							: t('errorTypes.badges.unavailableTooltip');

						return (
							<Group
								className={classes.questionItem}
								justify='space-between'
								key={question.id}
								wrap='nowrap'
							>
								<Stack gap={4}>
									<Group gap='xs'>
										<Badge color='blue' variant='light'>
											{t(`answerTypes.${question.answerType.toLowerCase()}`)}
										</Badge>
										<Badge variant='outline'>
											{t('questions.weight', {
												weight: Number(question.weight),
											})}
										</Badge>
										{question.errorTypeId != null ? (
											<Tooltip label={errorTypeTooltip}>
												<Badge
													color={errorType?.isActive ? 'cyan' : 'gray'}
													variant='light'
												>
													{errorType?.code ??
														t('errorTypes.badges.unavailable')}
												</Badge>
											</Tooltip>
										) : null}
									</Group>
									<Text fw={700} size='sm'>
										{question.text}
									</Text>
									<Text c='dimmed' size='xs'>
										{question.description || t('questions.noDescription')}
									</Text>
								</Stack>
								<Group gap='xs' wrap='nowrap'>
									<Tooltip label={t('actions.edit')}>
										<ActionIcon
											aria-label={t('actions.edit')}
											onClick={() => onEditQuestion(question)}
											radius='md'
											variant='subtle'
										>
											<IconEdit size={16} />
										</ActionIcon>
									</Tooltip>
									<Tooltip label={t('actions.delete')}>
										<ActionIcon
											aria-label={t('actions.delete')}
											color='red'
											onClick={() => onDeleteQuestion(question)}
											radius='md'
											variant='subtle'
										>
											<IconTrash size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>
							</Group>
						);
					})}
				</>
			) : null}
		</Stack>
	);
}
