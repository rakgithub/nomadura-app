# Product Requirements Document (PRD)
## Nomadura Financial Management Application

**Version:** 1.0
**Date:** November 24, 2025
**Author:** Product Team

---

## 1. Executive Summary

A financial management application for Nomadura, a group travel company, to track business finances, distinguish between personal profit and operational funds, and analyze per-trip profitability.

---

## 2. Project Goals

### Goals
- **Clear Fund Separation**: Distinguish between withdrawable profit and business operational reserves
- **Trip Profitability**: Track income and expenses per trip with real-time profit calculations
- **Cash Flow Visibility**: Project future expenses and available funds for upcoming trips
- **Financial Health Dashboard**: At-a-glance view of business financial status
- **Expense Categorization**: Organize expenses by type, trip, and business function

### Non-Goals
- Full accounting software replacement (no double-entry bookkeeping)
- Tax filing or compliance features
- Customer-facing payment portal
- Multi-currency support (MVP)
- Third-party bank integrations (MVP)
- Mobile native application (MVP - web responsive only)

---

## 3. User Stories

### Business Owner/Manager

#### Dashboard & Overview
- **US-1**: As a business owner, I want to see my withdrawable profit at a glance so I know how much I can safely take for personal use
- **US-2**: As a business owner, I want to see my operational reserves so I know if I have enough funds for upcoming trip expenses
- **US-3**: As a business owner, I want a dashboard showing total revenue, expenses, and profit so I can assess overall business health

#### Trip Management
- **US-4**: As a business owner, I want to create trips with expected income and budgeted expenses so I can plan financially
- **US-5**: As a business owner, I want to record partial payments (50% advance, 50% final) per customer so I can track payment status
- **US-6**: As a business owner, I want to see per-trip profitability (revenue - expenses) so I can identify profitable vs unprofitable trips
- **US-7**: As a business owner, I want to mark trips as completed to finalize their financials

#### Expense Tracking
- **US-8**: As a business owner, I want to record expenses and categorize them (transportation, accommodation, food, guide fees, etc.)
- **US-9**: As a business owner, I want to assign expenses to specific trips or mark them as general business expenses
- **US-10**: As a business owner, I want to upload receipts for expenses for record-keeping

#### Cash Flow & Projections
- **US-11**: As a business owner, I want to see upcoming trip expenses so I can ensure sufficient operational funds
- **US-12**: As a business owner, I want to see expected incoming payments so I can project cash flow
- **US-13**: As a business owner, I want alerts when operational funds are low relative to upcoming expenses

#### Withdrawals & Transfers
- **US-14**: As a business owner, I want to record profit withdrawals so I can track personal vs business funds
- **US-15**: As a business owner, I want to see withdrawal history with dates and amounts

---

## 4. Technical Architecture & Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts or Chart.js

### Backend
- **Runtime**: Next.js API Routes / Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage (receipts)
- **ORM**: Supabase Client (with TypeScript types)

### Infrastructure
- **Hosting**: Vercel
- **Database**: Supabase (managed PostgreSQL)
- **Environment**: Node.js 18+

### Architecture Pattern
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Supabase API   │────▶│   PostgreSQL    │
│   (Frontend +   │     │  (Auth + REST)  │     │   (Database)    │
│   API Routes)   │     └─────────────────┘     └─────────────────┘
└─────────────────┘              │
                                 ▼
                        ┌─────────────────┐
                        │    Supabase     │
                        │    Storage      │
                        │   (Receipts)    │
                        └─────────────────┘
