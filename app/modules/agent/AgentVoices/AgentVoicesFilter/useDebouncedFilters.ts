import { useEffect, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import type { AgentVoicesFilterValues } from "./AgentVoicesFilter";

export function useDebouncedFilters(filters: AgentVoicesFilterValues, delay = 400) {
  const [debounced, setDebounced] = useState(filters);
  const [debouncedFilters] = useDebouncedValue(filters, delay);

  useEffect(() => {
    setDebounced(debouncedFilters);
  }, [debouncedFilters]);

  return debounced;
}
