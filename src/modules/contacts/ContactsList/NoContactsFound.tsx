import { Card, Text, Button, Group, rem } from "@mantine/core";
import { IconUserOff, IconRefresh } from "@tabler/icons-react";
import classes from "./ContactsList.module.css";

interface NoContactsFoundProps {
  onReload?: () => void;
}

export function NoContactsFound({ onReload }: NoContactsFoundProps) {
  return (
    <Card withBorder shadow="md" radius="lg" className={classes.noContactsCard}>
      <Group justify="center" mb="sm">
        <IconUserOff
          size={rem(48)}
          stroke={1.5}
          className={classes.noContactsIcon}
        />
      </Group>
      <Text ta="center" fw={600} fz="lg" mb="xs">
        No contacts found
      </Text>
      <Text ta="center" c="dimmed" fz="sm" mb="md">
        It looks like you don’t have any contacts yet. Add new contacts to get
        started!
      </Text>
      {onReload && (
        <Group justify="center">
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={onReload}
          >
            Reload
          </Button>
        </Group>
      )}
    </Card>
  );
}
