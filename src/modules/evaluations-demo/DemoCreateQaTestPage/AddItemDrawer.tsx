import React, { useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Checkbox,
	Group,
	NumberInput,
	Radio,
	Select,
	Stack,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import type { AnswerType, ErrorSeverity, EvaluationItem } from './types';

const SEVERITY_OPTIONS: { value: ErrorSeverity; color: string; hint: string }[] = [
	{ value: 'Business Critical', color: 'red', hint: 'Breaks business requirements' },
	{ value: 'Client Critical', color: 'orange', hint: 'Affects client satisfaction' },
	{ value: 'Compliance Critical', color: 'pink', hint: 'Violates regulations' },
];

const ANSWER_TYPE_OPTIONS: { value: AnswerType; label: string; hint: string }[] = [
	{ value: 'yesNo', label: 'Yes / No', hint: 'Mandatory answer required' },
	{ value: 'yesNoNA', label: 'Yes / No / N/A', hint: 'Optional answer allowed' },
];

interface AddItemDrawerProps {
	opened: boolean;
	onClose: () => void;
	onAdd: (item: Omit<EvaluationItem, 'id'>) => void;
}

const AddItemDrawer: React.FC<AddItemDrawerProps> = ({ opened, onClose, onAdd }) => {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [severity, setSeverity] = useState<ErrorSeverity>('Business Critical');
	const [answerType, setAnswerType] = useState<AnswerType>('yesNo');
	const [yesPoints, setYesPoints] = useState(0);
	const [noPoints, setNoPoints] = useState(0);
	const [naPoints, setNaPoints] = useState(0);
	const [autoFail, setAutoFail] = useState(false);
	const [triggerAnswer, setTriggerAnswer] = useState<'Yes' | 'No'>('Yes');
	const [generalAutoFail, setGeneralAutoFail] = useState(false);

	const reset = () => {
		setName('');
		setDescription('');
		setSeverity('Business Critical');
		setAnswerType('yesNo');
		setYesPoints(0);
		setNoPoints(0);
		setNaPoints(0);
		setAutoFail(false);
		setTriggerAnswer('Yes');
		setGeneralAutoFail(false);
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleAdd = () => {
		if (!name.trim()) return;
		onAdd({
			name: name.trim(),
			description: description.trim(),
			severity,
			answerType,
			yesPoints,
			noPoints,
			naPoints,
			autoFail,
			triggerAnswer,
			generalAutoFail,
		});
		handleClose();
	};

	return (
		<AppDrawer opened={opened} onClose={handleClose} title='Add Evaluation Item'>
			<Stack gap='md'>
				<TextInput
					label='Item Name'
					placeholder='e.g., Agent greeted within 3 seconds'
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<Textarea
					label='Description'
					placeholder='Detailed context for the evaluator about what to assess'
					minRows={3}
					value={description}
					onChange={(e) => setDescription(e.currentTarget.value)}
				/>

				<Radio.Group
					label='Error Severity'
					value={severity}
					onChange={(v) => setSeverity(v as ErrorSeverity)}
				>
					<Stack gap='xs' mt='xs'>
						{SEVERITY_OPTIONS.map((option) => (
							<Radio
								key={option.value}
								value={option.value}
								color='green'
								label={
									<Group gap='xs'>
										<Badge color={option.color} variant='light' size='sm'>
											{option.value}
										</Badge>
										<Text size='sm' c='dimmed'>
											{option.hint}
										</Text>
									</Group>
								}
							/>
						))}
					</Stack>
				</Radio.Group>

				<Radio.Group
					label='Answer Type'
					value={answerType}
					onChange={(v) => setAnswerType(v as AnswerType)}
				>
					<Stack gap='xs' mt='xs'>
						{ANSWER_TYPE_OPTIONS.map((option) => (
							<Radio
								key={option.value}
								value={option.value}
								color='green'
								label={
									<Group gap='xs'>
										<Badge color='green' variant='light' size='sm'>
											{option.label}
										</Badge>
										<Text size='sm' c='dimmed'>
											{option.hint}
										</Text>
									</Group>
								}
							/>
						))}
					</Stack>
				</Radio.Group>

				<div>
					<Text fw={600} size='sm'>
						Punctuation Points
					</Text>
					<Text size='xs' c='dimmed' mb='xs'>
						Assign different points for each answer option. Total across all items
						must equal 100.
					</Text>
					<Stack gap='sm'>
						<NumberInput
							label='Yes Answer'
							value={yesPoints}
							onChange={(v) => setYesPoints(Number(v) || 0)}
						/>
						<NumberInput
							label='No Answer'
							value={noPoints}
							onChange={(v) => setNoPoints(Number(v) || 0)}
						/>
						{answerType === 'yesNoNA' && (
							<NumberInput
								label='N/A Answer'
								value={naPoints}
								onChange={(v) => setNaPoints(Number(v) || 0)}
							/>
						)}
					</Stack>
				</div>

				<Checkbox
					color='green'
					label='Auto-Fail Configuration'
					description='Mark this item to automatically fail evaluation'
					checked={autoFail}
					onChange={(e) => setAutoFail(e.currentTarget.checked)}
				/>

				{autoFail && (
					<Stack gap='sm'>
						<Select
							label='Trigger Answer'
							data={['Yes', 'No']}
							value={triggerAnswer}
							onChange={(v) => setTriggerAnswer((v as 'Yes' | 'No') ?? 'Yes')}
						/>
						<Checkbox
							color='green'
							label='General Auto-Fail (fails entire form)'
							checked={generalAutoFail}
							onChange={(e) => setGeneralAutoFail(e.currentTarget.checked)}
						/>
						{generalAutoFail && (
							<Alert
								color='orange'
								variant='light'
								icon={<IconInfoCircle size={16} />}
								title='Form-Level Impact'
							>
								If this item triggers auto-fail, the entire form will be marked
								as failed.
							</Alert>
						)}
					</Stack>
				)}

				<Group justify='flex-end'>
					<Button variant='default' onClick={handleClose}>
						Cancel
					</Button>
					<Button color='green' disabled={!name.trim()} onClick={handleAdd}>
						Add Item
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default AddItemDrawer;
