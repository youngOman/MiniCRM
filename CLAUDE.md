# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CRM (Customer Relationship Management) system built with Django REST Framework backend. The project is designed to manage customer data, track transactions, and handle membership programs through an interactive dashboard.

## Architecture

### Backend Structure
- **Django REST Framework** API with SQLite database
- **Three main Django apps:**
  - `customers/` - Customer management with tags, sources, and comprehensive profiles
  - `transactions/` - Transaction tracking with categories, items, and payment methods
  - `memberships/` - Membership tiers and loyalty program management

### Key Models & Relationships
- **Customer** → **Transaction** (one-to-many): Customers can have multiple transactions
- **Customer** → **Membership** (one-to-one): Each customer can have one membership
- **Transaction** → **TransactionItem** (one-to-many): Transactions can have multiple line items
- **Membership** → **MembershipTier** (foreign key): Memberships are assigned to tiers based on spending
- **MembershipHistory** tracks tier changes automatically

### Business Logic
- Customers automatically get assigned to membership tiers based on `total_spent`
- Transaction totals are calculated automatically (`amount + tax_amount - discount_amount`)
- Membership points balance is calculated as `points_earned - points_redeemed`
- Unique IDs are auto-generated for transactions (`TXN-`) and memberships (`MEM-`)

## Development Commands

### Django Management
```bash
# Run development server
python manage.py runserver

# Database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

### Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt
```

## API Structure

### Authentication
- Uses Django REST Framework's SessionAuthentication and TokenAuthentication
- All endpoints require authentication by default
- CORS configured for React frontend on ports 3000 and 5173

### Endpoints
- `/api/customers/` - Customer CRUD operations
- `/api/transactions/` - Transaction management
- `/api/memberships/` - Membership operations
- `/admin/` - Django admin interface

### Filtering & Pagination
- All viewsets support filtering, searching, and ordering
- Default pagination: 20 items per page
- Uses django-filter for advanced filtering capabilities

## Configuration

### Environment Variables
- `SECRET_KEY` - Django secret key (defaults to insecure key for development)
- `DEBUG` - Debug mode (defaults to True)

### CORS Settings
- Configured for React development servers on localhost:3000, 127.0.0.1:3000, localhost:5173, 127.0.0.1:5173
- Credentials allowed for session authentication

## Notes

- Database uses SQLite for development
- Media files stored in `media/` directory
- Static files collected to `staticfiles/`
- All models include audit fields (`created_by`, `updated_by`, `created_at`, `updated_at`)
- Comprehensive indexing on frequently queried fields for performance