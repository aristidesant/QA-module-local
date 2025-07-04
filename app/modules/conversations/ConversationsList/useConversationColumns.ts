import { useMemo } from "react";
import { conversationColumns } from "./columns";

export function useConversationColumns() {
  return useMemo(() => conversationColumns, []);
}
