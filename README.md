# Spend Wise - Smart Expense Tracker

A full-featured personal finance application with **mobile** and **web** platforms, powered by AI insights to help you track expenses, manage budgets, and grow your savings. Built as a monorepo with a shared Convex backend.

## Screenshots

### Authentication
<p align="center">
  <img src="screenshots/sign-up.png" width="250" alt="Sign Up" />
  <img src="screenshots/sign-in.png" width="250" alt="Sign In" />
</p>

### Dashboard
<p align="center">
  <img src="screenshots/dashboard.png" width="250" alt="Dashboard" />
</p>

### Expense Tracking
<p align="center">
  <img src="screenshots/add-expense.png" width="250" alt="Add Expense" />
</p>

### AI Insights & Analytics
<p align="center">
  <img src="screenshots/insights.png" width="250" alt="AI Insights" />
</p>

### Savings Management
<p align="center">
  <img src="screenshots/savings.png" width="250" alt="Savings Overview" />
  <img src="screenshots/add-account-type.png" width="250" alt="Add Account Type" />
</p>
<p align="center">
  <img src="screenshots/select-bank-digital.png" width="250" alt="Select Digital Bank" />
  <img src="screenshots/select-bank-traditional.png" width="250" alt="Select Traditional Bank & E-Wallets" />
</p>

### Budget Management
<p align="center">
  <img src="screenshots/budget-empty.png" width="250" alt="Budget Setup" />
  <img src="screenshots/create-budget.png" width="250" alt="Create Budget" />
  <img src="screenshots/budget-overview.png" width="250" alt="Budget Overview" />
</p>

### Settings
<p align="center">
  <img src="screenshots/settings.png" width="250" alt="Settings" />
</p>

## Features

### Expense Tracking
- Add, edit, and delete expenses with amount, description, date, and notes
- **AI-powered category auto-detection** - automatically suggests a category based on your expense description
- 12 built-in categories: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Personal Care, Groceries, Subscriptions, and Other
- Create custom categories with your own icons and colors
- Calendar view with daily spending indicators
- List view sorted by date
- Link expenses to savings accounts for tracking withdrawals

### Savings Management
- Track multiple savings accounts across 23+ banks and e-wallets
- Supported institutions include BPI, BDO, Metrobank, Maya Bank, GCash, Tonik, SeaBank, and more
- Record deposits, withdrawals, and interest transactions
- View total balance across all accounts with privacy toggle (hide amounts)
- Track interest rates and maturity dates for time deposits
- Detailed transaction history per account

### Budget Management
- Set an overall monthly spending budget
- Create category-specific budgets (e.g., limit Food & Dining to a set amount)
- Visual progress bars showing budget utilization
- Dashboard integration showing budget status at a glance

### AI-Powered Insights
- **Smart Category Detection** - uses OpenAI GPT-4o-mini to auto-categorize expenses based on description
- **Spending Pattern Analysis** - identifies trends and recurring expenses
- **Budget Predictions** - forecasts next month's spending with confidence levels
- **Actionable Tips** - AI-generated savings suggestions based on your habits
- Insights auto-expire after 7 days to stay fresh and relevant

### Analytics & Charts
- Spending by category breakdown with percentage bars
- 6-month spending trend chart
- Monthly spending summary with transaction count
- Average, highest, and total spending stats

### Dashboard
- Personalized greeting with current date
- Monthly spending summary card
- Recent expenses quick view
- Quick-add floating action button (mobile) / button (web)

### Settings & Personalization
- Dark mode support
- Multi-currency support: PHP, USD, EUR, GBP, JPY, CAD, AUD
- Edit display name
- Haptic feedback throughout the mobile app

## Tech Stack

### Shared
| Technology | Purpose |
|---|---|
| **Convex** | Real-time backend database & serverless functions |
| **Clerk** | Authentication (email/password with verification) |
| **OpenAI GPT-4o-mini** | AI categorization & financial insights |
| **TypeScript** | Type-safe codebase |

### Mobile (`apps/mobile/`)
| Technology | Purpose |
|---|---|
| **React Native + Expo** | Cross-platform mobile framework |
| **Expo Router** | File-based navigation |
| **Victory Native** | Charts and data visualization |

