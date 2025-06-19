import { Customer } from './customer';
import { Order } from './order';

export interface Transaction {
  id: number;
  transaction_id: string;
  customer: number;
  customer_info?: Customer;
  order?: number;
  order_info?: Order;
  transaction_type: string;
  payment_method: string;
  status: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  currency: string;
  gateway_transaction_id?: string;
  gateway_response?: string;
  description?: string;
  notes?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}