```

---

## 5. Database Schema

### Entity Relationship Diagram Description

#### Tables

##### `users`
- `id` (UUID, PK) - Supabase Auth user ID
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `full_name` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

##### `trips`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `destination` (VARCHAR)
- `start_date` (DATE, NOT NULL)
- `end_date` (DATE, NOT NULL)
- `status` (ENUM: 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled')
- `expected_participants` (INTEGER)
- `budgeted_expenses` (DECIMAL)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

##### `customers`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `created_at` (TIMESTAMP)

##### `bookings`
- `id` (UUID, PK)
- `trip_id` (UUID, FK → trips.id)
- `customer_id` (UUID, FK → customers.id)
- `total_amount` (DECIMAL, NOT NULL)
- `status` (ENUM: 'pending', 'partial', 'paid', 'cancelled', 'refunded')
- `notes` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

##### `payments`
- `id` (UUID, PK)
- `booking_id` (UUID, FK → bookings.id)
- `amount` (DECIMAL, NOT NULL)
- `payment_type` (ENUM: 'advance', 'final', 'additional', 'refund')
- `payment_method` (VARCHAR) - cash, bank_transfer, upi, card
- `payment_date` (DATE, NOT NULL)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

##### `expense_categories`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `name` (VARCHAR, NOT NULL)
- `is_default` (BOOLEAN)
- `created_at` (TIMESTAMP)

Default categories: Transportation, Accommodation, Food & Meals, Guide/Staff Fees, Equipment, Marketing, Insurance, Permits & Fees, Miscellaneous

##### `expenses`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `trip_id` (UUID, FK → trips.id, NULLABLE) - NULL for general business expenses
- `category_id` (UUID, FK → expense_categories.id)
- `amount` (DECIMAL, NOT NULL)
- `description` (VARCHAR, NOT NULL)
- `expense_date` (DATE, NOT NULL)
- `vendor` (VARCHAR)
- `receipt_url` (VARCHAR) - Supabase Storage URL
- `is_paid` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

##### `withdrawals`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `amount` (DECIMAL, NOT NULL)
- `withdrawal_date` (DATE, NOT NULL)
- `notes` (TEXT)
- `created_at` (TIMESTAMP)

##### `fund_allocations`
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `operational_reserve_target` (DECIMAL) - Target amount to keep as operational reserve
- `updated_at` (TIMESTAMP)

### Relationships
- User → Trips (1:N)
- User → Customers (1:N)
- Trip → Bookings (1:N)
- Customer → Bookings (1:N)
- Booking → Payments (1:N)
- Trip → Expenses (1:N)
- User → Expenses (1:N)
- Category → Expenses (1:N)
- User → Withdrawals (1:N)

---

## 6. API Endpoints

### Authentication
Handled by Supabase Auth (magic link / email-password)

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get financial summary (total revenue, expenses, profit, withdrawable amount) |
| GET | `/api/dashboard/cash-flow` | Get cash flow projections for next 30/60/90 days |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List all trips (with filters: status, date range) |
| POST | `/api/trips` | Create new trip |
| GET | `/api/trips/:id` | Get trip details with bookings and expenses |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip (soft delete) |
| GET | `/api/trips/:id/profitability` | Get trip profitability analysis |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | List all customers |
| POST | `/api/customers` | Create new customer |
| GET | `/api/customers/:id` | Get customer details with booking history |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List all bookings (with filters) |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings/:id` | Get booking details with payments |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Cancel booking |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments (with filters) |
| POST | `/api/payments` | Record new payment |
| GET | `/api/payments/:id` | Get payment details |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |
| GET | `/api/payments/pending` | Get pending/expected payments |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List all expenses (with filters: trip, category, date) |
| POST | `/api/expenses` | Create new expense |
| GET | `/api/expenses/:id` | Get expense details |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |
| POST | `/api/expenses/:id/receipt` | Upload receipt |

### Expense Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List expense categories |
| POST | `/api/categories` | Create custom category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Withdrawals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/withdrawals` | List all withdrawals |
| POST | `/api/withdrawals` | Record new withdrawal |
| GET | `/api/withdrawals/:id` | Get withdrawal details |
| DELETE | `/api/withdrawals/:id` | Delete withdrawal |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly` | Monthly income/expense summary |
| GET | `/api/reports/trip-comparison` | Compare profitability across trips |
| GET | `/api/reports/category-breakdown` | Expense breakdown by category |

---

## 7. Key Calculations

### Withdrawable Profit
```
Withdrawable = Total Received Payments
             - Total Expenses
             - Operational Reserve Target
             - Total Withdrawals
```

### Operational Reserve
```
Required Reserve = Sum of (Budgeted Expenses for Upcoming Trips)
Available Reserve = Total Received - Total Expenses - Total Withdrawals
```

### Trip Profitability
```
Trip Revenue = Sum of all payments for trip bookings
Trip Expenses = Sum of all expenses assigned to trip
Trip Profit = Trip Revenue - Trip Expenses
Profit Margin = (Trip Profit / Trip Revenue) × 100
```

---

## 8. MVP Scope & Phases

### Phase 1 - MVP (4-6 weeks)
- User authentication
- Dashboard with financial summary
- Trip CRUD operations
- Customer management
- Booking and payment tracking
- Basic expense tracking
- Withdrawal recording
- Simple profit calculation

### Phase 2 - Enhanced (Post-MVP)
- Cash flow projections
- Receipt uploads
- Advanced reporting
- Data export (CSV)
- Email notifications for payment reminders

### Phase 3 - Future
- Multi-user access with roles
- Bank integrations
- Mobile app
- Multi-currency support

---

## 9. Success Metrics

- User can determine withdrawable profit within 30 seconds of login
- 100% of trips have associated expenses tracked
- Reduction in time spent on manual financial tracking by 50%
- Zero instances of over-withdrawal affecting operations

---

## 10. Open Questions

1. Should we support multiple payment installments beyond 50/50 split?
2. What notification preferences does the user need?
3. Should expenses support recurring entries?
4. Is there a need for customer communication features (payment reminders)?

---

## 11. Appendix

### Default Expense Categories
1. Transportation (vehicles, fuel, flights)
2. Accommodation (hotels, camps)
3. Food & Meals
4. Guide/Staff Fees
5. Equipment Rental
6. Marketing & Advertising
7. Insurance
8. Permits & Entry Fees
9. Office & Admin
10. Miscellaneous
