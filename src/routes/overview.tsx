import { Container, Stack } from "@mantine/core";
import WelcomeCard from "../modules/overview/WelcomeCard";

export default function Overview() {
  return (
    <Container size="lg" py="xl">
      <Stack>
        <WelcomeCard />
      </Stack>
    </Container>
  );
}
