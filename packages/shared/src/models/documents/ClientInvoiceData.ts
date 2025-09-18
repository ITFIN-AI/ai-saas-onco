export interface ClientInvoiceData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyName: string;
  additionalInfo: string;
  nip: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  isLegalEntity?: boolean;
  email?: string;
}
