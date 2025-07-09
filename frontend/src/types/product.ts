export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  credit_limit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category: Category;
  brand: Brand;
  supplier: Supplier;
  category_name?: string;
  brand_name?: string;
  supplier_name?: string;
  base_price: string;
  cost_price: string;
  is_active: boolean;
  is_digital: boolean;
  weight?: string;
  dimensions?: string;
  image_url?: string;
  tax_rate?: string;
  min_order_quantity?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product: number;
  name: string;
  sku: string;
  price: string;
  cost_price: string;
  is_active: boolean;
  weight?: string;
  dimensions?: string;
  created_at: string;
  updated_at: string;
}

export interface Inventory {
  id: number;
  product: number;
  variant?: number;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_level: number;
  max_stock_level: number;
  location?: string;
  last_updated: string;
}

export interface StockMovement {
  id: number;
  product: number;
  variant?: number;
  movement_type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by?: number;
  created_at: string;
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  total_categories: number;
  total_brands: number;
  total_suppliers: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_inventory_value: string;
}