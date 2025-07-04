import React, { Component } from "react";
import type { ReactNode } from "react";
import { Alert, Center, Button, Stack } from "@mantine/core";
import { IconExclamationCircle, IconRefresh } from "@tabler/icons-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

export class ConversationsErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the optional error callback
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        "ConversationsErrorBoundary caught an error:",
        error,
        errorInfo
      );
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Center p="xl">
          <Stack align="center" gap="md">
            <Alert
              color="red"
              title="Something went wrong"
              icon={<IconExclamationCircle size={16} />}
              style={{ maxWidth: 500 }}
            >
              There was an error loading the conversations table. This might be
              due to a temporary issue with the data or a browser compatibility
              problem.
            </Alert>

            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <Alert
                color="orange"
                title="Debug Info"
                style={{ maxWidth: 600, textAlign: "left" }}
              >
                <pre
                  style={{
                    fontSize: "12px",
                    overflow: "auto",
                    maxHeight: "200px",
                  }}
                >
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </Alert>
            )}
          </Stack>
        </Center>
      );
    }

    return this.props.children;
  }
}

export default ConversationsErrorBoundary;
