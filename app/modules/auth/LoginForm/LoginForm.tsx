import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Container,
} from "@mantine/core";
import { IconAt, IconLock } from "@tabler/icons-react";
import { useFetcher } from "react-router";
import classes from "./LoginForm.module.css";

interface ActionData {
  error?: string;
}

export function LoginForm() {
  const fetcher = useFetcher();
  const actionData = fetcher.data as ActionData;
  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className={classes.wrapper}>
      <Container size="xs" className={classes.form}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Title order={2} className={classes.title}>
            Welcome back!
          </Title>

          <fetcher.Form method="post" action="/login">
            <Stack>
              <TextInput
                required
                label="Username"
                placeholder="User"
                name="username"
                leftSection={<IconAt size={16} />}
                radius="md"
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                name="password"
                leftSection={<IconLock size={16} />}
                radius="md"
              />

              {actionData?.error && (
                <Text c="red" size="sm" className={classes.error}>
                  {actionData.error}
                </Text>
              )}

              <Button
                type="submit"
                fullWidth
                mt="xl"
                radius="md"
                loading={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </fetcher.Form>
        </Paper>
      </Container>
    </div>
  );
}
