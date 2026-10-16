import {
	Box,
	Button,
	Group,
	Input,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconPlus, IconSettings, IconSpeakerphone } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { FORM_MODALITIES } from '~/modules/qa/forms/constants';
import { getFormCategories } from '~/modules/qa/forms/helpers';
import { MOCK_FORM_CATEGORIES } from '~/modules/qa/forms/mockData';
import type { BuilderForm, FormModality } from '~/modules/qa/forms/types';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useCampaignsStore } from '~/stores/qa/campaignsStore';
import {
	selectForms,
	selectPrimaryFormIds,
	useFormsStore,
} from '~/stores/qa/formsStore';
import type { Campaign } from '~/views/Campaigns/types';
import styles from './NewCampaignPage.module.css';

const CAMPAIGNS_LIST_PATH = '/qa/campaigns';

type CampaignStatusChoice = 'active' | 'inactive';

interface NewCampaignValues {
	name: string;
	/** A form category: sales, retention, ... */
	campaignType: string;
	status: CampaignStatusChoice;
	/** Empty until the user picks one. */
	modality: FormModality | '';
	formId: string;
}

const EMPTY_VALUES: NewCampaignValues = {
	name: '',
	campaignType: '',
	status: 'active',
	modality: '',
	formId: '',
};

export default function NewCampaignPage() {
	const { t } = useTranslation('qa.campaigns');
	const navigate = useNavigate();
	const forms = useFormsStore(selectForms);
	const primaryFormIds = useFormsStore(selectPrimaryFormIds);
	const form = useForm<NewCampaignValues>({
		initialValues: EMPTY_VALUES,
		validate: {
			name: (value) => (value.trim() ? null : t('validation.nameRequired')),
			campaignType: (value) =>
				value ? null : t('newCampaign.validation.typeRequired'),
			modality: (value) =>
				value ? null : t('newCampaign.validation.modalityRequired'),
			formId: (value) =>
				value ? null : t('newCampaign.validation.formRequired'),
		},
	});

	const categories = useMemo(
		() => getFormCategories(forms, MOCK_FORM_CATEGORIES),
		[forms]
	);

	/**
	 * Forms the campaign can be scored with: the default form of the modality
	 * first, then any other active form of that modality and campaign type.
	 */
	const formsFor = (
		modality: FormModality | '',
		campaignType: string
	): BuilderForm[] => {
		if (!modality) return [];
		const defaultForm = forms.find((f) => f.id === primaryFormIds[modality]);
		const type = campaignType.toLowerCase();
		const others = forms.filter(
			(f) =>
				f.id !== defaultForm?.id &&
				f.isActive &&
				f.modality === modality &&
				type !== '' &&
				f.category.toLowerCase() === type
		);
		return defaultForm ? [defaultForm, ...others] : others;
	};

	const { modality, campaignType, formId } = form.values;
	const formOptions = formsFor(modality, campaignType).map((f) => ({
		value: f.id,
		label:
			f.id === primaryFormIds[f.modality]
				? `${f.name} (${t('newCampaign.default')})`
				: f.name,
	}));

	const changeModality = (value: string) => {
		const next = value as FormModality;
		form.setFieldValue('modality', next);
		// Choosing a modality selects that modality's default form.
		form.setFieldValue('formId', primaryFormIds[next] ?? '');
		form.clearFieldError('modality');
		form.clearFieldError('formId');
	};

	const changeType = (value: string | null) => {
		const next = value ?? '';
		form.setFieldValue('campaignType', next);
		form.clearFieldError('campaignType');
		// A form that does not fit the new type falls back to the default one.
		if (modality && !formsFor(modality, next).some((f) => f.id === formId)) {
			form.setFieldValue('formId', primaryFormIds[modality] ?? '');
		}
	};

	const hint = !modality
		? undefined
		: campaignType
			? t('newCampaign.formHint', {
					modality: t(`newCampaign.modalities.${modality}`),
					type: campaignType,
				})
			: t('newCampaign.formHintNoType');

	const leave = () => navigate(CAMPAIGNS_LIST_PATH);

	const handleLeave = () => {
		if (!form.isDirty()) {
			leave();
			return;
		}
		modals.openConfirmModal({
			title: t('newCampaign.discard.title'),
			centered: true,
			children: <Text size='sm'>{t('newCampaign.discard.message')}</Text>,
			labels: {
				confirm: t('newCampaign.discard.confirm'),
				cancel: t('campaignForm.actions.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: leave,
		});
	};

	const createCampaign = (values: NewCampaignValues) => {
		const evaluationForm = forms.find((f) => f.id === values.formId);
		const modalityLabel = values.modality === 'COPC' ? 'COPC' : 'Standard';
		const campaign: Campaign = {
			id: String(Date.now()),
			name: values.name.trim(),
			description: [values.campaignType, modalityLabel, evaluationForm?.name]
				.filter(Boolean)
				.join(' · '),
			contactLists: 0,
			// The list only knows pending, active and paused.
			status: values.status === 'active' ? 'active' : 'paused',
			callsScored: 0,
			evaluationsCompleted: 0,
			evaluationType: 'automatic',
			createdAt: new Date().toISOString().slice(0, 10),
			type: 'external',
			campaignType: values.campaignType,
			modality: values.modality as FormModality,
			formId: values.formId,
		};
		useCampaignsStore.getState().addCampaign(campaign);
		notifySuccess(
			t('newCampaign.notifications.created', { name: campaign.name })
		);
		leave();
	};

	return (
		<ContentContainer
			contentWidth='full'
			description={t('newCampaign.description')}
			onBackClick={handleLeave}
			showBackButton
			title={t('newCampaign.title')}
		>
			<form onSubmit={form.onSubmit(createCampaign)}>
				<Stack gap='md' maw={720} mx='auto'>
					<SectionCard
						description={t('newCampaign.sections.details.description')}
						icon={IconSpeakerphone}
						padding='md'
						title={t('newCampaign.sections.details.title')}
					>
						<Stack gap='sm'>
							<TextInput
								data-autofocus
								label={t('campaignForm.fields.name')}
								placeholder={t('campaignForm.fields.namePlaceholder')}
								required
								size='sm'
								{...form.getInputProps('name')}
							/>
							<Select
								data={categories}
								error={form.errors.campaignType}
								label={t('newCampaign.fields.type')}
								maw={360}
								onChange={changeType}
								placeholder={t('newCampaign.fields.typePlaceholder')}
								required
								searchable
								size='sm'
								value={campaignType || null}
							/>
							<Input.Wrapper label={t('campaignForm.fields.status')}>
								<SegmentedControl
									data={[
										{ value: 'active', label: t('status.active') },
										{ value: 'inactive', label: t('status.inactive') },
									]}
									mt={4}
									size='sm'
									{...form.getInputProps('status')}
								/>
							</Input.Wrapper>
						</Stack>
					</SectionCard>

					<SectionCard
						description={t('newCampaign.sections.evaluation.description')}
						icon={IconSettings}
						padding='md'
						title={t('newCampaign.sections.evaluation.title')}
					>
						<Stack gap='sm'>
							<Input.Wrapper
								error={form.errors.modality}
								label={t('newCampaign.fields.modality')}
								required
							>
								<SegmentedControl
									data={FORM_MODALITIES.map((value) => ({
										value,
										label: t(`newCampaign.modalities.${value}`),
									}))}
									mt={4}
									onChange={changeModality}
									size='sm'
									value={modality}
								/>
							</Input.Wrapper>
							<Select
								allowDeselect={false}
								data={formOptions}
								description={hint}
								disabled={!modality}
								error={form.errors.formId}
								label={t('newCampaign.fields.form')}
								maw={480}
								onChange={(value) => {
									form.setFieldValue('formId', value ?? '');
									form.clearFieldError('formId');
								}}
								placeholder={
									modality
										? t('newCampaign.fields.formPlaceholder')
										: t('newCampaign.fields.formDisabled')
								}
								required
								size='sm'
								value={formId || null}
							/>
						</Stack>
					</SectionCard>

					{/* Pinned to the viewport so the actions stay in reach. */}
					<Box className={styles.stickyActions}>
						<Group gap='xs' justify='flex-end'>
							<Button onClick={handleLeave} variant='subtle'>
								{t('campaignForm.actions.cancel')}
							</Button>
							<Button leftSection={<IconPlus size={16} />} type='submit'>
								{t('campaignForm.actions.create')}
							</Button>
						</Group>
					</Box>
				</Stack>
			</form>
		</ContentContainer>
	);
}
