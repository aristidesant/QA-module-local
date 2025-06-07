import { Stack, Title } from "@mantine/core";

type ContainerHeaderProps = {
  title?: string;
  description?: string;
};

const ContainerHeader: React.FC<ContainerHeaderProps> = ({
  title,
  description,
}) => {
  return (
    <Stack>
      <Title order={2} size="h2" fw={700}>
        {title || "Welcome to the Dashboard"}
      </Title>
      {description && (
        <Title order={4} size="h4" fw={400} c="dimmed">
          {description}
        </Title>
      )}
    </Stack>
  );
};

export default ContainerHeader;
