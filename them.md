# Kế hoạch phát triển Multi-Vendor Digital Store Platform

## Mô tả tổng quan

Xây dựng nền tảng cho phép nhiều Shop bán các gói digital với UI/UX tương tự Shopify, tích hợp Stripe Connect cho từng shop với KYC độc lập, hỗ trợ subscription và one-time payment.

## Kiến trúc hệ thống

```
┌──────────────────────────────────────────┐
│   PLATFORM (Master Account)              │
│   - Quản lý Shops                        │
│   - Stripe Connect Platform Account      │
│   - Thu platform fee (10-20%)            │
└──────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Shop A     │        │   Shop B     │
│ + Products   │        │ + Products   │
│ + KYC Done   │        │ + KYC Done   │
│ + Stripe     │        │ + Stripe     │
│   Connected  │        │   Connected  │
│   Account    │        │   Account    │
└──────────────┘        └──────────────┘
```

## Cấu trúc dự án

```
shopify-checkout/
├── backend/                 # NestJS API
├── frontend/               # Next.js Web App
├── admin-dashboard/        # Platform Admin Dashboard
└── plan.md                 # File kế hoạch này
```

---

## Backend - NestJS + PostgreSQL

### Cấu trúc thư mục

```
backend/
├── src/
│   ├── modules/
│   │   ├── shops/
│   │   │   ├── entities/
│   │   │   │   └── shop.entity.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-shop.dto.ts
│   │   │   │   ├── update-shop.dto.ts
│   │   │   │   └── kyc-verification.dto.ts
│   │   │   ├── shop.module.ts
│   │   │   ├── shop.service.ts
│   │   │   └── shop.controller.ts
│   │   ├── packages/
│   │   │   ├── entities/
│   │   │   │   └── package.entity.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-package.dto.ts
│   │   │   │   └── update-package.dto.ts
│   │   │   ├── package.module.ts
│   │   │   ├── package.service.ts
│   │   │   └── package.controller.ts
│   │   ├── purchases/
│   │   │   ├── entities/
│   │   │   │   └── purchase.entity.ts
│   │   │   ├── dto/
│   │   │   │   └── create-purchase.dto.ts
│   │   │   ├── purchase.module.ts
│   │   │   ├── purchase.service.ts
│   │   │   └── purchase.controller.ts
│   │   ├── subscriptions/
│   │   │   ├── entities/
│   │   │   │   └── subscription.entity.ts
│   │   │   ├── subscription.module.ts
│   │   │   ├── subscription.service.ts
│   │   │   └── subscription.controller.ts
│   │   ├── payments/
│   │   │   ├── stripe-connect/
│   │   │   │   ├── stripe-connect.service.ts
│   │   │   │   ├── stripe-connect.controller.ts
│   │   │   │   └── stripe-onboarding.service.ts
│   │   │   ├── stripe/
│   │   │   │   ├── stripe.service.ts
│   │   │   │   ├── stripe.controller.ts
│   │   │   │   └── stripe-webhook.controller.ts
│   │   │   └── paypal/
│   │   │       ├── paypal.service.ts
│   │   │       └── paypal.controller.ts
│   │   ├── checkout/
│   │   │   ├── checkout.module.ts
│   │   │   ├── checkout.service.ts
│   │   │   └── checkout.controller.ts
│   │   ├── users/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── user.module.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.controller.ts
│   │   └── platform/
│   │       ├── entities/
│   │       │   └── platform-setting.entity.ts
│   │       ├── platform.module.ts
│   │       ├── platform.service.ts
│   │       └── platform.controller.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── stripe.config.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── .env
└── nest-cli.json
```

---

## Database Schema (PostgreSQL)

### 1. Shops Entity

```typescript
interface Shop {
  id: string;                        // UUID
  name: string;                      // Tên shop
  slug: string;                      // URL slug (unique)
  ownerId: string;                   // User ID của chủ shop
  
  // Stripe Connect
  stripeAccountId: string | null;    // Connected Account ID
  stripeOnboardingComplete: boolean; // KYC hoàn tất?
  stripeChargesEnabled: boolean;     // Cho phép nhận tiền?
  stripePayoutsEnabled: boolean;     // Cho phép rút tiền?
  
  // Shop info
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;
  
  // Platform settings
  platformFeePercent: number;        // % phí platform (default 15%)
  isActive: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Users Entity

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'shop_owner' | 'platform_admin';
  passwordHash: string;
  
  // Customer info
  phone?: string;
  address?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Packages Entity (Products)

```typescript
interface Package {
  id: string;
  shopId: string;                    // Thuộc shop nào
  name: string;
  slug: string;                      // URL-friendly name
  
