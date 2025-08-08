import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import AppRoutes from "./routes";

import { theme } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "~/utils/axiosInterceptor";

const queryClient = new QueryClient({});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <AppRoutes />
      </MantineProvider>
    </QueryClientProvider>
  );
}
