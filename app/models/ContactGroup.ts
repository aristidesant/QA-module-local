/**
 * Represents a contact group in the system
 */
export default interface ContactGroup {
  /** Unique identifier for the contact group */
  id: number;

  /** Unique name identifier for the contact group */
  name: string;

  /** Description of what this contact group contains */
  description: string;

  /** ID of the user who owns this contact group */
  userId: number;

  /** ID of the client this contact group belongs to */
  clientId: number;

  /** When the contact group was created */
  createdAt: string;

  /** When the contact group was last updated */
  updatedAt: string;

  /** When the contact group was soft-deleted, if applicable */
  deletedAt: string | null;
}
