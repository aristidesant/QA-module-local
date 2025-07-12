import { Button, Group, Stack, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import React from "react";
import { useParams } from "react-router-dom";
import { useCreatePredefinedSchedule } from "~/queries/schedulerQueries";
import styles from "./AddShedulerForm.module.css";

interface AddShedulerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  campaignId?: string | number | null;
}

interface PredefinedScheduleFormValues {
  name: string;
  description: string;
}

const AddShedulerForm: React.FC<AddShedulerFormProps> = ({
  onSuccess,
  onCancel,
  campaignId,
}) => {
  const createPredefinedScheduleMutation = useCreatePredefinedSchedule();

  const form = useForm<PredefinedScheduleFormValues>({
    initialValues: {
      name: "",
      description: "",
    },
    validate: {
      name: (value) => (value.trim() ? null : "Name is required"),
    },
  });

  const handleSubmit = async (values: PredefinedScheduleFormValues) => {
    if (!campaignId) {
      notifications.show({
        title: "Error",
        message: "Campaign ID is required",
        color: "red",
      });
      return;
    }

    try {
      await createPredefinedScheduleMutation.mutateAsync({
        campaignId,
        predefinedScheduleData: {
          ...values,
          campaignId: Number(campaignId),
        },
      });

      notifications.show({
        title: "Success",
        message: "Predefined schedule created successfully",
        color: "green",
        icon: <IconCheck size={16} />,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating predefined schedule:", error);
      notifications.show({
        title: "Error",
        message: "Failed to create predefined schedule",
        color: "red",
      });
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Schedule Name"
          placeholder="e.g. Standard Business Hours"
          required
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Description"
          placeholder="e.g. Monday-Friday 8:00 AM to 5:00 PM"
          minRows={3}
          {...form.getInputProps("description")}
        />
        <Group justify="flex-end" mt="md">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={createPredefinedScheduleMutation.isPending}
          >
            Create Schedule
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default AddShedulerForm;
