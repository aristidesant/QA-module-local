import { ActiveContactListContainer } from './ActiveContactListContainer';

export interface ContactList {
  id: string;
  name: string;
  expires?: string;
  isActive: boolean;
}

export const ActiveContactList = ActiveContactListContainer;
