import { Accordion, Group, Paper, Stack, Text } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { Analysis } from "~/models/ConversationsModels";
import styles from "./AnalysisPanel.module.css";

interface AnalysisPanelProps {
  analysis: Analysis;
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  const {
    call_successful,
    data_collection_results,
    evaluation_criteria_results,
  } = analysis;

  return (
    <Stack gap="md">
      {/* Call Status Card */}
      <Paper p="md" className={styles.paper}>
        <Group className={styles.header} justify="space-between">
          <Text size="sm" fw={600} className={styles.darkText}>
            Call Status
          </Text>
          <Group gap="xs">
            {call_successful === "true" ? (
              <>
                <IconCheck size={16} color="var(--mantine-color-green-6)" />
                <Text size="sm" className={styles.darkText} c="green">
                  Successful
                </Text>
              </>
            ) : (
              <>
                <IconX size={16} color="var(--mantine-color-red-6)" />
                <Text size="sm" className={styles.darkText} c="red">
                  Unsuccessful
                </Text>
              </>
            )}
          </Group>
        </Group>

        {/* Transcript summary moved to ConversationOverview */}
      </Paper>

      {/* Data Collection Results */}
      {Object.keys(data_collection_results || {}).length > 0 && (
        <Paper p="md" className={styles.paper}>
          <Text
            size="sm"
            fw={600}
            className={`${styles.darkText} ${styles.header}`}
            mb="md"
          >
            Data Collection Results
          </Text>
          <Accordion variant="separated">
            {Object.entries(data_collection_results).map(([key, value]) => (
              <Accordion.Item key={key} value={key}>
                <Accordion.Control>
                  <Text size="sm" style={{ textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ").toLowerCase()}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <DisplayValue value={value} />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      )}

      {/* Evaluation Criteria Results */}
      {Object.keys(evaluation_criteria_results || {}).length > 0 && (
        <Paper p="md" className={styles.paper}>
          <Text
            size="sm"
            fw={600}
            className={`${styles.darkText} ${styles.header}`}
            mb="md"
          >
            Evaluation Criteria Results
          </Text>
          <Accordion variant="separated">
            {Object.entries(evaluation_criteria_results).map(([key, value]) => (
              <Accordion.Item key={key} value={key}>
                <Accordion.Control>
                  <Text size="sm" style={{ textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ").toLowerCase()}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <DisplayValue value={value} />
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Paper>
      )}
    </Stack>
  );
}

function DisplayValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return (
      <Text size="sm" className="lightText">
        No data
      </Text>
    );
  }

  if (typeof value === "boolean") {
    return (
      <Group gap="xs">
        {value ? (
          <>
            <IconCheck size={16} color="var(--mantine-color-green-6)" />
            <Text size="sm" className="darkText">
              Yes
            </Text>
          </>
        ) : (
          <>
            <IconX size={16} color="var(--mantine-color-red-6)" />
            <Text size="sm" className="darkText">
              No
            </Text>
          </>
        )}
      </Group>
    );
  }

  if (typeof value === "object") {
    return (
      <Stack gap="xs">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <Group key={k} justify="space-between">
            <Text size="sm" fw={500} tt="capitalize">
              {k.replace(/_/g, " ")}:
            </Text>
            <DisplayValue value={v} />
          </Group>
        ))}
      </Stack>
    );
  }

  return <Text size="sm">{String(value)}</Text>;
}

export default AnalysisPanel;
