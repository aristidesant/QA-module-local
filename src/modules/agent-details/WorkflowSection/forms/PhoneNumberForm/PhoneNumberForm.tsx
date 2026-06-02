import {
	ActionIcon,
	Box,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
	Select,
} from '@mantine/core';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import { IconPhone, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	PhoneNumberTransferNode,
} from '~/models/AgentWorkflowModel';
import { WORKFLOW_DRAWER_COMBOBOX_PROPS } from '../workflowDrawerComboboxProps';
import WorkflowNodeForm from '../WorkflowNodeForm';
import { updateWorkflowNode } from '../nodeFormUtils';
import styles from './PhoneNumberForm.module.css';

interface PhoneNumberFormProps {
	nodeId: string;
	workflow?: AgentWorkflow;
	onWorkflowChange: (workflow: AgentWorkflow) => void;
}

const PhoneNumberForm = ({
	nodeId,
	workflow,
	onWorkflowChange,
}: PhoneNumberFormProps) => {
	const { t } = useTranslation([
		'campaign.form.workflow',
		'campaign.form.agents',
		'common',
	]);
	const node = workflow?.nodes[nodeId] as PhoneNumberTransferNode | undefined;

	if (!node) {
		return (
			<WorkflowNodeForm
				title={t('form.workflow.forms.phone.title')}
				description={t('form.workflow.forms.phone.missingNode')}
			>
				<Text size='sm' c='dimmed'>
					{t('form.workflow.forms.phone.missingNodeHint')}
				</Text>
			</WorkflowNodeForm>
		);
	}

	const handleUpdate = (updates: Partial<PhoneNumberTransferNode>) => {
		const nextWorkflow = updateWorkflowNode(workflow, nodeId, updates);
		if (nextWorkflow) {
			onWorkflowChange(nextWorkflow);
		}
	};

	const destinationTypeOptions = [
		{
			value: 'phone',
			label: t('form.workflow.forms.phone.destType.options.phone'),
		},
		{
			value: 'phone_dynamic_variable',
			label: t(
				'form.workflow.forms.phone.destType.options.phone_dynamic_variable'
			),
		},
		{
			value: 'sip_uri',
			label: t('form.workflow.forms.phone.destType.options.sip_uri'),
		},
		{
			value: 'sip_uri_dynamic_variable',
			label: t(
				'form.workflow.forms.phone.destType.options.sip_uri_dynamic_variable'
			),
		},
	];

	// Filter options based on transfer type
	const filteredDestTypeOptions =
		node.transfer_type === 'sip_refer'
			? destinationTypeOptions
			: destinationTypeOptions.slice(0, 2);

	const handleDestinationTypeChange = (value: string | null) => {
		if (!value) return;

		const currentDest = node.transfer_destination || {
			type: 'phone',
			phone_number: '',
		};
		const nextType =
			value as PhoneNumberTransferNode['transfer_destination']['type'];

		// Map current value to new structure if possible
		let nextDest: PhoneNumberTransferNode['transfer_destination'];

		const currentValue =
			'phone_number' in currentDest
				? currentDest.phone_number
				: 'sip_uri' in currentDest
					? currentDest.sip_uri
					: '';

		if (nextType === 'phone' || nextType === 'phone_dynamic_variable') {
			nextDest = { type: nextType, phone_number: currentValue };
		} else {
			nextDest = { type: nextType, sip_uri: currentValue };
		}

		handleUpdate({ transfer_destination: nextDest });
	};

	const handleDestinationValueChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = event.currentTarget.value;
		const currentDest = node.transfer_destination || {
			type: 'phone',
			phone_number: '',
		};

		let nextDest: PhoneNumberTransferNode['transfer_destination'];
		if (
			currentDest.type === 'phone' ||
			currentDest.type === 'phone_dynamic_variable'
		) {
			nextDest = { ...currentDest, phone_number: value };
		} else {
			nextDest = { ...currentDest, sip_uri: value };
		}

		handleUpdate({ transfer_destination: nextDest });
	};

	const handleAddSipHeader = () => {
		const headers = [...(node.custom_sip_headers || [])];
		headers.push({ name: '', value: '' });
		handleUpdate({ custom_sip_headers: headers });
	};

	const handleRemoveSipHeader = (index: number) => {
		const headers = (node.custom_sip_headers || []).filter(
			(_, i) => i !== index
		);
		handleUpdate({ custom_sip_headers: headers });
	};

	const handleSipHeaderChange = (
		index: number,
		field: 'name' | 'value',
		val: string
	) => {
		const headers = [...(node.custom_sip_headers || [])];
		headers[index] = { ...headers[index], [field]: val };
		handleUpdate({ custom_sip_headers: headers });
	};

	const isPhoneType =
		node.transfer_destination?.type === 'phone' ||
		node.transfer_destination?.type === 'phone_dynamic_variable';
	const destinationValue = node.transfer_destination
		? 'phone_number' in node.transfer_destination
			? node.transfer_destination.phone_number
			: 'sip_uri' in node.transfer_destination
				? node.transfer_destination.sip_uri
				: ''
		: '';

	const currentTransferType = node.transfer_type || 'conference';

	return (
		<WorkflowNodeForm
			title={t('form.workflow.forms.phone.title')}
			description={t('form.workflow.forms.phone.description')}
			icon={IconPhone}
			iconColor='var(--mantine-color-gray-7)'
		>
			<Stack gap='md' className={styles.form}>
				{/* Transfer Type Selector */}
				<Box>
					<Text className={styles.label} size='sm'>
						{t('form.workflow.forms.phone.transfer_type')}
					</Text>
					<AppSegmentedControl
						fullWidth
						value={currentTransferType}
						onChange={(value) => handleUpdate({ transfer_type: value })}
						data={[
							{
								label: t('form.workflow.forms.phone.typeOptions.conference'),
								value: 'conference',
							},
							{
								label: (
									<Group gap={4} justify='center'>
										<Text size='sm'>
											{t('form.workflow.forms.phone.typeOptions.sip_refer')}
										</Text>
										<Box className={styles.inlineBadge}>
											{t('form.workflow.forms.phone.new')}
										</Box>
									</Group>
								),
								value: 'sip_refer',
							},
						]}
						size='sm'
						className={styles.segmentedRoot}
					/>
				</Box>

				<Select
					label={t('form.workflow.forms.phone.destType.label')}
					data={filteredDestTypeOptions}
					comboboxProps={WORKFLOW_DRAWER_COMBOBOX_PROPS}
					value={node.transfer_destination?.type || 'phone'}
					onChange={handleDestinationTypeChange}
					size='sm'
					classNames={{ label: styles.label, input: styles.input }}
				/>

				<TextInput
					label={
						isPhoneType
							? t('form.workflow.forms.phone.phone_number.label')
							: t('form.workflow.forms.phone.sip_uri.label')
					}
					placeholder={
						isPhoneType
							? node.transfer_destination?.type === 'phone_dynamic_variable'
								? t('form.workflow.forms.phone.phone_number.dynamicPlaceholder')
								: t('form.workflow.forms.phone.phone_number.placeholder')
							: node.transfer_destination?.type === 'sip_uri_dynamic_variable'
								? t('form.workflow.forms.phone.sip_uri.dynamicPlaceholder')
								: t('form.workflow.forms.phone.sip_uri.placeholder')
					}
					value={destinationValue}
					onChange={handleDestinationValueChange}
					size='sm'
					classNames={{ label: styles.label, input: styles.input }}
				/>

				{currentTransferType === 'sip_refer' && (
					<Stack gap='xs'>
						<Text className={styles.label} size='sm'>
							{t('form.workflow.forms.phone.sipHeaders.title')}
						</Text>
						{node.custom_sip_headers?.map((header, index) => (
							<Group key={index} gap='xs' grow>
								<TextInput
									placeholder={t(
										'form.workflow.forms.phone.sipHeaders.nameLabel'
									)}
									value={header.name}
									onChange={(e) =>
										handleSipHeaderChange(index, 'name', e.currentTarget.value)
									}
									size='sm'
								/>
								<TextInput
									placeholder={t(
										'form.workflow.forms.phone.sipHeaders.valueLabel'
									)}
									value={header.value}
									onChange={(e) =>
										handleSipHeaderChange(index, 'value', e.currentTarget.value)
									}
									size='sm'
								/>
								<ActionIcon
									variant='subtle'
									color='red'
									onClick={() => handleRemoveSipHeader(index)}
									size='sm'
								>
									<IconTrash size={16} />
								</ActionIcon>
							</Group>
						))}
						<Button
							variant='outline'
							color='gray'
							leftSection={<IconPlus size={16} />}
							onClick={handleAddSipHeader}
							size='sm'
							className={styles.addHeaderBtn}
						>
							{t('form.workflow.forms.phone.sipHeaders.addHeader')}
						</Button>
					</Stack>
				)}
			</Stack>
		</WorkflowNodeForm>
	);
};

export default PhoneNumberForm;
