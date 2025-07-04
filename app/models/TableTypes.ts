import type { ColumnDef } from "@tanstack/react-table";
import type { ConversationsModel } from "./ConversationsModels";

export type ConversationTableColumn = ColumnDef<ConversationsModel>;
export type ConversationTableData = ConversationsModel[];