### Web (`apps/web/`)
| Technology | Purpose |
|---|---|
| **React 19** | Web UI framework |
| **Vite** | Build tool and dev server |
| **Redux Toolkit** | Client-side state management (theme, UI) |
| **React Router v7** | Client-side routing |
| **Tailwind CSS v4** | Utility-first styling |
| **Recharts** | Charts and data visualization |
| **Lucide React** | Icon library |

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Expo CLI (for mobile development)
- iOS Simulator or Android Emulator (or Expo Go on a physical device)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/spend-wise.git
   cd spend-wise
   ```

2. Install dependencies (npm workspaces will install for all apps)

   ```bash
   npm install
   ```

3. Set up environment variables

   Create a `.env` file in the root directory:

   ```env
   # Mobile (Expo)
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   EXPO_PUBLIC_CONVEX_URL=your_convex_url
   CLERK_SECRET_KEY=your_clerk_secret_key
   GITHUB_TOKEN=your_github_token

   # Web (Vite)
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_CONVEX_URL=your_convex_url
   ```

4. Start the Convex development server

   ```bash
   npm run dev:convex
   ```

5. Start the web app

   ```bash
   npm run dev:web
   ```

6. Start the mobile app (in a separate terminal)

   ```bash
   npm run dev:mobile
   ```

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web (Expo web)

## Project Structure

```
spend-wise/
├── apps/
│   ├── mobile/                 # React Native + Expo mobile app
│   │   ├── app/                # Screens & navigation (file-based routing)
│   │   │   ├── (auth)/         # Sign in & sign up screens
│   │   │   ├── (tabs)/         # Main tab screens
│   │   │   │   ├── index.tsx   # Dashboard
│   │   │   │   ├── expenses/   # Expense list, calendar, add, edit
│   │   │   │   ├── insights.tsx# AI insights & charts
│   │   │   │   ├── savings/    # Savings overview, detail, transactions
│   │   │   │   ├── budget.tsx  # Budget management
│   │   │   │   └── settings.tsx# App settings
│   │   │   └── _layout.tsx     # Root layout with auth & providers
│   │   ├── components/         # React Native UI components
│   │   ├── constants/          # Theme, bank logos
│   │   ├── hooks/              # Custom hooks (color scheme, theme)
│   │   ├── utils/              # Utility functions
│   │   └── assets/             # Images, icons & fonts
│   │
│   └── web/                    # React.js web application
│       └── src/
│           ├── pages/          # Page components
│           │   ├── Dashboard.tsx
│           │   ├── Expenses.tsx
│           │   ├── Insights.tsx
│           │   ├── Savings.tsx
│           │   ├── Budget.tsx
│           │   ├── Settings.tsx
│           │   └── ...         # Add/edit/detail pages
│           ├── components/     # Web UI components
│           │   ├── layout/     # Sidebar, Header, AppLayout
│           │   ├── charts/     # Recharts components
│           │   ├── ui/         # Button, Card, Input, Modal
│           │   └── ...         # Feature components
│           ├── store/          # Redux Toolkit store & slices
│           ├── hooks/          # Custom hooks
│           ├── router.tsx      # React Router configuration
│           └── App.tsx         # Providers (Clerk, Convex, Redux)
│
├── packages/
│   └── shared/                 # Shared code between mobile & web
│       └── src/
│           ├── format-currency.ts  # Currency formatting utilities
│           ├── constants.ts        # Currencies, colors, category icons
│           ├── types.ts            # Shared TypeScript types
│           └── index.ts            # Barrel export
│
├── convex/                     # Backend (shared by both apps)
│   ├── schema.ts               # Database schema (7 tables)
│   ├── expenses.ts             # Expense CRUD & analytics
│   ├── budgets.ts              # Budget management
│   ├── savings.ts              # Savings accounts & transactions
│   ├── ai.ts                   # AI categorization & insights
│   ├── insights.ts             # Insights storage & retrieval
│   ├── banks.ts                # Bank data & seeding
│   ├── categories.ts           # Category management
│   └── auth.ts                 # User authentication helpers
│
├── package.json                # Workspace root (npm workspaces)
└── tsconfig.base.json          # Shared TypeScript config
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev:web` | Start the web app dev server |
| `npm run dev:mobile` | Start the Expo mobile app |
| `npm run dev:convex` | Start the Convex backend dev server |
| `npm run build:web` | Build the web app for production |

## License

This project is for personal use.
