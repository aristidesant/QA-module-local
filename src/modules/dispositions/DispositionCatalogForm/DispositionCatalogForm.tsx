import type { FC } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Textarea,
  Switch,
  Button,
  Stack,
  Card,
  Group,
  Divider,
} from "@mantine/core";
import type {
  CreateDispositionCatalog,
  DispositionCatalogModel,
} from "~/models/DispositionCatalogModels";
import RightSection from "~/components/RightSection";

type DispositionCatalogFormCoreProps = {
  onSubmit: (values: CreateDispositionCatalog) => void;
  loading?: boolean;
};

type DispositionCatalogFormCreateProps = {
  mode: "create";
  initialValues?: Partial<CreateDispositionCatalog>;
};

type DispositionCatalogFormEditProps = {
  mode: "edit";
  initialValues: DispositionCatalogModel;
};

type DispositionCatalogFormProps = DispositionCatalogFormCoreProps &
  (DispositionCatalogFormCreateProps | DispositionCatalogFormEditProps);

const DispositionCatalogForm: FC<DispositionCatalogFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  mode,
}) => {
  const form = useForm<CreateDispositionCatalog>({
    initialValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      campaignId: initialValues?.campaignId || undefined,
      isDefault: initialValues?.isDefault || false,
    },
    validate: {
      name: (value) => (!value ? "Name is required" : null),
    },
  });

  return (
    <>
      <Stack gap="sm">
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
          <RightSection
            title="Catalog Details"
            description="Basic information about the catalog"
          >
            <Card padding="md" withBorder>
              <Stack gap="sm">
                <TextInput
                  label="Name"
                  placeholder="Catalog name"
                  required
                  {...form.getInputProps("name")}
                />
                <Textarea
                  label="Description"
                  placeholder="Catalog description"
                  autosize
                  minRows={2}
                  {...form.getInputProps("description")}
                />
                <Divider my="xs" />
                <Group justify="space-between" align="center">
                  <Switch
                    label="Default catalog"
                    {...form.getInputProps("isDefault", { type: "checkbox" })}
                  />
                  <Button type="submit" loading={loading}>
                    {mode === "edit" ? "Update Catalog" : "Create Catalog"}
                  </Button>
                </Group>
              </Stack>
            </Card>
          </RightSection>
        </form>
      </Stack>
    </>
  );
};

export default DispositionCatalogForm;