  // Pricing
  basePrice: number;                 // One-time purchase price
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  
  // Product info
  description?: string;
  features?: string[];               // JSON array
  images?: string[];
  category?: string;
  
  // Subscription settings
  isSubscription: boolean;           // Có phải subscription không?
  trialDays?: number;                // Số ngày trial
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  shop: Shop;
}
```

### 4. Purchases Entity (Orders)

```typescript
interface Purchase {
  id: string;
  packageId: string;
  shopId: string;
  userId: string;
  
  // Pricing
  billingCycle: "one_time" | "weekly" | "monthly" | "yearly";
  price: number;                     // Giá trước phí
  platformFee: number;               // Phí platform
  shopRevenue: number;               // Tiền shop nhận được
  
  // Payment
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentMethod: "stripe" | "paypal";
  paymentIntentId?: string;          // Stripe Payment Intent ID
  
  // Subscription (nếu có)
  subscriptionId?: string;
  
  // Timing
  startDate?: Date;
  endDate?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  package: Package;
  shop: Shop;
  user: User;
}
```

### 5. Subscriptions Entity

```typescript
interface Subscription {
  id: string;
  purchaseId: string;
  packageId: string;
  shopId: string;
  userId: string;
  
  // Stripe
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  
  // Billing
  billingCycle: "weekly" | "monthly" | "yearly";
  price: number;
  platformFee: number;
  shopRevenue: number;
  
  // Status
  status: "active" | "cancelled" | "past_due" | "unpaid" | "trialing";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  
  // Relations
  purchase: Purchase;
  package: Package;
  shop: Shop;
  user: User;
}
```

### 6. Checkout Sessions Entity

```typescript
interface CheckoutSession {
  id: string;
  sessionId: string;                 // Unique session identifier
  packageId: string;
  shopId: string;
  
  // Customer info (optional before checkout)
  email?: string;
  name?: string;
  
  // Pricing
  billingCycle: "one_time" | "weekly" | "monthly" | "yearly";
  price: number;
  
  // Stripe
  stripeCheckoutSessionId?: string;
  
