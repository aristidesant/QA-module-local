import type { FC } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Textarea,
  Switch,
  Button,
  Stack,
  Card,
} from "@mantine/core";
import classes from "./DispositionCatalogForm.module.css";
import type {
  CreateDispositionCatalog,
  DispositionCatalogModel,
} from "~/models/DispositionCatalogModels";
import DispositionCatalogNode from "./DispositionCatalogNode";
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
      <Stack gap={"sm"}>
        <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
          <RightSection
            title="Catalog Details"
            description="Basic information about the catalog"
          >
            <Card>
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

                <Switch
                  label="Default catalog"
                  {...form.getInputProps("isDefault", { type: "checkbox" })}
                />
                <Button type="submit" loading={loading} fullWidth>
                  {mode === "edit" ? "Update Catalog" : "Create Catalog"}
                </Button>
              </Stack>
            </Card>
          </RightSection>
        </form>
        {mode === "edit" && (
          <RightSection
            title="Catalog Dispositions"
            description="Manage the dispositions associated with this catalog"
          >
            <DispositionCatalogNode catalogId={initialValues?.id} />
          </RightSection>
        )}
      </Stack>
    </>
  );
};

export default DispositionCatalogForm;
