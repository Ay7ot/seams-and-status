# Seams & Status - Tailor Management System

![Seams & Status Logo](https://via.placeholder.com/150x50?text=Seams+%26+Status)  
*Modern digital tool for tailors to manage customers, measurements, and orders*

## 📌 Overview
Seams & Status is a web-based tool designed to help independent tailors and small tailoring businesses digitize their workflow. It replaces manual record-keeping with an intuitive digital solution for:
- Customer management
- Measurement tracking
- Order lifecycle management
- Payment tracking

## ✨ Key Features

### 🔐 Authentication
- Staff login via email/password
- Protected routes using Next.js middleware

### 👔 Customer Management
- Create/edit customer profiles (name, contact, gender)
- View measurement history
- Copy past measurements to new orders

### 📏 Measurement Forms
- Gender-specific measurement fields:
  - *Women*: shoulder, bust, waist, hip, length, etc.
  - *Men*: shoulder, bust, waist, hip, sleeve, etc.
- Numeric validation for all inputs

### 🧵 Order Lifecycle
- Create orders linked to customers & measurements
- Track order status:
  - New → In Progress → Ready for Fitting → Collected
- Set fitting dates
- Mark orders as collected

### 💰 Payment Tracking
- Record initial deposits
- Add subsequent payments
- Automatic balance calculation

## 🛠️ Technical Stack

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: CSS Modules with design system
- **State Management**: React Context + Firebase Auth
- **Animation**: Custom CSS animations

### Backend
- **Authentication**: Firebase Auth (Email/Password + Google)
- **Database**: Firestore with strict security rules
- **Storage**: Firebase Storage

### Dev Tools
- TypeScript
- PostCSS
- Git submodules for multi-app structure

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Firebase project with Auth and Firestore enabled
- Environment variables configured in `.env.local`

### Installation
```bash
# Clone repository
git clone https://github.com/your-repo/seams-and-status.git
cd seams-and-status

# Install dependencies for main app
cd main-app
npm install

# Install dependencies for marketing app
cd ../marketing-app
npm install
```

### Configuration
1. Create `.env.local` in `main-app` with your Firebase config:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
# ... other firebase config
```

2. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

### Running Locally
```bash
# Start main app (port 3000)
cd main-app
npm run dev

# Start marketing app (port 3001)
cd ../marketing-app
npm run dev
```

## 📂 Project Structure
```
seams-and-status/
├── main-app/          # Core application
│   ├── app/           # App router routes
│   ├── components/    # Reusable components
│   ├── lib/           # Firebase/auth utilities
│   └── styles/        # CSS modules
├── marketing-app/     # Marketing website
└── firestore.rules    # Security rules
```

## 📜 Firestore Schema
```text
customers/{customerId}:
  name: string
  contact: string
  gender: "men" or "women"
  measurementHistory: [{ measurementId, date }]

measurements/{measurementId}:
  customerId: ref
  gender: string
  values: { shoulder, bust, waist, hip, ... }
  createdAt: timestamp

orders/{orderId}:
  customerId: ref
  measurementId: ref
  style: string
  arrivalDate: date
  fittingDate: date | null
  materialCost: number
  initialPayment: number
  status: string
  collected: boolean

payments/{paymentId}:
  orderId: ref
  amount: number
  date: date
  note: string | null
```

## 🎨 Design System
- **Primary Font**: Inter
- **Logo Font**: Imperial Script with gradient
- **Color Palette**: Professional blues and neutrals
- **Responsive**: Mobile-first with desktop adaptations

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/) 

For more details, see the [PRD](./seams&status.md). 