  status: "pending" | "completed" | "expired";
  expiresAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 7. Platform Settings Entity

```typescript
interface PlatformSetting {
  id: string;
  key: string;                       // Unique key
  value: string;                     // JSON string
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Example settings:
// - defaultPlatformFee: "15"
// - minPlatformFee: "10"
// - maxPlatformFee: "30"
// - stripePlatformAccountId: "acct_xxx"
```

---

## API Endpoints

### Shops

```
POST   /shops                          # Tạo shop mới
GET    /shops                          # Danh sách shops (public)
GET    /shops/:slug                    # Chi tiết shop
PUT    /shops/:id                      # Cập nhật shop
DELETE /shops/:id                      # Xóa shop

# Stripe Connect Onboarding
POST   /shops/:id/connect/onboard      # Bắt đầu KYC
GET    /shops/:id/connect/status       # Kiểm tra trạng thái KYC
POST   /shops/:id/connect/refresh      # Làm mới onboarding link
GET    /shops/:id/dashboard            # Stripe Express Dashboard link
```

### Packages

```
GET    /packages                       # Tất cả packages (public)
GET    /packages/:slug                 # Chi tiết package
GET    /shops/:shopSlug/packages       # Packages của shop

# Shop owner only
POST   /shops/:shopId/packages         # Tạo package
PUT    /packages/:id                   # Cập nhật package
DELETE /packages/:id                   # Xóa package
```

### Checkout (QUAN TRỌNG)

```
# Tạo checkout URL động
POST   /checkout/create-session
Body: {
  packageId: string,
  billingCycle: "one_time" | "weekly" | "monthly" | "yearly",
  email?: string,
  customAmount?: number  // Optional: override price
}
Response: {
  sessionId: string,
  checkoutUrl: string  // /checkout/:sessionId
}

# Load checkout page
GET    /checkout/:sessionId             # Get session details

# Process payment
POST   /checkout/:sessionId/stripe      # Create Stripe checkout
POST   /checkout/:sessionId/paypal      # Create PayPal order
```

### Purchases

```
GET    /purchases                       # User's purchases
GET    /purchases/:id                   # Purchase details
GET    /shops/:shopId/purchases         # Shop's sales (owner only)

# Platform admin
GET    /admin/purchases                 # All purchases
```

### Subscriptions

```
GET    /subscriptions                   # User's subscriptions
GET    /subscriptions/:id               # Subscription details
POST   /subscriptions/:id/cancel        # Cancel subscription
POST   /subscriptions/:id/resume        # Resume subscription
PUT    /subscriptions/:id/change-plan   # Change billing cycle

# Shop owner
GET    /shops/:shopId/subscriptions     # Shop's subscriptions
```

### Payments

```
# Stripe
POST   /payments/stripe/checkout        # Create checkout session
POST   /payments/stripe/webhook         # Stripe webhook endpoint

# Stripe Connect
POST   /payments/stripe-connect/webhook # Connect webhook

# PayPal
POST   /payments/paypal/create-order
POST   /payments/paypal/capture-order
```

### Platform Admin

```
GET    /admin/stats                     # Platform statistics
GET    /admin/shops                     # All shops
PUT    /admin/shops/:id/status          # Approve/suspend shop
GET    /admin/revenue                   # Platform revenue
```

---

## Luồng hoạt động chi tiết

### 1. Shop Owner Onboarding Flow

```mermaid
sequenceDiagram
    ShopOwner->>Platform: Đăng ký shop
    Platform->>DB: Tạo Shop (status: pending)
    Platform->>ShopOwner: Shop created, cần KYC
    
    ShopOwner->>Platform: Bắt đầu KYC
    Platform->>Stripe: Create Connected Account
    Stripe->>Platform: Return account_id
    Platform->>DB: Lưu stripeAccountId
    Platform->>Stripe: Create Account Link
    Stripe->>Platform: Return onboarding_url
    Platform->>ShopOwner: Redirect to Stripe onboarding
    
    ShopOwner->>Stripe: Hoàn thành KYC
    Stripe->>Platform: Webhook: account.updated
    Platform->>DB: Update shop (onboardingComplete: true)
    Platform->>ShopOwner: Email: KYC approved
```

**Chi tiết steps:**

1. **Shop Owner đăng ký:**
   - Form: name, email, shop info
   - Tạo user account (role: shop_owner)
   - Tạo shop record (status: pending)

2. **Stripe Connect Onboarding:**
   ```typescript
   // Create Connected Account
   const account = await stripe.accounts.create({
     type: 'express',  // hoặc 'standard'
     country: 'US',
     email: shopOwner.email,
     capabilities: {
       card_payments: { requested: true },
       transfers: { requested: true },
     },
   });
   
   // Create Account Link
   const accountLink = await stripe.accountLinks.create({
     account: account.id,
     refresh_url: `${baseUrl}/shops/${shopId}/connect/refresh`,
     return_url: `${baseUrl}/shops/${shopId}/connect/success`,
     type: 'account_onboarding',
   });
   
   // Redirect user
   return { onboardingUrl: accountLink.url };
   ```

3. **KYC Verification:**
   - Shop owner điền thông tin cá nhân/doanh nghiệp
   - Upload documents (ID, business license)
   - Link bank account
   - Stripe verify (2-5 ngày làm việc)

4. **Approval:**
   - Webhook: `account.updated` → `charges_enabled: true`
   - Update shop: `status: active`, `stripeChargesEnabled: true`
   - Shop có thể bắt đầu bán hàng

---

### 2. Create Checkout URL Flow

```mermaid
sequenceDiagram
    ShopOwner->>Platform: POST /checkout/create-session
    Platform->>DB: Create CheckoutSession
    DB->>Platform: Return sessionId
    Platform->>ShopOwner: checkoutUrl: /checkout/{sessionId}
    
    ShopOwner->>Customer: Share URL
    Customer->>Platform: Open /checkout/{sessionId}
    Platform->>DB: Load session + package info
    Platform->>Customer: Render checkout page
```

**API Implementation:**

```typescript
// POST /checkout/create-session
async createCheckoutSession(dto: CreateCheckoutSessionDto) {
  const package = await this.packageRepo.findOne({
    where: { id: dto.packageId },
    relations: ['shop']
  });
  
  // Validate shop is active and KYC done
  if (!package.shop.stripeChargesEnabled) {
    throw new Error('Shop chưa hoàn tất KYC');
  }
  
  // Calculate price
  const price = this.calculatePrice(package, dto.billingCycle);
  const platformFee = price * (package.shop.platformFeePercent / 100);
  
  // Create session
  const session = await this.checkoutSessionRepo.save({
    sessionId: generateUniqueId(),
    packageId: dto.packageId,
    shopId: package.shopId,
    billingCycle: dto.billingCycle,
    price,
    platformFee,
    expiresAt: addHours(new Date(), 24),
    status: 'pending'
  });
  
  return {
    sessionId: session.sessionId,
    checkoutUrl: `${config.frontendUrl}/checkout/${session.sessionId}`
  };
}
```

---

### 3. Checkout & Payment Flow

```mermaid
sequenceDiagram
    Customer->>Frontend: Open checkout URL
    Frontend->>Backend: GET /checkout/:sessionId
    Backend->>Frontend: Session + Package data
    
    Customer->>Frontend: Điền info + chọn payment
    Frontend->>Backend: POST /checkout/:sessionId/stripe
    Backend->>Stripe: Create Checkout Session (Connect)
    Stripe->>Backend: Return checkout session
    Backend->>Frontend: Redirect URL
    
    Customer->>Stripe: Complete payment
    Stripe->>Backend: Webhook: checkout.session.completed
    Backend->>DB: Create Purchase
    Backend->>DB: Create Subscription (nếu recurring)
    Stripe->>Platform: Transfer to shop (minus platform fee)
    
    Backend->>Customer: Email confirmation
    Backend->>ShopOwner: Email: New sale
```

**Stripe Checkout Implementation:**

```typescript
// One-time payment
async createStripeCheckout(sessionId: string, dto: StripeCheckoutDto) {
  const checkoutSession = await this.loadSession(sessionId);
  const package = await this.loadPackage(checkoutSession.packageId);
  const shop = package.shop;
  
  // Calculate fees
  const amount = checkoutSession.price * 100; // cents
  const platformFee = checkoutSession.platformFee * 100;
  
  const stripeSession = await stripe.checkout.sessions.create({
    mode: checkoutSession.billingCycle === 'one_time' 
      ? 'payment' 
      : 'subscription',
    
    payment_method_types: ['card'],
    
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: package.name,
          description: package.description,
        },
        unit_amount: amount,
        recurring: checkoutSession.billingCycle !== 'one_time' ? {
          interval: checkoutSession.billingCycle === 'weekly' ? 'week' : 
                    checkoutSession.billingCycle === 'monthly' ? 'month' : 'year'
        } : undefined
      },
      quantity: 1,
    }],
    
    // QUAN TRỌNG: Stripe Connect
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: shop.stripeAccountId, // Shop's connected account
      },
    },
    
    customer_email: dto.email,
    
    success_url: `${config.frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontendUrl}/checkout/${sessionId}`,
    
    metadata: {
      checkoutSessionId: sessionId,
      packageId: package.id,
      shopId: shop.id,
    }
  });
  
  return { url: stripeSession.url };
}
```

**Subscription Implementation:**

```typescript
// For recurring payments
payment_intent_data: undefined, // Don't use for subscriptions
subscription_data: {
  application_fee_percent: shop.platformFeePercent,
  transfer_data: {
    destination: shop.stripeAccountId,
  },
  trial_period_days: package.trialDays || 0,
}
```

---

### 4. Webhook Processing Flow

```typescript
// POST /payments/stripe/webhook
@Post('webhook')
async handleWebhook(@Req() req: RawBodyRequest) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      await this.handleCheckoutCompleted(event.data.object);
      break;
      
    case 'invoice.paid':
      await this.handleSubscriptionRenewal(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await this.handleSubscriptionCancelled(event.data.object);
      break;
      
    case 'account.updated':
      await this.handleAccountUpdated(event.data.object);
      break;
  }
  
  return { received: true };
}

async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;
  
  // Create purchase
  const purchase = await this.purchaseRepo.save({
    packageId: metadata.packageId,
    shopId: metadata.shopId,
    userId: session.customer, // hoặc tìm bằng email
    price: session.amount_total / 100,
    platformFee: session.amount_total * platformFeePercent / 100,
    shopRevenue: session.amount_total * (1 - platformFeePercent) / 100,
    paymentIntentId: session.payment_intent,
    status: 'completed',
  });
  
  // If subscription
  if (session.mode === 'subscription') {
    await this.subscriptionRepo.save({
      purchaseId: purchase.id,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      status: 'active',
      // ... other fields
    });
  }
  
  // Send emails
  await this.emailService.sendPurchaseConfirmation(purchase);
}
```

---

### 5. Subscription Lifecycle

```mermaid
graph TD
    A[Customer Subscribe] --> B[Active]
    B --> C{Renewal Due}
    C -->|Success| B
    C -->|Failed| D[Past Due]
    D -->|Retry Success| B
    D -->|Final Fail| E[Unpaid]
    B -->|User Cancel| F[Cancelled at Period End]
    F -->|Period End| G[Cancelled]
    E --> G
```

**Auto-renewal handling:**

```typescript
// Webhook: invoice.paid
async handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  const subscription = await this.subscriptionRepo.findOne({
    where: { stripeSubscriptionId: invoice.subscription }
  });
  
  // Update subscription
  subscription.currentPeriodStart = new Date(invoice.period_start * 1000);
  subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);
  subscription.status = 'active';
  await this.subscriptionRepo.save(subscription);
  
  // Create new purchase record for this billing cycle
  await this.purchaseRepo.save({
    packageId: subscription.packageId,
    shopId: subscription.shopId,
    userId: subscription.userId,
    subscriptionId: subscription.id,
    price: invoice.amount_paid / 100,
    status: 'completed',
    // ... calculate fees
  });
}
```

---

## Frontend - Next.js

### Cấu trúc thư mục (cập nhật)

```
frontend/
├── src/
│   ├── app/
│   │   ├── (shop)/
│   │   │   ├── [shopSlug]/
│   │   │   │   ├── page.tsx          # Shop homepage
│   │   │   │   └── [packageSlug]/
│   │   │   │       └── page.tsx      # Package detail
│   │   ├── checkout/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx          # Checkout page
│   │   ├── success/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── shop/                 # Shop owner dashboard
│   │   │   │   ├── onboarding/
│   │   │   │   ├── products/
│   │   │   │   ├── sales/
│   │   │   │   └── settings/
│   │   │   └── customer/             # Customer dashboard
│   │   │       ├── purchases/
│   │   │       └── subscriptions/
│   │   └── admin/                    # Platform admin
│   │       ├── shops/
│   │       ├── revenue/
│   │       └── settings/
│   ├── components/
│   │   ├── checkout/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   ├── StripeCheckout.tsx
│   │   │   └── PayPalButton.tsx
│   │   ├── shop/
│   │   │   ├── ShopHeader.tsx
│   │   │   ├── PackageCard.tsx
│   │   │   └── PackageModal.tsx
│   │   ├── onboarding/
│   │   │   ├── StripeConnectButton.tsx
│   │   │   └── KYCStatus.tsx
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       └── RevenueChart.tsx
│   └── lib/
│       ├── api/
│       │   ├── shops.ts
│       │   ├── packages.ts
│       │   ├── checkout.ts
│       │   └── subscriptions.ts
│       └── stripe.ts
```

### Key Components

#### 1. Checkout Page Component

```typescript
// app/checkout/[sessionId]/page.tsx
export default async function CheckoutPage({ 
  params 
}: { 
  params: { sessionId: string } 
}) {
  const session = await getCheckoutSession(params.sessionId);
  const package = await getPackage(session.packageId);
  const shop = await getShop(session.shopId);
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Checkout Form */}
        <div>
          <ShopHeader shop={shop} />
          <CheckoutForm 
            session={session}
            package={package}
          />
        </div>
        
        {/* Right: Order Summary */}
        <div>
          <OrderSummary 
            package={package}
            billingCycle={session.billingCycle}
            price={session.price}
            platformFee={session.platformFee}
          />
        </div>
      </div>
    </div>
  );
}
```

#### 2. Stripe Connect Onboarding

```typescript
// components/onboarding/StripeConnectButton.tsx
'use client';

export function StripeConnectButton({ shopId }: { shopId: string }) {
  const [loading, setLoading] = useState(false);
  
  const handleConnect = async () => {
    setLoading(true);
    const { onboardingUrl } = await fetch(
      `/api/shops/${shopId}/connect/onboard`,
      { method: 'POST' }
    ).then(r => r.json());
    
    window.location.href = onboardingUrl;
  };
  
  return (
    <button 
      onClick={handleConnect}
      disabled={loading}
      className="bg-blue-600 text-white px-6 py-3 rounded"
    >
      {loading ? 'Đang tải...' : 'Bắt đầu xác minh KYC'}
    </button>
  );
}
```

---

## Dependencies cần cài đặt

### Backend

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "stripe": "^14.0.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0",
    "nodemailer": "^6.9.0"
  }
}
```

### Frontend

```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@stripe/stripe-js": "^2.4.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "@paypal/react-paypal-js": "^8.1.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0",
    "recharts": "^2.10.0"
  }
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/platform_db

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox

