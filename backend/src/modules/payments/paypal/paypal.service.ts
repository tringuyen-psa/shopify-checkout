import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PayPalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');
    this.baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    if (!this.clientId || !this.clientSecret) {
      console.warn('PayPal credentials not configured. PayPal integration will be disabled.');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 300000) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new BadRequestException('PayPal credentials not configured');
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      return this.accessToken;
    } catch (error) {
      throw new BadRequestException(`Failed to get PayPal access token: ${error.message}`);
    }
  }

  async createOrder(
    packageName: string,
    price: number,
    returnUrl: string,
    cancelUrl: string,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            description: packageName,
            amount: {
              currency_code: 'USD',
              value: price.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Digital Store',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return {
        orderId: response.data.id,
        approvalUrl: response.data.links.find(
          (link: any) => link.rel === 'approve',
        )?.href,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to create PayPal order: ${error.message}`);
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to capture PayPal order: ${error.message}`);
    }
  }

  async getOrderDetails(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to get PayPal order details: ${error.message}`);
    }
  }

  async refundPayment(captureId: string, amount?: number): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData = amount
        ? {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
          }
        : {};

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        refundData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to refund PayPal payment: ${error.message}`);
    }
  }

  async createPayout(
    recipientEmail: string,
    amount: number,
    currency: string = 'USD',
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const payoutData = {
        sender_batch_header: {
          sender_batch_id: `batch_${Date.now()}`,
          email_subject: 'You have a payment!',
          email_message: 'You have received a payment from Digital Store',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: amount.toFixed(2),
              currency,
            },
            receiver: recipientEmail,
            note: 'Payment from Digital Store',
          },
        ],
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/payments/payouts`,
        payoutData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException(`Failed to create PayPal payout: ${error.message}`);
    }
  }

  getClientId(): string {
    return this.clientId;
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getEnvironment(): string {
    return this.baseUrl.includes('sandbox') ? 'sandbox' : 'live';
  }
}