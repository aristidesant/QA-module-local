import { Modal, Group, Button, Title, Text, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import classes from "./ExportToExcelModal.module.css";

export type Direction = "inbound" | "outbound";

export interface ExportToExcelModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit?: (params: { from: Date; to: Date; direction: Direction }) => void;
}

export default function ExportToExcelModal({
  opened,
  onClose,
  onSubmit,
}: ExportToExcelModalProps) {
  const form = useForm<{
    from: Date | null;
    to: Date | null;
    direction: Direction | null;
  }>({
    initialValues: { from: null, to: null, direction: null },
    validate: {
      from: (v) => (v ? null : "Required"),
      to: (v) => (v ? null : "Required"),
      direction: (v) => (v ? null : "Select a type"),
    },
  });

  const handleClose = () => {
    onClose();
    form.reset();
  };

  const handleSubmit = () => {
    const { from, to, direction } = form.values;
    console.log("Form values", { from, to, direction });
    if (!from || !to || !direction) return;
    onSubmit?.({ from, to, direction });
    handleClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Title order={4}>Export conversations</Title>}
      centered
      size="lg"
      classNames={{ body: classes.root }}
    >
      <div className={classes.header}>
        <Text className={classes.hint}>
          Choose dates and type to export. API call will be wired later.
        </Text>
      </div>

      <div className={classes.fieldGroup}>
        <DatePickerInput
          label="From"
          placeholder="Pick start date"
          value={form.values.from}
          onChange={(v) =>
            form.setFieldValue("from", (v as unknown as Date) ?? null)
          }
          maxDate={new Date()}
          valueFormat="YYYY-MM-DD"
          popoverProps={{ withinPortal: true }}
          error={form.errors.from}
        />

        <DatePickerInput
          label="To"
          placeholder="Pick end date"
          value={form.values.to}
          onChange={(v) =>
            form.setFieldValue("to", (v as unknown as Date) ?? null)
          }
          maxDate={new Date()}
          valueFormat="YYYY-MM-DD"
          popoverProps={{ withinPortal: true }}
          error={form.errors.to}
        />

        <Select
          label="Type"
          placeholder="Select type"
          data={[
            { value: "inbound", label: "Inbound" },
            { value: "outbound", label: "Outbound" },
          ]}
          value={form.values.direction}
          onChange={(val) =>
            form.setFieldValue("direction", (val as Direction) ?? null)
          }
          comboboxProps={{ withinPortal: true }}
          error={form.errors.direction}
        />
      </div>

      <Group className={classes.actions}>
        <Button variant="default" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            !form.values.direction || !form.values.from || !form.values.to
          }
        >
          Export
        </Button>
      </Group>
    </Modal>
  );
}
