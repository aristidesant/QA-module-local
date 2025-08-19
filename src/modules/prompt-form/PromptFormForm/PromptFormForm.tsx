import React, { useEffect } from "react";
import {
	Paper,
	Select,
	TextInput,
	Button,
	Stack,
	Box,
	Alert,
} from "@mantine/core";
import styles from "./PromptFormForm.module.css";
import { useForm } from "@mantine/form";
import { useGetAllPromptTypes } from "~/queries/promptTypesQueries";
import PromptFormInput from "../PromptFormInput";
import { IconDeviceFloppy, IconAlertCircle } from "@tabler/icons-react";
import type { PromptInstructionType } from "~/config/prompt-generator/useForm";
import { useGetAllPromptCategories } from "~/queries/promptCategoryQueries";
import type { PromptForm } from "~/models/PromptFormModel";

export type PromptFormFormProps = {
	initialValues?: Partial<PromptForm>;
	onSubmit?: (values: PromptForm) => void;
	submitLabel?: string;
};

export const PromptFormForm: React.FC<PromptFormFormProps> = ({
	initialValues,
	onSubmit,
	submitLabel = "Save",
}) => {
	const form = useForm<Partial<PromptForm>>({
		initialValues: initialValues || {},
		validate: {
			name: (value) => (!value ? "Prompt name is required" : null),
			typeId: (value) => (!value ? "Prompt type is required" : null),
			form: (value) => {
				if (!value) return "Field configuration is required";
				if (!value.fields || value.fields.length === 0) {
					return "At least one form field is required";
				}
				return null;
			},
		},
	});
	const [categoryId, setCategoryId] = React.useState<string | undefined>();
	const [submitError, setSubmitError] = React.useState<string | null>(null);

	// Create a key for forcing re-render when switching between create/edit modes
	const formKey = React.useMemo(() => {
		return initialValues?.id ? `edit-${initialValues.id}` : "create";
	}, [initialValues?.id]);

	const { data: promptCategories } = useGetAllPromptCategories();
	const { data: promptTypes } = useGetAllPromptTypes({
		...(categoryId ? { categoryId } : {}),
	});

	useEffect(() => {
		if (promptTypes && promptTypes.length > 0 && !form.values.typeId) {
			const typeId = promptTypes[0].id;
			form.setFieldValue("typeId", typeId);
		}
	}, [promptTypes, form]);

	// Reset form when initialValues change (switching between create/edit modes)
	useEffect(() => {
		const newValues = initialValues || {};
		form.setInitialValues(newValues);
		form.reset();
		setSubmitError(null);

		// Set categoryId based on initial values for edit mode
		if (initialValues?.type?.categoryId) {
			setCategoryId(initialValues.type.categoryId.toString());
		} else {
			setCategoryId(undefined);
		}
	}, [initialValues]);

	// Clear submit error when form fields are added/modified
	useEffect(() => {
		if (
			submitError &&
			form.values.form?.fields &&
			form.values.form.fields.length > 0
		) {
			setSubmitError(null);
		}
	}, [form.values.form?.fields, submitError]);

	return (
		<div className={styles.container} key={formKey}>
			<Box
				component="form"
				onSubmit={form.onSubmit(
					(values) => {
						// Clear any previous submit errors
						setSubmitError(null);

						// Additional validation for form fields
						if (!values.form?.fields || values.form.fields.length === 0) {
							setSubmitError(
								"Please add at least one form field before submitting."
							);
							return;
						}

						onSubmit?.(values as PromptForm);
						setCategoryId(undefined);
					},
					(validationErrors) => {
						// Handle validation errors
						console.log("Validation errors:", validationErrors);

						if (validationErrors.form) {
							setSubmitError(String(validationErrors.form));
						} else if (
							!form.values.form?.fields ||
							form.values.form.fields.length === 0
						) {
							setSubmitError(
								"Please add at least one form field before submitting."
							);
						} else {
							setSubmitError(
								"Please correct the errors above before submitting."
							);
						}
					}
				)}
			>
				<Paper
					p="md"
					mb="md"
					radius="md"
					withBorder
					bg="var(--mantine-color-body)"
				>
					<Stack gap="md">
						<Select
							placeholder="Select a category"
							label="Select Category"
							value={categoryId}
							onChange={(value) => {
								if (value) {
									setCategoryId(value);
								}
							}}
							data={
								promptCategories?.map((category) => ({
									value: `${category.id}`,
									label: category.name,
								})) ?? []
							}
						/>
						<Select
							placeholder="Select a prompt type"
							label="Select Prompt Type"
							required
							{...form.getInputProps("typeId")}
							data={
								promptTypes?.map((type) => ({
									value: `${type.id}`,
									label: type.name,
								})) ?? []
							}
							value={form.values.typeId?.toString()}
							onChange={(value) => {
								if (value) {
									form.setFieldValue("typeId", Number(value));
								}
							}}
						/>
						<TextInput
							{...form.getInputProps("name")}
							label="Prompt Name"
							required
						/>
					</Stack>
				</Paper>

				{submitError && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						color="red"
						mb="md"
						onClose={() => setSubmitError(null)}
						withCloseButton
					>
						{submitError}
					</Alert>
				)}

				<PromptFormInput
					type={
						promptTypes?.find((type) => type.id === form.values?.typeId)
							?.name as PromptInstructionType
					}
					form={form}
				/>
				<Button
					rightSection={<IconDeviceFloppy />}
					type="submit"
					style={{ marginTop: 24 }}
				>
					{submitLabel}
				</Button>
			</Box>
		</div>
	);
};
