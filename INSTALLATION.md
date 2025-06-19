# CRM Dashboard Installation Guide

This guide will help you set up the CRM Dashboard system with Django backend and React frontend.

## Prerequisites

- Python 3.8+ 
- Node.js 16+
- npm or yarn

## Backend Setup (Django)

### 1. Activate Virtual Environment
```bash
source crm_venv/bin/activate
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Database Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser
```bash
python manage.py createsuperuser
# Use: admin / admin@example.com / admin123
```

### 5. Create Sample Data (Optional)
```bash
python manage.py create_sample_data
```

### 6. Start Django Development Server
```bash
python manage.py runserver
```

The Django API will be available at: http://localhost:8000

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The React app will be available at: http://localhost:5173

## Usage

1. Access the React frontend at http://localhost:5173
2. Login with credentials: `admin` / `admin123`
3. Navigate through the dashboard:
   - **Customers**: View and manage customer data
   - **Orders**: Track customer orders and their status
   - **Transactions**: Monitor financial transactions

## API Endpoints

### Authentication
- `POST /api/auth/login/` - Login (get JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token

### Customers
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - Get customer details
- `PUT /api/customers/{id}/` - Update customer
- `DELETE /api/customers/{id}/` - Delete customer

### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order
- `GET /api/orders/{id}/` - Get order details
- `PUT /api/orders/{id}/` - Update order
- `DELETE /api/orders/{id}/` - Delete order

### Transactions
- `GET /api/transactions/` - List transactions
- `POST /api/transactions/` - Create transaction
- `GET /api/transactions/{id}/` - Get transaction details
- `PUT /api/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/{id}/` - Delete transaction

## Features

### Backend Features
- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Full CRUD operations for all models
- **Filtering & Search**: Advanced filtering and search capabilities
- **Pagination**: Efficient data pagination
- **Admin Interface**: Django admin for backend management

### Frontend Features
- **Modern UI**: Clean, professional interface with TailwindCSS
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Live data fetching and updates
- **Search & Filter**: Client-side search and filtering
- **JWT Integration**: Automatic token management and refresh

## Project Structure

```
react-ts-crm/
├── crm_backend/           # Django project settings
├── crm_venv/             # Python virtual environment
├── customers/            # Customer management app
├── orders/               # Order management app
├── transactions/         # Transaction management app
├── frontend/             # React TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
├── manage.py             # Django management script
└── requirements.txt      # Python dependencies
```

## Technology Stack

### Backend
- **Django 4.2.7**: Web framework
- **Django REST Framework**: API framework
- **JWT**: Authentication
- **SQLite**: Database (development)
- **Django CORS Headers**: Cross-origin requests

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **TailwindCSS**: Styling framework
- **React Router**: Client-side routing
- **Axios**: HTTP client

## Development Notes

- Backend runs on port 8000
- Frontend runs on port 5173
- CORS is configured for development
- JWT tokens expire after 1 hour
- Refresh tokens expire after 7 days
- All API endpoints require authentication except login