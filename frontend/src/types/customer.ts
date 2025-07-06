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
	notes?: string; // 備註
	age?: number;
	gender?: "male" | "female" | "other" | "prefer_not_to_say";
	product_categories_interest?: string[]; // 產品偏好欄位
	seasonal_purchase_pattern?: "spring" | "summer" | "autumn" | "winter" | "year_round"; // 購買季節偏好欄位
	is_active: boolean;
	total_orders: number;
	total_spent: number | string;
	created_at: string;
	updated_at: string;
}
