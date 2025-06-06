import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Container,
  Box,
  Alert,
  Checkbox,
  Anchor,
} from "@mantine/core";
import { IconAt, IconLock, IconAlertCircle } from "@tabler/icons-react";
import { useFetcher } from "react-router";
import classes from "./LoginForm.module.css";
import Logo from "~/components/Logo";

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
        <Paper
          className={classes.paper}
          withBorder
          shadow="xl"
          p={40}
          radius="lg"
        >
          <Box className={classes.header}>
            <Logo />
            <Text mt="md" className={classes.subtitle}>
              Sign in to your account to continue
            </Text>
          </Box>

          <fetcher.Form
            method="post"
            action="/login"
            className={classes.formContainer}
          >
            <Stack gap="lg">
              <TextInput
                required
                label="Username"
                placeholder="Enter your username"
                name="username"
                leftSection={<IconAt size={18} />}
                radius="md"
                size="md"
                className={classes.input}
                styles={{
                  label: { fontWeight: 500, marginBottom: 8 },
                  input: { fontSize: 16 },
                }}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Enter your password"
                name="password"
                leftSection={<IconLock size={18} />}
                radius="md"
                size="md"
                className={classes.input}
                styles={{
                  label: { fontWeight: 500, marginBottom: 8 },
                  input: { fontSize: 16 },
                }}
              />

              <Box className={classes.formActions}>
                <Checkbox
                  label="Remember me"
                  name="rememberMe"
                  className={classes.checkbox}
                  styles={{
                    label: {
                      fontSize: 14,
                      color: "var(--mantine-color-gray-6)",
                    },
                  }}
                />
                <Anchor
                  href="/forgot-password"
                  size="sm"
                  className={classes.forgotPassword}
                >
                  Forgot password?
                </Anchor>
              </Box>

              {actionData?.error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  radius="md"
                  className={classes.errorAlert}
                >
                  {actionData.error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                size="md"
                radius="md"
                loading={isSubmitting}
                className={classes.signInButton}
                styles={{
                  root: { height: 48, fontSize: 16, fontWeight: 600 },
                }}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>
          </fetcher.Form>

          <Text className={classes.footer}>
            Don't have an account?{" "}
            <Text component="a" href="/register" className={classes.link}>
              Sign up
            </Text>
          </Text>
        </Paper>
      </Container>
    </div>
  );
}
