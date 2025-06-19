import { Customer } from './customer';

export interface OrderItem {
  id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total: number;
  shipping_address?: string;
  billing_address?: string;
  notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}