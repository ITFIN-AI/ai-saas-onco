import * as functions from 'firebase-functions';
import axios, { AxiosInstance } from 'axios';
import round from 'lodash.round';
import { InvoiceId, InvoiceService } from 'shared/services/InvoiceService';
import { FakturowniaInvoice, UserDocument } from '@akademiasaas/shared';
import Stripe from 'stripe';
import dayjs from 'dayjs';

interface Dependencies {
  logger: typeof functions.logger;
  accountData: {
    apiKey: string;
    apiUrl: string;
    departmentId: string | null;
    settings?: InvoiceSettings | null;
  };
}

export type InvoiceSettings = IssuerWithVAT | IssueWithoutVAT;

export type IssuerWithVAT = {
  isVatIssuer: true;
  defaultVatRate: 23;
};

export type IssueWithoutVAT = {
  isVatIssuer: false;
  legalVatExemption: string;
};

export class FakturowniaInvoiceService implements InvoiceService {
  axiosInstance: AxiosInstance;

  constructor(private dependencies: Dependencies) {
    const { accountData } = dependencies;

    this.axiosInstance = axios.create({
      baseURL: accountData.apiUrl,
      params: {
        api_token: accountData.apiKey,
      },
    });
  }

  public async issueInvoiceForStripeInvoice(
    invoiceFromStripe: Stripe.Invoice,
    invoiceClientData?: UserDocument['invoiceData']
  ) {
    const {
      accountData: { settings },
    } = this.dependencies;

    if (invoiceFromStripe.status !== 'paid' || !invoiceFromStripe.status_transitions) {
      throw new Error('Wrong invoice status');
    }

    const now = dayjs();

    const invoice = {
      kind: 'vat',
      number: null,
      sell_date: now.format('YYYY-MM-DD'),
      issue_date: now.format('YYYY-MM-DD'),
      paid_date: now.format('YYYY-MM-DD'),
      status: 'paid',
      payment_to_kind: 'off',
      payment_type: 'card',
      buyer_name: invoiceClientData?.companyName || invoiceFromStripe.customer_name,
      buyer_first_name: invoiceClientData?.firstName || '',
      buyer_last_name: invoiceClientData?.lastName || '',
      buyer_post_code:
        invoiceClientData?.postalCode || invoiceFromStripe.customer_address?.postal_code,
      buyer_street:
        invoiceClientData?.street ||
        `${invoiceFromStripe.customer_address?.line1} ${
          invoiceFromStripe.customer_address?.line2 ?? ''
        }`,
      buyer_city: invoiceClientData?.city || invoiceFromStripe.customer_address?.city,
      buyer_country:
        invoiceClientData?.country || invoiceFromStripe.customer_address?.country || 'PL',
      description_footer: `Nr subskrypcji: ${invoiceFromStripe.subscription}`,
      buyer_tax_no: invoiceClientData?.nip || invoiceFromStripe.customer_tax_ids?.[0]?.value || '',
      buyer_email: invoiceClientData?.email || invoiceFromStripe.customer_email,
      ...(settings?.isVatIssuer === false ? { exempt_tax_kind: settings.legalVatExemption } : {}),
      currency: invoiceFromStripe.currency.toUpperCase(),
      positions: invoiceFromStripe.lines.data.map((line) => ({
        name: line.description,
        tax: 23,

        total_price_gross: this.getGrossAmountFromLine(line),
        quantity: 1,
      })),
    };

    const res = await this.axiosInstance.post(`/invoices.json`, {
      api_token: this.dependencies.accountData.apiKey,
      invoice,
    });

    const createdInvoice: FakturowniaInvoice = res.data;

    return {
      id: createdInvoice.id,
      number: createdInvoice.number,
    };
  }

  public async sendInvoiceToClient(invoiceId: InvoiceId) {
    await this.axiosInstance.post(`/invoices/${invoiceId}/send_by_email.json`);
  }

  public async verifyIntegration() {
    await this.axiosInstance.get(`/invoices.json?period=this_month`);
  }

  private getGrossAmountFromLine(line: Stripe.InvoiceLineItem): number {
    const netAmount = line.amount_excluding_tax || 0;
    if (!line.discount_amounts && !line.tax_amounts) {
      return round(netAmount / 100, 2);
    }

    const discounts =
      line.discount_amounts?.reduce((prev, current) => prev + current.amount, 0) || 0;
    const taxes = line.tax_amounts?.reduce((prev, current) => prev + current.amount, 0) || 0;

    return round((netAmount - discounts + taxes) / 100, 2);
  }
}
