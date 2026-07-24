import { Button, Group, Select, Skeleton, Stack, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { CampaignDispositionModel } from '~/models/CampaignDispositionModel';
import {
	getDispositionParentPath,
	getGroupedDispositionOptions,
} from './ConversationDispositionEditor.helpers';
import classes from './ConversationDispositionEditor.module.css';

interface ConversationDispositionEditorProps {
	options: CampaignDispositionModel[];
	selectedDispositionId: string | null;
	isLoading: boolean;
	isError: boolean;
	isPending: boolean;
	loadErrorMessage: string;
	onChange: (selectedId: string | null) => void;
	onCancel: () => void;
	onSave: () => void;
	onRetry: () => void;
}

const ConversationDispositionEditor: React.FC<
	ConversationDispositionEditorProps
> = ({
	options,
	selectedDispositionId,
	isLoading,
	isError,
	isPending,
	loadErrorMessage,
	onChange,
	onCancel,
	onSave,
	onRetry,
}) => {
	const { t } = useTranslation('conversations');
	const canSave = options.some(
		(option) => String(option.id) === selectedDispositionId
	);
	const groupedOptions = useMemo(
		() =>
			getGroupedDispositionOptions(options, {
				effective: t('disposition.edit.groups.effective'),
				notEffective: t('disposition.edit.groups.notEffective'),
				noContact: t('disposition.edit.groups.noContact'),
				other: t('disposition.edit.groups.other'),
			}),
		[options, t]
	);

	return (
		<div className={classes.editor}>
			{isLoading ? (
				<Stack gap='xs' aria-label={t('disposition.edit.loading')}>
					<Skeleton height={12} width='38%' />
					<Skeleton height={36} />
				</Stack>
			) : isError ? (
				<div className={classes.message}>
					<Text size='sm' c='dimmed'>
						{loadErrorMessage}
					</Text>
					<Button
						variant='light'
						color='gray'
						size='xs'
						leftSection={<IconRefresh size={14} />}
						onClick={onRetry}
					>
						{t('disposition.retry')}
					</Button>
				</div>
			) : options.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('disposition.edit.empty')}
				</Text>
			) : (
				<Select
					label={t('disposition.edit.label')}
					description={t('disposition.edit.description')}
					placeholder={t('disposition.edit.placeholder')}
					data={groupedOptions}
					value={selectedDispositionId}
					onChange={onChange}
					searchable
					nothingFoundMessage={t('disposition.edit.noSearchResults')}
					allowDeselect={false}
					disabled={isPending}
					maxDropdownHeight={360}
					renderOption={({ option }) => {
						const disposition = options.find(
							(item) => String(item.id) === option.value
						);
						const parentPath = disposition
							? getDispositionParentPath(disposition)
							: null;

						return (
							<div className={classes.optionContent}>
								<Text size='sm' fw={600} className={classes.optionName}>
									{disposition?.name ?? option.label}
								</Text>
								{parentPath && (
									<Text size='xs' c='dimmed' className={classes.optionPath}>
										{parentPath}
									</Text>
								)}
							</div>
						);
					}}
					classNames={{
						dropdown: classes.dropdown,
						groupLabel: classes.groupLabel,
						option: classes.option,
					}}
					comboboxProps={{ withinPortal: true }}
				/>
			)}

			<Group gap='xs' justify='flex-end' className={classes.actions}>
				<Button
					variant='default'
					size='xs'
					onClick={onCancel}
					disabled={isPending}
				>
					{t('disposition.edit.cancel')}
				</Button>
				{!isLoading && !isError && options.length > 0 && (
					<Button
						size='xs'
						onClick={onSave}
						loading={isPending}
						disabled={!canSave}
					>
						{t('disposition.edit.save')}
					</Button>
				)}
			</Group>
		</div>
	);
};

export default ConversationDispositionEditor;
