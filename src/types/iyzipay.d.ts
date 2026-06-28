declare module "iyzipay" {
  interface IyzipayOptions {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  interface Address {
    contactName: string;
    city: string;
    country: string;
    address: string;
    zipCode?: string;
  }

  interface Buyer {
    id: string;
    name: string;
    surname: string;
    email: string;
    identityNumber: string;
    phone?: string;
    registrationAddress: string;
    city: string;
    country: string;
    ip: string;
    zipCode?: string;
  }

  interface BasketItem {
    id: string;
    name: string;
    category1: string;
    itemType: "PHYSICAL" | "VIRTUAL";
    price: string;
  }

  interface CheckoutFormInitRequest {
    locale?: string;
    conversationId?: string;
    price: string;
    paidPrice: string;
    currency: string;
    basketId: string;
    paymentGroup: string;
    callbackUrl: string;
    enabledInstallments?: number[];
    buyer: Buyer;
    shippingAddress: Address;
    billingAddress: Address;
    basketItems: BasketItem[];
  }

  interface CheckoutFormInitResult {
    status: string;
    errorCode?: string;
    errorMessage?: string;
    errorGroup?: string;
    locale?: string;
    systemTime?: number;
    conversationId?: string;
    token?: string;
    checkoutFormContent?: string;
    tokenExpireTime?: number;
    paymentPageUrl?: string;
  }

  interface CheckoutFormRetrieveRequest {
    token: string;
  }

  interface CheckoutFormRetrieveResult {
    status: string;
    errorCode?: string;
    errorMessage?: string;
    paymentId?: string;
    paymentStatus?: string;
    price?: string;
    paidPrice?: string;
    currency?: string;
    basketId?: string;
    conversationId?: string;
    token?: string;
    callbackUrl?: string;
    itemTransactions?: Array<{
      itemId: string;
      paymentTransactionId: string;
      transactionStatus: number;
      price: string;
      paidPrice: string;
    }>;
  }

  interface CheckoutFormInitialize {
    create(
      request: CheckoutFormInitRequest,
      callback: (err: Error | null, result: CheckoutFormInitResult) => void
    ): void;
  }

  interface CheckoutFormRetrieve {
    retrieve(
      request: CheckoutFormRetrieveRequest,
      callback: (err: Error | null, result: CheckoutFormRetrieveResult) => void
    ): void;
  }

  class Iyzipay {
    constructor(options: IyzipayOptions);
    checkoutFormInitialize: CheckoutFormInitialize;
    checkoutFormRetrieve: CheckoutFormRetrieve;
  }

  export = Iyzipay;
}
