import { useState, useMemo, useCallback, useEffect } from "react";
import { Button, Card, Group, Text } from "@mantine/core";
import { useGetClientConfig } from "~/queries/clientConfigQueries";
import styles from "./ContactHeaderMapping.module.css";
import { modals } from "@mantine/modals";
import type { MappedResult } from "~/models/ContactFileSummary";

interface SystemColumn {
  name: string;
  label: string;
}

interface ContactHeaderMappingProps {
  documentColumns: string[];
  onMappingChange: (mappings: MappedResult) => void;
  result?: MappedResult;
}

interface FieldMapping {
  systemField: string;
  documentField: string;
}

export function ContactHeaderMapping({
  documentColumns,
  onMappingChange,
  result,
}: ContactHeaderMappingProps) {
  const [selectedSystemField, setSelectedSystemField] = useState<string | null>(
    null
  );
  const [selectedDocumentField, setSelectedDocumentField] = useState<
    string | null
  >(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  const { data: systemConfig, isLoading: isLoadingSystemColumns } =
    useGetClientConfig("contact_columns");

  // Transform and memoize system columns
  const systemColumns = useMemo<SystemColumn[]>(() => {
    if (!systemConfig?.value) return [];
    try {
      return JSON.parse(systemConfig.value) as SystemColumn[];
    } catch (error) {
      console.error("Error parsing contact headers:", error);
      return [];
    }
  }, [systemConfig]);

  // Initialize mappings when component mounts or when result prop changes
  useEffect(() => {
    if (result) {
      const initialMappings = Object.entries(result).map(
        ([systemField, { csvField }]) => ({
          systemField,
          documentField: csvField,
        })
      );
      setMappings(initialMappings);
    }
  }, [result]);

  // Get available fields that aren't currently mapped
  const { availableSystemFields, availableDocumentFields } = useMemo(() => {
    const mappedSystemFields = new Set(mappings.map((m) => m.systemField));
    const mappedDocumentFields = new Set(mappings.map((m) => m.documentField));

    return {
      availableSystemFields: systemColumns.filter(
        (field) => !mappedSystemFields.has(field.name)
      ),
      availableDocumentFields: documentColumns.filter(
        (field) => !mappedDocumentFields.has(field)
      ),
    };
  }, [systemColumns, documentColumns, mappings]);

  // Handle field selection and mapping
  useEffect(() => {
    if (selectedSystemField && selectedDocumentField) {
      const newMapping = {
        systemField: selectedSystemField,
        documentField: selectedDocumentField,
      };

      setMappings((prev) => [...prev, newMapping]);
      setSelectedSystemField(null);
      setSelectedDocumentField(null);
      onMappingChange(getMappedResult([...mappings, newMapping]));
    }
  }, [selectedSystemField, selectedDocumentField, mappings, onMappingChange]);

  // Convert mappings to the expected result format
  const getMappedResult = useCallback(
    (currentMappings: FieldMapping[]): MappedResult => {
      return currentMappings.reduce(
        (acc, { systemField, documentField }) => ({
          ...acc,
          [systemField]: { csvField: documentField },
        }),
        {}
      );
    },
    []
  );

  // Handle removing a mapping
  const handleRemoveMapping = (mappingToRemove: FieldMapping) => {
    const updatedMappings = mappings.filter(
      (m) =>
        m.systemField !== mappingToRemove.systemField ||
        m.documentField !== mappingToRemove.documentField
    );
    setMappings(updatedMappings);
    onMappingChange(getMappedResult(updatedMappings));
  };

  // Helper functions for UI
  const isSelected = (type: "system" | "document", value: string) => {
    return type === "system"
      ? selectedSystemField === value
      : selectedDocumentField === value;
  };

  const handleFieldClick = (type: "system" | "document", value: string) => {
    type === "system"
      ? setSelectedSystemField((prev) => (prev === value ? null : value))
      : setSelectedDocumentField((prev) => (prev === value ? null : value));
  };

  const getItemClass = (isSelected: boolean) =>
    [styles.itemCard, isSelected ? styles.selectedItem : ""]
      .filter(Boolean)
      .join(" ");

  const getRadioClass = (isSelected: boolean) =>
    [styles.radio, isSelected ? styles.radioSelected : ""]
      .filter(Boolean)
      .join(" ");

  return (
    <div className={styles.container}>
      <div className={styles.columnsContainer}>
        {/* System Columns */}
        <div className={styles.column}>
          <Card withBorder className={styles.columnCard}>
            <Text size="sm" fw={500} mb="xs">
              System columns
            </Text>
            <div className={styles.itemsContainer}>
              {isLoadingSystemColumns ? (
                <Text size="sm" c="dimmed">
                  Loading system columns...
                </Text>
              ) : (
                availableSystemFields.map((column) => {
                  const selected = isSelected("system", column.name);
                  return (
                    <Card
                      key={`system-${column.name}`}
                      withBorder
                      className={getItemClass(selected)}
                      onClick={() => handleFieldClick("system", column.name)}
                      p="xs"
                    >
                      <Group gap="xs" wrap="nowrap">
                        <div className={getRadioClass(selected)} />
                        <Text size="sm">{column.label || column.name}</Text>
                      </Group>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Document Columns */}
        <div className={styles.column}>
          <Card withBorder className={styles.columnCard}>
            <Text size="sm" fw={500} mb="xs">
              Document columns
            </Text>
            <div className={styles.itemsContainer}>
              {availableDocumentFields.map((column) => (
                <Card
                  key={`doc-${column}`}
                  withBorder
                  className={getItemClass(isSelected("document", column))}
                  onClick={() => handleFieldClick("document", column)}
                  p="xs"
                >
                  <Group gap="xs" wrap="nowrap">
                    <div
                      className={getRadioClass(isSelected("document", column))}
                    />
                    <Text size="sm">{column}</Text>
                  </Group>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Mapped Results */}
        <div className={styles.column}>
          <Card withBorder className={styles.columnCard} h="100%">
            <Text size="sm" fw={500} mb="xs">
              Mapped Result
            </Text>
            <Text size="xs" c="dimmed" mb="sm">
              The system field your data will be connected to
            </Text>
            <div className={styles.mappedResults}>
              {mappings.length > 0 ? (
                mappings.map((mapping) => {
                  const systemField = systemColumns.find(
                    (col) => col.name === mapping.systemField
                  );
                  if (!systemField) return null;

                  return (
                    <Card
                      key={`mapped-${mapping.systemField}-${mapping.documentField}`}
                      withBorder
                      p="xs"
                      mb={4}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleRemoveMapping(mapping)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap={4} wrap="nowrap">
                          <div className={getRadioClass(true)} />
                          <Text size="sm">
                            {systemField.label || systemField.name}
                          </Text>
                        </Group>
                        <div className={styles.connector} />
                        <Group gap={4} wrap="nowrap">
                          <div className={getRadioClass(true)} />
                          <Text size="sm">{mapping.documentField}</Text>
                        </Group>
                      </Group>
                    </Card>
                  );
                })
              ) : (
                <Text size="sm" c="dimmed" ta="center" mt="md">
                  Select a system field and a document field to create a mapping
                </Text>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Group justify="flex-end" mt="md">
        <Button
          variant="default"
          size="sm"
          onClick={() => modals.close("match-columns-modal")}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => {
            onMappingChange(getMappedResult(mappings));
            modals.close("match-columns-modal");
          }}
        >
          Save
        </Button>
      </Group>
    </div>
  );
}
