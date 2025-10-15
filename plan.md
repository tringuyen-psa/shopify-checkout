# Kế hoạch phát triển Digital Store Platform

## Mô tả tổng quan

Xây dựng nền tảng bán các gói digital với UI/UX tương tự Shopify, tích hợp thanh toán Stripe và PayPal.

## Cấu trúc dự án

```
shopify-checkout/
├── backend/                 # NestJS API
├── frontend/               # Next.js Web App
└── plan.md                 # File kế hoạch này
```

## Backend - NestJS + PostgreSQL

### Cấu trúc thư mục

```
backend/
├── src/
│   ├── modules/
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
│   │   └── payments/
│   │       ├── stripe/
│   │       │   ├── stripe.service.ts
│   │       │   └── stripe.controller.ts
│   │       └── paypal/
│   │           ├── paypal.service.ts
│   │           └── paypal.controller.ts
│   ├── config/
│   │   └── database.config.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
├── .env
└── nest-cli.json
```

### Database Schema

#### Packages Entity

```typescript
interface Package {
  id: string;
  name: string;
  basePrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  description?: string;
  features?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Purchases Entity

```typescript
interface Purchase {
  id: string;
  packageId: string;
  userId: string;
  billingCycle: "weekly" | "monthly" | "yearly";
  price: number;
  status: "pending" | "completed" | "cancelled" | "expired";
  paymentMethod: "stripe" | "paypal";
  paymentId?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints

#### Packages

- `GET /packages` - Lấy danh sách tất cả gói
- `GET /packages/:id` - Lấy chi tiết gói
- `POST /packages` - Tạo gói mới (Admin)
- `PUT /packages/:id` - Cập nhật gói (Admin)
- `DELETE /packages/:id` - Xóa gói (Admin)

#### Purchases

- `GET /purchases/user/:userId` - Lấy danh sách gói đã mua của user
- `GET /purchases/:id` - Lấy chi tiết purchase
- `POST /purchases` - Tạo purchase mới
- `PUT /purchases/:id/renew` - Gia hạn purchase

#### Payments

- `POST /payments/stripe/create-checkout` - Tạo Stripe checkout session
- `POST /payments/stripe/webhook` - Stripe webhook handler
- `POST /payments/paypal/create-order` - Tạo PayPal order
- `POST /payments/paypal/capture-order` - Capture PayPal payment

### Dependencies cần cài đặt

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0",
    "stripe": "^14.0.0",
    "paypal-rest-sdk": "^1.8.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "uuid": "^9.0.0"
  }
}
```

### Environment Variables

```
DATABASE_URL=postgresql://owner:mk@db/tendb?sslmode=require
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PORT=3001
```

## Frontend - Next.js

### Cấu trúc thư mục

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   ├── packages/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   ├── purchases/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── success/
│   │   │   └── page.tsx
│   │   ├── cancel/
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   ├── PackageCard.tsx
│   │   ├── PackageModal.tsx
│   │   ├── CheckoutForm.tsx
│   │   ├── PurchaseList.tsx
│   │   ├── StripeCheckout.tsx
│   │   └── PayPalButton.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── usePackages.ts
│   │   ├── usePurchases.ts
│   │   └── usePayment.ts
│   ├── types/
│   │   ├── package.ts
│   │   ├── purchase.ts
│   │   └── api.ts
│   └── providers/
│       └── SessionProvider.tsx
├── package.json
├── next.config.js
├── tailwind.config.js
└── .env.local
```

### Components chính

#### PackageCard.tsx

- Hiển thị thông tin cơ bản của gói
- Nút "View Details" để mở modal chi tiết

#### PackageModal.tsx

- Hiển thị full thông tin gói
- Lựa chọn billing cycle (tuần/tháng/năm)
- Nút "Buy Now" chuyển đến checkout

#### CheckoutForm.tsx

- UI tương tự Shopify
- Form thông tin khách hàng
- Tóm tắt đơn hàng và tổng tiền
- Tích hợp Stripe và PayPal

#### PurchaseList.tsx

- Hiển thị danh sách gói đã mua
- Thông tin: tên gói, thời gian mua, thời gian hết hạn
- Nút gia hạn cho mỗi gói

### Dependencies cần cài đặt

```json
{
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.4.0",
    "@paypal/react-paypal-js": "^8.1.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0"
  }
}
```

## Luồng hoạt động

### 1. User Flow

1. User truy cập trang chủ -> thấy danh sách gói digital
2. Click vào gói -> Modal hiển thị chi tiết
3. Chọn billing cycle (tuần/tháng/năm) -> thấy giá tương ứng
4. Click "Buy Now" -> chuyển đến trang checkout
5. Điền thông tin -> chọn payment method
6. Thanh toán -> redirect về trang chính với thông tin thành công/thất bại

### 2. Admin Flow

1. Admin đăng nhập -> quản lý gói
2. Tạo mới/cập nhật/xóa gói
3. Xem thống kê purchases

## UI/UX Guidelines

### Design System

- Font: Inter (system font stack)
- Colors:
  - Primary: #000000 (đen)
  - Secondary: #F6F6F7 (xám nhạt)
  - Accent: #008060 (xanh lá Shopify)
  - Text: #000000, #42474E, #6D7175
- Spacing: 4px system
- Border radius: 4px (small), 8px (medium)

### Layout

- Container max-width: 1200px
- Responsive design (mobile, tablet, desktop)
- Card-based layout cho packages
- Modal cho chi tiết và checkout

### Animations

- Smooth transitions (0.2s ease)
- Loading states
- Success/error feedback

## Kế hoạch triển khai

### Phase 1: Backend Setup (Tuần 1)

- [ ] Initialize NestJS project
- [ ] Setup PostgreSQL connection
- [ ] Create entities and migrations
- [ ] Implement CRUD cho packages
- [ ] Setup basic API endpoints

### Phase 2: Frontend Setup (Tuần 2)

- [ ] Initialize Next.js project
- [ ] Setup Tailwind CSS
- [ ] Create basic components
- [ ] Implement package listing
- [ ] Create package detail modal

### Phase 3: Checkout Flow (Tuần 3)

- [ ] Build checkout page (Shopify-style)
- [ ] Integrate Stripe payment
- [ ] Implement purchase management
- [ ] Add user purchase history

### Phase 4: Payment Integration (Tuần 4)

- [ ] Integrate PayPal
- [ ] Add webhooks handling
- [ ] Implement renewal system
- [ ] Add error handling and edge cases

### Phase 5: Testing & Deployment (Tuần 5)

- [ ] Unit và integration tests
- [ ] UI/UX testing
- [ ] Performance optimization
- [ ] Deploy to production

## Technical Considerations

### Security

- Validate input data
- Secure payment processing
- Rate limiting
- CORS configuration

### Performance

- Database indexing
- Caching strategies
- Image optimization
- Code splitting

### Scalability

- Microservices architecture ready
- Database connection pooling
- CDN integration
- Monitoring setup
