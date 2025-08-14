import { Modal, Group, Button, Title, Text, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useState } from "react";
import conversationsApi from "~/api/conversationsApi";
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
  const [loading, setLoading] = useState(false);
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
    // If parent provided a handler, delegate to it
    if (onSubmit) {
      onSubmit({ from, to, direction });
      handleClose();
      return;
    }

    // Otherwise, handle export here: build UTC day range and download file
    // Normalize any input into a valid Date instance (defensive against strings/dayjs)
    const toValidDate = (input: unknown): Date => {
      if (input instanceof Date) return input;
      const dt = new Date(input as string);
      if (Number.isNaN(dt.getTime())) {
        throw new Error("Invalid date");
      }
      return dt;
    };

    const buildUtcIso = (input: unknown, h: number, m: number, s: number) => {
      const d = toValidDate(input);
      const y = d.getFullYear();
      const mon = d.getMonth();
      const day = d.getDate();
      return new Date(Date.UTC(y, mon, day, h, m, s)).toISOString();
    };

    const startDate = buildUtcIso(from, 0, 0, 0); // 00:00:00Z
    const endDate = buildUtcIso(to, 23, 59, 59); // 23:59:59Z

    setLoading(true);
    conversationsApi()
      .exportConversationsCsv({
        startDate,
        endDate,
        campaingType: direction,
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || `conversations-${startDate}-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to export conversations CSV", err);
      })
      .finally(() => {
        setLoading(false);
        handleClose();
      });
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
            { value: "INBOUND", label: "Inbound" },
            { value: "OUTBOUND", label: "Outbound" },
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
          loading={loading}
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
