import { Customer } from './customer';

export interface OrderItem {
  id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number | string;
  total_price: number | string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  customer_info?: Customer;
  status: string;
  order_date: string;
  subtotal: number | string;
  tax_amount: number | string;
  shipping_amount: number | string;
  discount_amount: number | string;
  total: number | string;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}