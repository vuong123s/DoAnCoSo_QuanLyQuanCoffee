# ☕ Coffee Shop Frontend

Modern React frontend cho hệ thống quản lý quán cà phê với Vite, TailwindCSS và Zustand.

## 🛠️ Tech Stack

- **React 19** - Modern React với latest features
- **Vite** - Fast build tool và dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── layouts/       # Layout components
├── stores/        # Zustand stores
├── services/      # API services
├── hooks/         # Custom hooks
└── assets/        # Static assets
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run clean` | Clean cache and build files |

## 🌐 Environment Variables

Create `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Coffee Shop
```

## 📱 Features

- **Responsive Design** - Mobile-first approach
- **Admin Dashboard** - Complete management interface
- **Customer Portal** - User-friendly booking and ordering
- **Real-time Updates** - Live order tracking
- **Vietnamese Localization** - Full Vietnamese support
- **Role-based Access** - Different views for different roles

## 🔐 Authentication

Frontend supports role-based authentication:
- **Customer** - Menu browsing, booking, ordering
- **Staff** - Order management, table management
- **Manager** - Full dashboard access
- **Admin** - System administration

## 🧪 Development

```bash
# Clean project
npm run clean

# Fix linting issues
npm run lint:fix

# Check bundle size
npm run build && npx vite-bundle-analyzer dist
```

## 📚 Documentation

- **[Main Project](../README.md)** - Full project documentation
- **[API Documentation](../API_DOCUMENTATION.md)** - Backend API reference
- **[Quick Start](../QUICK_START.md)** - 5-minute setup guide

---

**Built with ❤️ using modern React ecosystem**
