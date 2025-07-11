import type ContactGroup from "./ContactGroup";

export default interface SchedulerContactGroupModel {
  id: number;
  scheduleId: number;
  contactGroupId: number;
  contactGroup: ContactGroup;
  status: string;
  expirationDate: string;
  maxCallsPerContact: number;
  maxCallsPerList: number;
  userId: number;
  clientId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
