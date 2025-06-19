export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  source: string;
  tags?: string;
  notes?: string;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}