# Digital Store Platform

A complete digital store platform built with NestJS backend and Next.js frontend, featuring Shopify-style UI/UX and integrated payment systems (Stripe & PayPal).

## Features

- 🏪 **Digital Package Store** - Browse and purchase digital packages
- 💳 **Multiple Payment Methods** - Stripe and PayPal integration
- 📦 **Package Management** - Weekly, monthly, yearly billing cycles
- 🎨 **Shopify-style UI** - Modern, professional interface
- 🔒 **Secure Payments** - Industry-standard payment processing
- 📊 **Purchase History** - Track and manage purchases
- 🛠 **Admin Dashboard** - Manage packages and view statistics

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Robust relational database
- **TypeORM** - Modern ORM for TypeScript
- **Stripe** - Payment processing
- **PayPal** - Alternative payment method
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **React Hook Form** - Form management

## Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (or use Neon)
- Stripe account (for payments)
- PayPal account (optional)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shopify-checkout
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the backend server
npm run start:dev
```

The backend will be available at `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start the frontend server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Configure Database

Update your `.env` file with your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

If you're using Neon (recommended for development), use their connection string directly.

### 5. Configure Payment Providers

#### Stripe
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add them to your backend `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### PayPal (Optional)
1. Create a PayPal Developer account
2. Create a REST API app
3. Add credentials to backend `.env`:
   ```env
   PAYPAL_CLIENT_ID=your_client_id
   PAYPAL_CLIENT_SECRET=your_client_secret
   PAYPAL_MODE=sandbox
   ```

## API Documentation

Once the backend is running, visit `http://localhost:3001/api` to view the complete Swagger API documentation.

### Key Endpoints

#### Packages
- `GET /packages` - Get all packages
- `GET /packages/:id` - Get specific package
- `POST /packages/seed` - Create sample packages

#### Purchases
- `GET /purchases/user/:userId` - Get user purchases
- `POST /purchases` - Create new purchase
- `PATCH /purchases/:id/complete` - Complete purchase

#### Payments
- `POST /payments/stripe/create-checkout` - Create Stripe checkout
- `POST /payments/paypal/create-order` - Create PayPal order

## Project Structure

```
shopify-checkout/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── packages/    # Package management
│   │   │   ├── purchases/   # Purchase tracking
│   │   │   └── payments/    # Payment processing
│   │   └── main.ts         # Application entry point
│   └── .env                # Backend environment variables
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and API
│   │   └── types/         # TypeScript definitions
│   └── .env.local         # Frontend environment variables
└── README.md              # This file
```

## Usage

### For Development

1. **Start with sample data**: Use the "Load Sample Packages" button on the homepage to populate the database with example packages.

2. **Test the flow**:
   - Browse packages on the homepage
   - Click "View Details" on any package
   - Select billing cycle (weekly/monthly/yearly)
   - Click "Buy Now" to go to checkout
   - Fill in customer information
   - Complete purchase (test mode)

3. **Test payments**:
   - **Stripe**: Use test card number `4242424242424242`
   - **PayPal**: Use sandbox credentials

### For Production

1. Update all API keys to production values
2. Configure webhooks for payment processing
3. Set up proper CORS and security measures
4. Configure SSL certificates
5. Set up monitoring and logging

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
```

## Available Scripts

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run linter

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please create an issue in the repository or contact support.