# App
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Kế hoạch triển khai (6 tuần)

### Phase 1: Core Backend (Tuần 1-2)

- [ ] Setup NestJS project với TypeORM
- [ ] Tạo entities: User, Shop, Package, Purchase
- [ ] Implement authentication (JWT)
- [ ] CRUD API cho Shop và Package
- [ ] Setup PostgreSQL database

### Phase 2: Stripe Connect Integration (Tuần 2-3)

- [ ] Tích hợp Stripe Connect
- [ ] Implement onboarding flow
- [ ] KYC verification webhook handler
- [ ] Test với Stripe Test Mode

### Phase 3: Checkout System (Tuần 3-4)

- [ ] Tạo checkout session API
- [ ] Dynamic checkout URL generation
- [ ] Stripe payment integration với Connect
- [ ] Webhook handling cho payments
- [ ] PayPal integration (optional)

### Phase 4: Subscription (Tuần 4-5)

- [ ] Subscription entity và logic
- [ ] Recurring payment với Stripe
- [ ] Subscription management (cancel, resume)
- [ ] Invoice webhook handling
- [ ] Auto-renewal system

### Phase 5: Frontend Development (Tuần 5-6)

- [ ] Shop storefront pages
- [ ] Checkout page (Shopify-style)
- [ ] Shop owner dashboard
  - [ ] Onboarding flow UI
  - [ ] Product management
  - [ ] Sales analytics
