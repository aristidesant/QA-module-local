import React from 'react';
import { Select, Loader, Text, Center, Stack, Textarea } from '@mantine/core';
import type { SelectProps } from '@mantine/core';
import styles from './PromptTemplateSelect.module.css';
import { useGetAllPrompts } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import dayjs from 'dayjs';

interface PromptTemplateSelectProps
	extends Omit<SelectProps, 'data' | 'onChange' | 'value'> {
	value: string | null;
	onChange: (value: string | null) => void;
	description?: string;
	placeholder?: string;
	withPreview?: boolean;
	clearable?: boolean;
	searchable?: boolean;
	prompts?: any[]; // Accept either Prompt or CampaignPromptModel shapes
	isLoading?: boolean;
	isError?: boolean;
}

export const PromptTemplateSelect: React.FC<PromptTemplateSelectProps> = ({
	value,
	onChange,
	description,
	placeholder = 'Select a prompt template',
	clearable = true,
	searchable = true,
	withPreview = true,
	prompts,
	isLoading: propsIsLoading,
	isError: propsIsError,
	...rest
}) => {
	const {
		data: remotePrompts,
		isLoading: remoteLoading,
		isError: remoteError,
	} = useGetAllPrompts();
	const promptsToUse = (prompts as any[]) ?? remotePrompts;
	const isLoading =
		typeof propsIsLoading === 'undefined' ? remoteLoading : propsIsLoading;
	const isError =
		typeof propsIsError === 'undefined' ? remoteError : propsIsError;

	if (isLoading) {
		return (
			<Center className={styles.promptTemplateSelect}>
				<Loader size='sm' />
				<Text ml='sm' size='sm'>
					Loading prompt templates...
				</Text>
			</Center>
		);
	}

	if (isError) {
		return (
			<Text c='red' size='sm' className={styles.promptTemplateSelect}>
				Failed to load prompt templates.
			</Text>
		);
	}

	const options =
		promptsToUse?.map((prompt: any) => {
			// Prompt model has `name` & `generatedPrompt` values
			if (prompt.name) {
				return {
					value: `${prompt.id}`,
					label: `${prompt.name} - ${dayjs(prompt.createdAt).format(
						'MMM DD, YYYY'
					)}`,
				};
			}
			// Fallback for CampaignPromptModel-like objects with `prompt` text
			const label = (prompt.prompt || '').slice(0, 60);
			return {
				value: `${prompt.id}`,
				label: label.length
					? `${label}${label.length === 60 ? '...' : ''}`
					: `Prompt ${prompt.id}`,
			};
		}) || [];

	if (options.length === 0) {
		return (
			<Text size='sm' className={styles.promptTemplateSelect}>
				No prompt templates available.
			</Text>
		);
	}
	return (
		<Stack gap='xs'>
			<Select
				label='Prompt Template'
				description={description}
				placeholder={placeholder}
				clearable={clearable}
				searchable={searchable}
				value={value}
				onChange={onChange}
				data={options}
				className={styles.promptTemplateSelect}
				{...rest}
			/>
			{withPreview && (
				<Textarea
					label='Prompt Preview'
					value={
						promptsToUse?.find((item: any) => item.id == Number(value))
							?.generatedPrompt ||
						promptsToUse?.find((item: any) => item.id == Number(value))
							?.prompt ||
						''
					}
					readOnly
					className={styles.customPromptTextarea}
					autosize
					minRows={8}
					maxRows={16}
					styles={{
						input: {
							backgroundColor: '#f8f9fa',
							fontFamily: 'monospace',
							fontSize: 14,
							color: '#222',
							opacity: 1,
							cursor: 'default',
						},
					}}
				/>
			)}
		</Stack>
	);
};

export default PromptTemplateSelect;
