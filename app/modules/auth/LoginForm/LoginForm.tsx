import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Text,
  Stack,
  Container,
  Box,
  Alert,
  Checkbox,
  Anchor,
  Loader,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAt, IconLock, IconAlertCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { useActionData, useFetcher, useNavigation } from "react-router";
import classes from "./LoginForm.module.css";
import Logo from "~/components/Logo";

interface ActionData {
  error?: string;
  success?: string;
}

export function LoginForm() {
  const fetcher = useFetcher();
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const theme = useMantineTheme();
  const isSubmitting = navigation.state === "submitting";

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value: string) =>
        !value.trim() ? "Username is required" : null,
      password: (value: string) => (!value ? "Password is required" : null),
    },
  });

  useEffect(() => {
    if (actionData?.error) {
      form.setFieldError("password", actionData.error);
    }
  }, [actionData, form]);

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
            className={classes.formContainer}
            onSubmit={form.onSubmit(() => {})}
          >
            <Stack gap="lg">
              <TextInput
                required
                label="Username"
                placeholder="Enter your username"
                leftSection={<IconAt size={18} />}
                radius="md"
                size="md"
                styles={{
                  label: { fontWeight: 500, marginBottom: 8 },
                  input: { fontSize: 16 },
                }}
                {...form.getInputProps("username")}
                name="username"
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Enter your password"
                leftSection={<IconLock size={18} />}
                radius="md"
                size="md"
                styles={{
                  label: { fontWeight: 500, marginBottom: 8 },
                  input: { fontSize: 16 },
                }}
                {...form.getInputProps("password")}
                name="password"
              />

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
                rightSection={
                  isSubmitting ? <Loader size="xs" color="white" /> : null
                }
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
