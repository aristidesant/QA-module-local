import {
	ActionIcon,
	Box,
	Button,
	Group,
	SegmentedControl,
	Stack,
	Text,
	TextInput,
	Select,
} from '@mantine/core';
import { IconPhone, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
	AgentWorkflow,
	PhoneNumberTransferNode,
} from '~/models/AgentWorkflowModel';
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
	const { t } = useTranslation('campaigns');
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
		node.transferType === 'sip_refer'
			? destinationTypeOptions
			: destinationTypeOptions.slice(0, 2);

	const handleDestinationTypeChange = (value: string | null) => {
		if (!value) return;

		const currentDest = node.transferDestination || {
			type: 'phone',
			phoneNumber: '',
		};
		const nextType =
			value as PhoneNumberTransferNode['transferDestination']['type'];

		// Map current value to new structure if possible
		let nextDest: PhoneNumberTransferNode['transferDestination'];

		const currentValue =
			'phoneNumber' in currentDest
				? currentDest.phoneNumber
				: 'sipUri' in currentDest
					? currentDest.sipUri
					: '';

		if (nextType === 'phone' || nextType === 'phone_dynamic_variable') {
			nextDest = { type: nextType, phoneNumber: currentValue };
		} else {
			nextDest = { type: nextType, sipUri: currentValue };
		}

		handleUpdate({ transferDestination: nextDest });
	};

	const handleDestinationValueChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const value = event.currentTarget.value;
		const currentDest = node.transferDestination || {
			type: 'phone',
			phoneNumber: '',
		};

		let nextDest: PhoneNumberTransferNode['transferDestination'];
		if (
			currentDest.type === 'phone' ||
			currentDest.type === 'phone_dynamic_variable'
		) {
			nextDest = { ...currentDest, phoneNumber: value };
		} else {
			nextDest = { ...currentDest, sipUri: value };
		}

		handleUpdate({ transferDestination: nextDest });
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
		node.transferDestination?.type === 'phone' ||
		node.transferDestination?.type === 'phone_dynamic_variable';
	const destinationValue = node.transferDestination
		? 'phoneNumber' in node.transferDestination
			? node.transferDestination.phoneNumber
			: 'sipUri' in node.transferDestination
				? node.transferDestination.sipUri
				: ''
		: '';

	const currentTransferType = node.transferType || 'conference';

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
						{t('form.workflow.forms.phone.transferType')}
					</Text>
					<SegmentedControl
						fullWidth
						value={currentTransferType}
						onChange={(value) => handleUpdate({ transferType: value })}
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
						radius='md'
						classNames={{
							root: styles.segmentedRoot,
							indicator: styles.segmentedIndicator,
							label: styles.segmentedLabel,
						}}
					/>
				</Box>

				<Select
					label={t('form.workflow.forms.phone.destType.label')}
					data={filteredDestTypeOptions}
					value={node.transferDestination?.type || 'phone'}
					onChange={handleDestinationTypeChange}
					size='sm'
					classNames={{ label: styles.label, input: styles.input }}
				/>

				<TextInput
					label={
						isPhoneType
							? t('form.workflow.forms.phone.phoneNumber.label')
							: t('form.workflow.forms.phone.sipUri.label')
					}
					placeholder={
						isPhoneType
							? node.transferDestination?.type === 'phone_dynamic_variable'
								? t('form.workflow.forms.phone.phoneNumber.dynamicPlaceholder')
								: t('form.workflow.forms.phone.phoneNumber.placeholder')
							: node.transferDestination?.type === 'sip_uri_dynamic_variable'
								? t('form.workflow.forms.phone.sipUri.dynamicPlaceholder')
								: t('form.workflow.forms.phone.sipUri.placeholder')
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
