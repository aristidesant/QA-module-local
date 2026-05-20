import { Alert, Select, Stack, Switch, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import styles from '../../CampaignPredefinedParamsForm.module.css';
import { isBackupBehavior } from '../../../utils/agentBehaviorHelpers';

export const GeneralSection: React.FC = () => {
	const { form, isEditMode, currentBehaviorId, allBehaviors } =
		useFormContext();
	const { t } = useTranslation('campaign-predefined-params');
	const backupOptions = allBehaviors
		.filter(
			(behavior) =>
				isBackupBehavior(behavior) && behavior.id !== currentBehaviorId
		)
		.map((behavior) => ({
			value: behavior.id,
			label: behavior.name,
		}));
	const isBackup = form.values.isBackup;

	return (
		<Stack className={styles.sectionStack}>
			<TextInput
				label={t('form.general.name.label')}
				placeholder={t('form.general.name.placeholder')}
				required
				{...form.getInputProps('name')}
				description={
					isEditMode
						? t('form.general.name.description.edit')
						: t('form.general.name.description.create')
				}
			/>
			<Switch
				label={t('form.general.backup.isBackup.label')}
				description={t('form.general.backup.isBackup.description')}
				checked={isBackup}
				onChange={(event) => {
					const checked = event.currentTarget.checked;
					form.setFieldValue('isBackup', checked);
					if (checked) {
						form.setFieldValue('backupBehaviorId', null);
					}
				}}
			/>
			{isBackup ? (
				<Alert color='blue' variant='light'>
					{t('form.general.backup.backupModeNotice')}
				</Alert>
			) : (
				<Select
					label={t('form.general.backup.selector.label')}
					description={t('form.general.backup.selector.description')}
					placeholder={t('form.general.backup.selector.placeholder')}
					data={backupOptions}
					searchable
					clearable
					disabled={backupOptions.length === 0}
					nothingFoundMessage={t('form.general.backup.selector.empty')}
					{...form.getInputProps('backupBehaviorId')}
				/>
			)}
		</Stack>
	);
};

export default GeneralSection;
