export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  identifier: string;
  identifierType: "PERSONAL_ID" | string;
  birthDate: string; // ISO date string: YYYY-MM-DD
  address: string;
  email: string;
  phone: string;
  clientId: number;
  userId: number;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}
