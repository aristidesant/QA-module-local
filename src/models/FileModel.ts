/**
 * Represents a file stored in the system
 */
export default interface FileModel {
  /** Unique identifier for the file */
  id: number;
  
  /** Original name of the file */
  name: string;
  
  /** MIME type of the file */
  mime: string;
  
  /** Full URL to access the file */
  repositoryKey: string;
  
  /** Path to the file in the storage repository */
  repositoryRoute: string;
  
  /** File extension without the dot */
  extension: string;
  
  /** Optional description of the file */
  description: string | null;
  
  /** Type identifier for the file */
  typeId: number;
  
  /** ID of the user who uploaded the file */
  userId: number;
  
  /** ID of the client/organization that owns the file */
  clientId: number;
  
  /** Timestamp when the file was created */
  createdAt: string;
  
  /** Timestamp when the file was last updated */
  updatedAt: string;
  
  /** Timestamp when the file was soft-deleted, or null if not deleted */
  deletedAt: string | null;
}
