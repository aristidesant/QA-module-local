import React, { useEffect } from "react";
import {
	useCreatePromptForm,
	useGetAllPromptForms,
} from "../../../queries/promptFormQueries";
import {
	Loader,
	Center,
	Text,
	ActionIcon,
	Stack,
	// UI components used inside hook file
} from "@mantine/core";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import styles from "./PromptFormList.module.css";
import { PromptFormForm } from "../PromptFormForm";
import SectionCard from "~/components/SectionCard";
import type { PromptForm } from "~/models/PromptFormModel";
import usePromptFormStore from "../usePromptFormStore";
import BaseTable from "~/components/BaseTable";
// Column types are defined in the hook file
import usePromptFormListColumn from "./usePromptFormListColumn";

export const PromptFormList: React.FC = () => {
	const { data, isLoading, isError } = useGetAllPromptForms();
	const { setRightComponent } = usePromptFormStore((state) => state);
	const { mutateAsync: createPromptForm } = useCreatePromptForm();

	useEffect(() => {
		return () => {
			setRightComponent(null);
		};
	}, []);
	// Loading and error states are handled after all hooks are called to respect Rules of Hooks
	const handleOnCreate = async (values: PromptForm) => {
		try {
			await createPromptForm(values);
			setRightComponent(null);
		} catch (error) {
			console.error("Error creating prompt form:", error);
		}
	};
	const { columns, openEditForm } = usePromptFormListColumn();

	if (isLoading) {
		return (
			<Center h={400}>
				<Loader size="lg" />
			</Center>
		);
	}

	if (isError) {
		return (
			<Center h={400}>
				<Stack align="center" gap="md">
					<IconAlertCircle size={40} color="var(--mantine-color-red-6)" />
					<Text c="red" size="lg" fw={500}>
						Failed to load prompt forms
					</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<SectionCard
			title="List of forms"
			description="This is a list of all the forms created by the user."
			headerActions={
				<ActionIcon
					onClick={() => {
						setRightComponent(
							<PromptFormForm
								key={new Date().getTime()}
								onSubmit={handleOnCreate}
								initialValues={{}}
							/>
						);
					}}
				>
					<IconPlus />
				</ActionIcon>
			}
		>
			{data && data.length > 0 ? (
				<BaseTable<PromptForm>
					data={data}
					columns={columns}
					onRowClick={(row) => openEditForm(row)}
					className={styles.table}
					density="compact"
				/>
			) : (
				<div className={styles.emptyState}>
					<IconAlertCircle size={24} style={{ marginBottom: 12 }} />
					<Text size="sm">No prompt forms found</Text>
					<Text size="xs" c="dimmed" mt={4}>
						Create your first prompt form to get started
					</Text>
				</div>
			)}
		</SectionCard>
	);
};