- [ ] Customer dashboard
  - [ ] Purchase history
  - [ ] Subscription management
- [ ] Platform admin dashboard

### Phase 6: Testing & Deployment (Tuần 6)

- [ ] End-to-end testing
- [ ] Payment flow testing
- [ ] Webhook testing
- [ ] Security audit
- [ ] Performance optimization
- [ ] Deploy to production

---

## Các tính năng nâng cao (Future)

### Platform Features
- [ ] Multi-currency support
- [ ] Discount codes & promotions
- [ ] Affiliate system
- [ ] Analytics dashboard
- [ ] Email marketing integration
- [ ] Mobile app

### Shop Features
- [ ] Custom domain
- [ ] Theme customization
- [ ] Digital product delivery
- [ ] License key generation
- [ ] Customer reviews
- [ ] Upsell/cross-sell

### Payment Features
- [ ] Thêm payment methods (Alipay, WeChat Pay)
- [ ] Installment payments
- [ ] Crypto payments
- [ ] Invoice payments
- [ ] Refund management

---

## Security & Compliance

### Security Checklist
- [ ] HTTPS only
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure password hashing
- [ ] API key encryption
- [ ] Webhook signature verification

### Compliance
- [ ] GDPR compliance
- [ ] PCI DSS (handled by Stripe)
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie policy
- [ ] Data retention policy

---

## Monitoring & Analytics

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Logging (Winston/Pino)
- [ ] Stripe Dashboard analytics
- [ ] Custom business metrics
- [ ] Uptime monitoring

---

## Documentation

- [ ] API documentation (Swagger)
- [ ] Shop owner guide
- [ ] Customer guide
- [ ] Developer documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide