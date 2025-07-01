import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Text,
  Stack,
  Alert,
  Loader,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAt,
  IconLock,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useActionData, useSubmit, useNavigation } from "react-router";
import classes from "./LoginForm.module.css";
import Logo from "~/components/Logo";

interface FormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface ActionData {
  error?: string;
  formError?: string;
  fieldErrors?: {
    username?: string;
    password?: string;
  };
}

export function LoginForm() {
  const submit = useSubmit();
  const actionData = useActionData() as ActionData | undefined;
  const navigation = useNavigation();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const isRedirecting = navigation.state === "loading";
  const isLoading = isSubmitting || isRedirecting;

  const form = useForm<FormValues>({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    validate: {
      username: (value) => (!value.trim() ? "Username is required" : null),
      password: (value) => (!value ? "Password is required" : null),
    },
  });

  useEffect(() => {
    // Handle server-side validation errors
    if (actionData?.fieldErrors) {
      Object.entries(actionData.fieldErrors).forEach(([field, error]) => {
        if (error) {
          form.setFieldError(field, error);
        }
      });
    }

    // Handle form-level errors
    if (actionData?.formError) {
      setFormError(actionData.formError);
    } else if (actionData?.error) {
      // Fallback for backward compatibility
      setFormError(actionData.error);
    } else {
      setFormError(null);
    }
  }, [actionData, form]);

  const togglePasswordVisibility = () => setShowPassword((show) => !show);

  return (
    <div className={classes.wrapper}>
      <div className={classes.form}>
        <Paper className={classes.paper} radius="md" withBorder>
          <div className={classes.header}>
            <div className={classes.logo}>
              <Logo />
            </div>
            <Text className={classes.subtitle} size="sm" c="dimmed">
              Sign in to your account to continue
            </Text>
          </div>

          <form
            method="post"
            className={classes.formContainer}
            onSubmit={form.onSubmit((values) => {
              const formData = new FormData();
              formData.append("username", values.username);
              formData.append("password", values.password);
              submit(formData, { method: "post" });
            })}
          >
            {/* Form error alert */}
            {formError && (
              <Alert
                variant="light"
                color="red"
                title="Login failed"
                icon={<IconAlertCircle size={18} />}
                mb="md"
                radius="md"
                p="sm"
                className={classes.errorMessage}
              >
                {formError}
              </Alert>
            )}

            {/* Loading overlay */}
            {(isSubmitting || isRedirecting) && (
              <div className={classes.loadingOverlay}>
                <Group gap="sm">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">
                    Signing in...
                  </Text>
                </Group>
              </div>
            )}
            <Stack gap="xs">
              <div>
                <Text className={classes.inputLabel} mb={4}>
                  Username <span style={{ color: "red" }}>*</span>
                </Text>
                <TextInput
                  required
                  placeholder="Enter your username"
                  leftSection={
                    <IconAt className={classes.inputIcon} stroke={1.5} />
                  }
                  leftSectionPointerEvents="none"
                  classNames={{
                    input: classes.input,
                    root: classes.inputRoot,
                  }}
                  {...form.getInputProps("username")}
                  name="username"
                  autoComplete="username"
                />
              </div>

              <div>
                <Text className={classes.inputLabel} mb={4}>
                  Password <span style={{ color: "red" }}>*</span>
                </Text>
                <PasswordInput
                  required
                  placeholder="Enter your password"
                  leftSection={
                    <IconLock className={classes.inputIcon} stroke={1.5} />
                  }
                  leftSectionPointerEvents="none"
                  visibilityToggleIcon={({ reveal }) =>
                    reveal ? (
                      <IconEyeOff size={18} stroke={1.5} />
                    ) : (
                      <IconEye size={18} stroke={1.5} />
                    )
                  }
                  classNames={{
                    input: classes.input,
                    root: classes.inputRoot,
                    visibilityToggle: classes.visibilityToggle,
                  }}
                  {...form.getInputProps("password")}
                  name="password"
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                fullWidth
                mt="md"
                className={classes.submitButton}
                loading={isLoading}
                loaderProps={{ type: "dots" }}
                leftSection={!isLoading && <IconLock size={18} stroke={1.5} />}
                disabled={isLoading}
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </div>
    </div>
  );
}
