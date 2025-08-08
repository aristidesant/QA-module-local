export interface Contact {
  id?: number;
  name?: string;
  phoneNumber?: string;
  email?: string;
  [key: string]: unknown;
}

// Create a const to allow default export
const ContactExport = {};
export default ContactExport;
