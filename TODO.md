# Nomadura Financial Management - Technical Tasks

## Phase 1: MVP (Login, Dashboard, Trips)

### Setup (Repo, Dependencies, DB Connection)

- [x] [MVP] Initialize Next.js 14+ project with App Router
- [x] [MVP] Configure Tailwind CSS
- [x] [MVP] Install and configure shadcn/ui components
- [x] [MVP] Set up Supabase project and obtain credentials
- [x] [MVP] Configure environment variables (.env.local)
- [x] [MVP] Install Supabase client library
- [x] [MVP] Create database connection utility
- [x] [MVP] Generate TypeScript types from Supabase schema
- [x] [MVP] Install React Query (TanStack Query)
- [x] [MVP] Install React Hook Form + Zod
- [x] [MVP] Install Recharts for data visualization

### Authentication

- [x] [MVP] Configure Supabase Auth (email/password)
- [x] [MVP] Create auth middleware for protected routes
- [x] [MVP] Implement login page
- [x] [MVP] Implement signup page
- [x] [MVP] Add logout functionality
- [x] [MVP] Create auth context/provider

### Database Schema

- [x] [MVP] Create `users` table with RLS policies
- [x] [MVP] Create `trips` table with status enum
- [x] [MVP] Set up Row Level Security (RLS) for all tables

### API Routes - Trips

- [x] [MVP] GET `/api/trips` - List trips with filters
- [x] [MVP] POST `/api/trips` - Create trip
- [x] [MVP] GET `/api/trips/:id` - Get trip details
- [x] [MVP] PUT `/api/trips/:id` - Update trip
- [x] [MVP] DELETE `/api/trips/:id` - Delete trip

### API Routes - Dashboard

- [ ] [MVP] GET `/api/dashboard/summary` - Basic stats (total trips, upcoming, completed)

### Frontend - Layout & Navigation

- [x] [MVP] Create root layout with providers
- [x] [MVP] Build sidebar navigation component
- [x] [MVP] Create header with user menu
- [x] [MVP] Build responsive mobile navigation
- [x] [MVP] Create loading and error states

### Frontend - Dashboard Page

- [ ] [MVP] Build dashboard page layout
- [ ] [MVP] Create summary cards (total trips, upcoming, completed)
- [ ] [MVP] Show recent trips list
- [ ] [MVP] Display upcoming trips

### Frontend - Trips Module

- [x] [MVP] Create trips list page with filters
- [x] [MVP] Build trip card component
- [x] [MVP] Create trip form (create/edit)
- [x] [MVP] Build trip detail page
- [x] [MVP] Add trip status change functionality

### Frontend - Shared Components

- [x] [MVP] Create data table component with sorting/filtering
- [x] [MVP] Build form field components with validation
- [x] [MVP] Create modal/dialog components
- [x] [MVP] Build date picker component
- [x] [MVP] Build status badge components

### Data Visualization

- [ ] [MVP] Trips by status bar chart
- [ ] [MVP] Trips timeline/calendar view

---

## Phase 2: Financial Tracking

### Database Schema
- [ ] Create `customers` table
- [ ] Create `bookings` table with status enum
- [ ] Create `payments` table with payment_type enum
- [ ] Create `expense_categories` table with defaults
- [ ] Create `expenses` table
- [ ] Create `withdrawals` table
- [ ] Create `fund_allocations` table

### API Routes - Customers
- [ ] GET `/api/customers` - List customers
- [ ] POST `/api/customers` - Create customer
- [ ] GET `/api/customers/:id` - Get customer details
- [ ] PUT `/api/customers/:id` - Update customer

### API Routes - Bookings
- [ ] GET `/api/bookings` - List bookings
- [ ] POST `/api/bookings` - Create booking
- [ ] GET `/api/bookings/:id` - Get booking with payments
- [ ] PUT `/api/bookings/:id` - Update booking

### API Routes - Payments
- [ ] GET `/api/payments` - List payments
- [ ] POST `/api/payments` - Record payment
- [ ] GET `/api/payments/:id` - Get payment details

### API Routes - Expenses
- [ ] GET `/api/expenses` - List expenses with filters
- [ ] POST `/api/expenses` - Create expense
- [ ] GET `/api/expenses/:id` - Get expense details
- [ ] PUT `/api/expenses/:id` - Update expense

### API Routes - Withdrawals
- [ ] GET `/api/withdrawals` - List withdrawals
- [ ] POST `/api/withdrawals` - Record withdrawal

### Frontend - Customers Module
- [ ] Create customers list page
- [ ] Build customer form (create/edit)
- [ ] Create customer detail page

### Frontend - Bookings Module
- [ ] Create bookings list page with filters
- [ ] Build booking form (create/edit)
- [ ] Create booking detail page
- [ ] Display payment history on booking
- [ ] Build payment recording form

### Frontend - Expenses Module
- [ ] Create expenses list page with filters
- [ ] Build expense form (create/edit)
- [ ] Add category selector component
- [ ] Add trip selector component

### Frontend - Withdrawals Module
- [ ] Create withdrawals list page
- [ ] Build withdrawal form

### Dashboard Enhancements
- [ ] Financial summary cards (revenue, expenses, profit)
- [ ] Withdrawable profit card
- [ ] Operational reserves card
- [ ] Revenue vs Expenses chart
- [ ] Profit trend line chart

---

## Phase 3: Advanced Features

- [ ] Trip profitability analysis
- [ ] Cash flow projections
- [ ] Receipt uploads (Supabase Storage)
- [ ] Advanced reporting
- [ ] Data export (CSV)
- [ ] Email notifications

---

## Priority Summary

**Phase 1 MVP:** ~35 tasks
- Authentication (login/signup/logout)
- Dashboard with trip stats
- Complete trips CRUD
- Basic charts

**Phase 2:** ~40 tasks
- Customers, Bookings, Payments
- Expenses, Withdrawals
- Financial dashboard

**Phase 3:** ~10 tasks
- Advanced analytics and reporting
