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
  SegmentedControl,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconAt,
  IconLock,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useLogin } from "~/queries/authQueries";
import { getErrorMessage } from "~/utils/httpClient";
import classes from "./LoginForm.module.css";
import Logo from "~/components/Logo";

interface FormValues {
  username: string;
  password: string;
  rememberMe: boolean;
  loginType: "USER_PASS" | "LDAP";
}

export function LoginForm() {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = loginMutation.isPending;
  const isRedirecting = false;
  const isLoading = isSubmitting || isRedirecting;

  const form = useForm<FormValues>({
    initialValues: {
      username: "",
      password: "",
      rememberMe: false,
      // default to USER_PASS so existing users keep normal behavior
      loginType: "USER_PASS",
    },
    // Ensure the form never performs native submission
    onSubmitPreventDefault: "always",
    validate: {
      username: (value) => (!value.trim() ? "Username is required" : null),
      password: (value) => (!value ? "Password is required" : null),
    },
  });

  // We'll set form-level errors from the submit handler directly

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
            className={classes.formContainer}
            onSubmit={(e) => {
              // Extra safety: prevent native submit even if Mantine config changes
              e.preventDefault();
              return form.onSubmit(async (values) => {
                setFormError(null);
                try {
                  const result = await loginMutation.mutateAsync({
                    username: values.username,
                    password: values.password,
                    loginType: values.loginType,
                  });
                  console.log(result);
                  navigate("/");
                } catch (err: any) {
                  setFormError(getErrorMessage(err));
                }
              })(e);
            }}
          >
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
              <SegmentedControl
                fullWidth
                value={form.values.loginType}
                onChange={(v) => form.setFieldValue("loginType", v as any)}
                data={[
                  { label: "Credentials", value: "USER_PASS" },
                  { label: "LDAP", value: "LDAP" },
                ]}
              />
              <Divider />
              <div>
                <Text className={classes.inputLabel} mb={4}>
                  Username <span style={{ color: "red" }}>*</span>
                </Text>
                <TextInput
                  required
                  placeholder={
                    form.values.loginType === "USER_PASS"
                      ? "Enter your username"
                      : "Enter your LDAP username"
                  }
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

              {/* loginType is selected at the top of the form */}
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
