import React, { useEffect } from 'react';
import {
	useCreatePromptForm,
	useGetAllPromptForms,
} from '~/queries/promptFormQueries';
import {
	Loader,
	Center,
	Text,
	Stack,
	Paper,
	Group,
	Button,
	Title,
} from '@mantine/core';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import styles from './PromptFormContent.module.css';
import { PromptFormForm } from '~/modules/prompt-form/PromptFormForm';
import type { PromptForm } from '~/models/PromptFormModel';
import usePromptFormStore from '~/modules/prompt-form/usePromptFormStore';
import BaseTable from '~/components/BaseTable';
import usePromptFormListColumn from './usePromptFormListColumn';

export const PromptFormContent: React.FC = () => {
	const { data, isLoading, isError } = useGetAllPromptForms();
	const { setRightComponent } = usePromptFormStore((state) => state);
	const { mutateAsync: createPromptForm } = useCreatePromptForm();

	useEffect(() => {
		return () => {
			setRightComponent(null);
		};
	}, [setRightComponent]);

	const handleOnCreate = async (values: PromptForm) => {
		try {
			await createPromptForm(values);
			setRightComponent(null);
		} catch (error) {
			console.error('Error creating prompt form:', error);
		}
	};
	const { columns, openEditForm } = usePromptFormListColumn();

	if (isLoading) {
		return (
			<Center h={400}>
				<Loader size='lg' />
			</Center>
		);
	}

	if (isError) {
		return (
			<Center h={400}>
				<Stack align='center' gap='md'>
					<IconAlertCircle size={40} color='var(--mantine-color-red-6)' />
					<Text c='red' size='lg' fw={500}>
						Failed to load prompt forms
					</Text>
					<Text size='xs' c='dimmed' mt={4}>
						Please check your connection and try again
					</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<Stack gap='md' className={styles.container}>
			<Group
				justify='space-between'
				align='flex-start'
				className={styles.header}
			>
				<div>
					<Title order={4}>List of forms</Title>
					<Text size='sm' c='dimmed'>
						This is a list of all the forms created by the user.
					</Text>
				</div>
				<Button
					leftSection={<IconPlus size={18} />}
					onClick={() => {
						setRightComponent(
							<PromptFormForm
								key={new Date().getTime()}
								onSubmit={handleOnCreate}
								initialValues={{}}
							/>
						);
					}}
					size='sm'
				>
					New form
				</Button>
			</Group>

			<Paper withBorder className={styles.tableContainer}>
				{data && data.length > 0 ? (
					<BaseTable<PromptForm>
						data={data}
						columns={columns}
						onRowClick={(row) => openEditForm(row)}
						className={styles.table}
						density='compact'
					/>
				) : (
					<Center h={300} className={styles.emptyState}>
						<Stack align='center' gap='xs'>
							<IconAlertCircle size={32} />
							<Text size='sm' fw={500}>
								No prompt forms found
							</Text>
							<Text size='xs' c='dimmed' ta='center'>
								Create your first prompt form to get started
							</Text>
						</Stack>
					</Center>
				)}
			</Paper>
		</Stack>
	);
};
