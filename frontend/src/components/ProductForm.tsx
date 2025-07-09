import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product, Category, Brand, Supplier } from "../types/product";
import { AxiosError } from "axios";
import api from "../services/api";

interface ProductFormProps {
	mode: "create" | "edit";
}

const ProductForm: React.FC<ProductFormProps> = ({ mode }) => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [product, setProduct] = useState<Product | null>(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		sku: "",
		category: "",
		brand: "",
		supplier: "",
		base_price: "",
		cost_price: "",
		weight: "",
		dimensions: "",
		image_url: "",
		is_active: true,
		is_digital: false,
		tax_rate: "5.00",
		min_order_quantity: "1",
		tags: [] as string[],
	});

	const [categories, setCategories] = useState<Category[]>([]);
	const [brands, setBrands] = useState<Brand[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [tagInput, setTagInput] = useState("");

	// 載入產品資料（編輯模式）
	useEffect(() => {
		if (mode === "edit" && id) {
			const fetchProduct = async () => {
				try {
					const response = await api.get<Product>(`/products/products/${id}/`);
					setProduct(response.data);
				} catch (error) {
					console.error("載入產品資料失敗:", error);
					navigate("/products");
				}
			};
			fetchProduct();
		}
	}, [mode, id, navigate]);

	// 載入表單數據
	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name || "",
				description: product.description || "",
				sku: product.sku || "",
				category: product.category?.id?.toString() || "",
				brand: product.brand?.id?.toString() || "",
				supplier: product.supplier?.id?.toString() || "",
				base_price: product.base_price || "",
				cost_price: product.cost_price || "",
				weight: product.weight || "",
				dimensions: product.dimensions || "",
				image_url: product.image_url || "",
				is_active: product.is_active ?? true,
				is_digital: product.is_digital ?? false,
				tax_rate: product.tax_rate || "5.00",
				min_order_quantity: product.min_order_quantity?.toString() || "1",
				tags: product.tags || [],
			});
		}
	}, [product]);

	// 載入選項數據
	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const [categoriesRes, brandsRes, suppliersRes] = await Promise.all([
					api.get("/products/categories/?is_active=true"), 
					api.get("/products/brands/?is_active=true"), 
					api.get("/products/suppliers/?is_active=true")
				]);

				// 確保資料是陣列格式
				setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.results || []);
				setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : brandsRes.data?.results || []);
				setSuppliers(Array.isArray(suppliersRes.data) ? suppliersRes.data : suppliersRes.data?.results || []);
			} catch (error) {
				console.error("載入選項數據失敗:", error);
				// 設定空陣列作為預設值
				setCategories([]);
				setBrands([]);
				setSuppliers([]);
			}
		};

		fetchOptions();
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;

		if (type === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			setFormData((prev) => ({
				...prev,
				[name]: checked,
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}

		// 清除該欄位的錯誤
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleTagAdd = () => {
		if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...prev.tags, tagInput.trim()],
			}));
			setTagInput("");
		}
	};

	const handleTagRemove = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((tag) => tag !== tagToRemove),
		}));
	};

	const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleTagAdd();
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "產品名稱為必填項目";
		}

		if (!formData.sku.trim()) {
			newErrors.sku = "SKU為必填項目";
		}

		if (!formData.category) {
			newErrors.category = "產品分類為必填項目";
		}

		if (!formData.brand) {
			newErrors.brand = "品牌為必填項目";
		}

		if (!formData.supplier) {
			newErrors.supplier = "供應商為必填項目";
		}

		if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
			newErrors.base_price = "售價必須大於0";
		}

		if (!formData.cost_price || parseFloat(formData.cost_price) <= 0) {
			newErrors.cost_price = "成本價必須大於0";
		}

		if (parseFloat(formData.base_price) <= parseFloat(formData.cost_price)) {
			newErrors.base_price = "售價必須大於成本價";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);
		setErrors({});

		try {
			const submitData = {
				...formData,
				category: parseInt(formData.category),
				brand: parseInt(formData.brand),
				supplier: parseInt(formData.supplier),
				base_price: parseFloat(formData.base_price).toFixed(2),
				cost_price: parseFloat(formData.cost_price).toFixed(2),
				tax_rate: parseFloat(formData.tax_rate).toFixed(2),
				min_order_quantity: parseInt(formData.min_order_quantity),
				weight: formData.weight ? parseFloat(formData.weight) : null,
				dimensions: formData.dimensions || null,
				image_url: formData.image_url || null,
				description: formData.description || null,
			};

			if (mode === "edit" && id) {
				await api.put(`/products/products/${id}/`, submitData);
			} else {
				await api.post("/products/products/", submitData);
			}

			navigate(mode === "edit" ? `/products/${id}` : "/products");
		} catch (error) {
			console.error("提交失敗:", error);

			if (error instanceof AxiosError && error.response?.data) {
				const apiErrors = error.response.data;
				if (typeof apiErrors === "object" && apiErrors !== null) {
					setErrors(apiErrors);
				} else {
					setErrors({ general: "提交失敗，請稍後再試" });
				}
			} else {
				setErrors({ general: "提交失敗，請稍後再試" });
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (mode === "edit" && id) {
			navigate(`/products/${id}`);
		} else {
			navigate("/products");
		}
	};

	return (
		<div className='container mx-auto px-4 py-6'>
			<div className='max-w-4xl mx-auto'>
				{/* Header */}
				<div className='mb-6'>
					<h1 className='text-2xl font-bold text-gray-900'>{mode === "edit" ? "編輯產品" : "新增產品"}</h1>
					<p className='text-gray-600 mt-2'>{mode === "edit" ? "編輯產品資訊" : "填寫以下資訊來新增產品"}</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='bg-white rounded-lg shadow p-6'>
						<h2 className='text-lg font-semibold text-gray-900 mb-4'>基本資訊</h2>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{/* 產品名稱 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>產品名稱 *</label>
								<input type='text' name='name' value={formData.name} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`} placeholder='輸入產品名稱' />
								{errors.name && <p className='mt-1 text-sm text-red-600'>{errors.name}</p>}
							</div>

							{/* SKU */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>SKU *</label>
								<input type='text' name='sku' value={formData.sku} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sku ? "border-red-500" : "border-gray-300"}`} placeholder='輸入商品編號' />
								{errors.sku && <p className='mt-1 text-sm text-red-600'>{errors.sku}</p>}
							</div>

							{/* 分類 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>產品分類 *</label>
								<select name='category' value={formData.category} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category ? "border-red-500" : "border-gray-300"}`}>
									<option value=''>請選擇分類</option>
									{Array.isArray(categories) && categories.map((category) => (
										<option key={category.id} value={category.id}>
											{category.name}
										</option>
									))}
								</select>
								{errors.category && <p className='mt-1 text-sm text-red-600'>{errors.category}</p>}
							</div>

							{/* 品牌 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>品牌 *</label>
								<select name='brand' value={formData.brand} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.brand ? "border-red-500" : "border-gray-300"}`}>
									<option value=''>請選擇品牌</option>
									{Array.isArray(brands) && brands.map((brand) => (
										<option key={brand.id} value={brand.id}>
											{brand.name}
										</option>
									))}
								</select>
								{errors.brand && <p className='mt-1 text-sm text-red-600'>{errors.brand}</p>}
							</div>

							{/* 供應商 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>供應商 *</label>
								<select name='supplier' value={formData.supplier} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.supplier ? "border-red-500" : "border-gray-300"}`}>
									<option value=''>請選擇供應商</option>
									{Array.isArray(suppliers) && suppliers.map((supplier) => (
										<option key={supplier.id} value={supplier.id}>
											{supplier.name}
										</option>
									))}
								</select>
								{errors.supplier && <p className='mt-1 text-sm text-red-600'>{errors.supplier}</p>}
							</div>

							{/* 產品描述 */}
							<div className='md:col-span-2'>
								<label className='block text-sm font-medium text-gray-700 mb-1'>產品描述</label>
								<textarea name='description' value={formData.description} onChange={handleInputChange} rows={3} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='輸入產品描述' />
							</div>
						</div>
					</div>

					{/* 價格資訊 */}
					<div className='bg-white rounded-lg shadow p-6'>
						<h2 className='text-lg font-semibold text-gray-900 mb-4'>價格資訊</h2>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
							{/* 售價 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>售價 *</label>
								<input
									type='number'
									name='base_price'
									value={formData.base_price}
									onChange={handleInputChange}
									step='0.01'
									min='0'
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.base_price ? "border-red-500" : "border-gray-300"}`}
									placeholder='0.00'
								/>
								{errors.base_price && <p className='mt-1 text-sm text-red-600'>{errors.base_price}</p>}
							</div>

							{/* 成本價 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>成本價 *</label>
								<input
									type='number'
									name='cost_price'
									value={formData.cost_price}
									onChange={handleInputChange}
									step='0.01'
									min='0'
									className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.cost_price ? "border-red-500" : "border-gray-300"}`}
									placeholder='0.00'
								/>
								{errors.cost_price && <p className='mt-1 text-sm text-red-600'>{errors.cost_price}</p>}
							</div>

							{/* 稅率 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>稅率 (%)</label>
								<input type='number' name='tax_rate' value={formData.tax_rate} onChange={handleInputChange} step='0.01' min='0' max='100' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
							</div>
						</div>
					</div>

					{/* 產品屬性 */}
					<div className='bg-white rounded-lg shadow p-6'>
						<h2 className='text-lg font-semibold text-gray-900 mb-4'>產品屬性</h2>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							{/* 重量 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>重量 (g)</label>
								<input type='number' name='weight' value={formData.weight} onChange={handleInputChange} step='0.01' min='0' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='輸入重量' />
							</div>

							{/* 尺寸 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>尺寸 (長x寬x高)</label>
								<input type='text' name='dimensions' value={formData.dimensions} onChange={handleInputChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='例: 10x5x3' />
							</div>

							{/* 最小訂購量 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>最小訂購量</label>
								<input type='number' name='min_order_quantity' value={formData.min_order_quantity} onChange={handleInputChange} min='1' className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' />
							</div>

							{/* 圖片網址 */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-1'>圖片網址</label>
								<input type='url' name='image_url' value={formData.image_url} onChange={handleInputChange} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='https://example.com/image.jpg' />
							</div>
						</div>

						{/* 標籤 */}
						<div className='mt-6'>
							<label className='block text-sm font-medium text-gray-700 mb-1'>產品標籤</label>
							<div className='flex flex-wrap gap-2 mb-2'>
								{formData.tags.map((tag, index) => (
									<span key={index} className='inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
										{tag}
										<button type='button' onClick={() => handleTagRemove(tag)} className='ml-1 text-blue-600 hover:text-blue-800'>
											×
										</button>
									</span>
								))}
							</div>
							<div className='flex gap-2'>
								<input type='text' value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='輸入標籤並按 Enter' />
								<button type='button' onClick={handleTagAdd} className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600'>
									新增
								</button>
							</div>
						</div>

						{/* 狀態開關 */}
						<div className='mt-6 space-y-4'>
							<div className='flex items-center'>
								<input type='checkbox' id='is_active' name='is_active' checked={formData.is_active} onChange={handleInputChange} className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded' />
								<label htmlFor='is_active' className='ml-2 block text-sm text-gray-900'>
									啟用產品
								</label>
							</div>

							<div className='flex items-center'>
								<input type='checkbox' id='is_digital' name='is_digital' checked={formData.is_digital} onChange={handleInputChange} className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded' />
								<label htmlFor='is_digital' className='ml-2 block text-sm text-gray-900'>
									數位產品
								</label>
							</div>
						</div>
					</div>

					{/* 錯誤訊息 */}
					{errors.general && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<p className='text-sm text-red-600'>{errors.general}</p>
						</div>
					)}

					{/* 按鈕 */}
					<div className='flex justify-end space-x-4'>
						<button type='button' onClick={handleCancel} className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
							取消
						</button>
						<button type='submit' disabled={loading} className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'>
							{loading ? "儲存中..." : mode === "edit" ? "更新產品" : "新增產品"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProductForm;
