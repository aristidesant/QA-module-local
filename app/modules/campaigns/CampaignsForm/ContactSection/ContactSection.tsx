import { Flex, Group, Stack } from "@mantine/core";
import { ContactListConfiguration } from "./ContactListConfiguration";
import { ActiveContactList } from "./ActiveContactList";
import { StatusBreakdown } from "./StatusBreakdown";
import { ContactQualityScore } from "./ContactQualityScore";
import { MostUsedContactChannels } from "./MostUsedContactChannels";
import { ContactListOverview } from "./ContactListOverview";
import styles from "./ContactSection.module.css";
import SectionCard from "~/components/SectionCard";

interface ContactSectionProps {
  selectedContactList?: string;
  onContactListChange?: (value: string | null) => void;
}

export const ContactSection = ({
  selectedContactList = "bancopopular_contactos",
  onContactListChange,
}: ContactSectionProps) => {
  return (
    <SectionCard
      title="Contact List Configuration"
      description="Define who your campaign will reach. Upload, import, or select contacts to engage with through your AI agents."
    >
      <ActiveContactList
        selectedContactList={selectedContactList}
        onContactListChange={onContactListChange}
      />

      <Group gap="md" className={styles.statsContainer}>
        {/*  Status Breakdown */}
        <div className={styles.statusBreakdown}>
          <StatusBreakdown />
        </div>

        {/* Quality Score and Channels */}
        <Stack
          align="stretch"
          justify="stretch"
          gap="md"
          className={styles.rightColumn}
        >
          <ContactQualityScore />
          <MostUsedContactChannels />
        </Stack>
      </Group>

      {/* Contact List Overview */}
      <ContactListOverview />
    </SectionCard>
  );
};
