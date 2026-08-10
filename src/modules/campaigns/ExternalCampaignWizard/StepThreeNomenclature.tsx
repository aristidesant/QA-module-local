import { useState, useEffect } from 'react';
import { TextInput, Select, Stack, Button, Group, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import PatternPreviewDisplay from './Components/PatternPreviewDisplay';
import { FtpConfigFormData } from './ExternalCampaignWizard';
import styles from './ExternalCampaignWizard.module.css';

interface StepThreeProps {
	formData: FtpConfigFormData;
	updateFormData: (updates: Partial<FtpConfigFormData>) => void;
	filePreviewMatches: boolean;
	setFilePreviewMatches: (matches: boolean) => void;
}

interface NomenclatureField {
	id: string;
	name: string;
}

export default function StepThreeNomenclature({
	formData,
	updateFormData,
	setFilePreviewMatches,
}: StepThreeProps) {
	const [mandatoryFields] = useState<NomenclatureField[]>([
		{ id: 'clientId', name: 'Client ID' },
		{ id: 'date', name: 'Date' },
		{ id: 'time', name: 'Time' },
	]);

	const [optionalFields, setOptionalFields] = useState<NomenclatureField[]>([
		{ id: 'contactName', name: 'Contact Name' },
	]);

	const [fieldValues, setFieldValues] = useState<Record<string, string>>({
		clientId: 'ACME',
		date: 'YYYYMMDD',
		time: 'HHMMSS',
		contactName: 'ContactName',
	});

	const addField = () => {
		const newField: NomenclatureField = {
			id: `field_${Date.now()}`,
			name: '',
		};
		setOptionalFields([...optionalFields, newField]);
		setFieldValues({ ...fieldValues, [newField.id]: '' });
	};

	const removeField = (id: string) => {
		setOptionalFields(optionalFields.filter((f) => f.id !== id));
		const newValues = { ...fieldValues };
		delete newValues[id];
		setFieldValues(newValues);
	};

	const updateFieldName = (id: string, name: string) => {
		setOptionalFields(
			optionalFields.map((f) => (f.id === id ? { ...f, name } : f))
		);
	};

	const updateFieldValue = (id: string, value: string) => {
		setFieldValues({ ...fieldValues, [id]: value });
	};

	// Mark pattern as ready (no file validation needed now)
	useEffect(() => {
		setFilePreviewMatches(true);
	}, [setFilePreviewMatches]);

	return (
		<Stack gap='md' className={styles.formSection}>
			<div>
				<h3 className={styles.sectionTitle}>File Naming Pattern</h3>
				{/* inline-style-allow: */}
				<p
					style={{
						fontSize: 'var(--mantine-font-size-sm)',
						color: 'var(--mantine-color-gray-6)',
					}}
				>
					Define the fields and order for your file naming pattern
				</p>
			</div>

			{/* Mandatory Fields */}
			<div>
				<Text size='sm' fw={500} mb='md'>
					Mandatory Fields
				</Text>
				<Stack gap='sm'>
					{mandatoryFields.map((field) => (
						<TextInput
							key={field.id}
							label={field.name}
							placeholder={`e.g., ${fieldValues[field.id]}`}
							value={fieldValues[field.id]}
							onChange={(e) =>
								updateFieldValue(field.id, e.currentTarget.value)
							}
							disabled
							description='Required field'
						/>
					))}
				</Stack>
			</div>

			{/* Optional Fields */}
			{optionalFields.length > 0 && (
				<div>
					<Text size='sm' fw={500} mb='md'>
						Optional Fields
					</Text>
					<Stack gap='sm'>
						{optionalFields.map((field) => (
							<Group key={field.id} gap='sm' align='flex-end'>
								<TextInput
									label={field.name || 'Field name'}
									placeholder='e.g., Contact Name'
									value={field.name}
									onChange={(e) =>
										updateFieldName(field.id, e.currentTarget.value)
									}
									className={styles.flexField}
								/>
								<TextInput
									label='Value'
									placeholder='e.g., ContactName'
									value={fieldValues[field.id]}
									onChange={(e) =>
										updateFieldValue(field.id, e.currentTarget.value)
									}
									className={styles.flexField}
								/>
								<Button
									variant='subtle'
									color='red'
									size='xs'
									onClick={() => removeField(field.id)}
									p='xs'
								>
									<IconTrash size={16} />
								</Button>
							</Group>
						))}
					</Stack>
				</div>
			)}

			{/* Add Field Button */}
			<Button
				variant='light'
				leftSection={<IconPlus size={16} />}
				onClick={addField}
				fullWidth
			>
				Add Optional Field
			</Button>

			{/* Delimiter */}
			<Select
				label='Delimiter'
				placeholder='Select delimiter'
				value={formData.delimiter}
				onChange={(value) =>
					updateFormData({ delimiter: value as '_' | '-' | '.' | 'none' })
				}
				data={[
					{ value: '_', label: 'Underscore (_)' },
					{ value: '-', label: 'Dash (-)' },
					{ value: '.', label: 'Period (.)' },
					{ value: 'none', label: 'None' },
				]}
				description='Character to separate fields'
			/>

			{/* Pattern Preview */}
			<PatternPreviewDisplay
				contactNameEnabled={
					optionalFields.some((f) => f.id === 'contactName') &&
					fieldValues['contactName'] !== ''
				}
				delimiter={formData.delimiter}
			/>
		</Stack>
	);
}
