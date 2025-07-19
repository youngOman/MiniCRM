import React, { useState, useEffect, useCallback } from "react";
import { Customer } from "../types/customer";
import { PaginatedResponse } from "../types/common";
import api from "../services/api";
import CustomerForm from "./CustomerForm";
import CustomerDetail from "./CustomerDetail";
import CustomerImport from "./CustomerImport";

type ViewMode = "list" | "form" | "detail" | "import";

const CustomerList: React.FC = () => {
	const [customers, setCustomers] = useState<Customer[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	// 搜尋功能相關狀態
	const [searchTerm, setSearchTerm] = useState(""); // 使用者輸入的搜尋關鍵字
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // 延遲處理後的搜尋關鍵字

	// 排序功能相關狀態
	const [sortBy, setSortBy] = useState(""); // 使用者選擇的排序方式
	const [debouncedSortBy, setDebouncedSortBy] = useState(""); // 延遲處理後的排序方式
	const [pagination, setPagination] = useState({
		count: 0,
		next: null as string | null,
		previous: null as string | null,
	});
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

	// 搜尋防抖處理：避免使用者每打一個字就發送 API 請求
	// 當使用者停止輸入 500ms 後才真正執行搜尋
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500); // 等待 500 毫秒

		// 清理函數：如果使用者在 500ms 內又輸入新字元，就取消前一次的計時器
		return () => {
			clearTimeout(handler);
		};
	}, [searchTerm]);

	// 排序防抖處理：避免下拉選單快速切換時發送過多 API 請求
	// 排序選擇後 300ms 才執行，比搜尋快一點因為通常不會頻繁切換
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSortBy(sortBy);
		}, 300); // 等待 300 毫秒

		// 清理函數：取消前一次的排序計時器
		return () => {
			clearTimeout(handler);
		};
	}, [sortBy]);

	// 獲取客戶列表的主要函數，支援搜尋和排序功能
	const fetchCustomers = useCallback(
		async (url?: string) => {
			try {
				setLoading(true);

				// 如果有傳入特定 URL（通常是分頁連結）就使用該 URL
				// 否則組裝新的 API 端點，包含搜尋和排序參數
				let endpoint: string;
				if (url) {
					// 使用傳入的 URL（分頁等）
					endpoint = url;
				} else {
					// 基本 API 路徑
					endpoint = "/customers/";

					// 組裝查詢參數（search 和 ordering）
					const params = new URLSearchParams();

					// 如果有搜尋關鍵字，加入 search 參數
					if (debouncedSearchTerm) {
						params.append("search", debouncedSearchTerm);
					}

					// 如果有選擇排序方式，加入 ordering 參數
					if (debouncedSortBy) {
						params.append("ordering", debouncedSortBy);
					}

					// 如果有參數，加在 URL 後面
					if (params.toString()) {
						endpoint += "?" + params.toString();
					}
				}

				const response = await api.get<PaginatedResponse<Customer>>(endpoint);

				// 確保 response.data 符合 PaginatedResponse 類型，使用類型斷言避免 TypeScript 錯誤
				const data: PaginatedResponse<Customer> = response.data;
				setCustomers(data.results);
				setPagination({
					count: data.count,
					next: data.next,
					previous: data.previous,
				});
			} catch (err: unknown) {
				setError("Failed to fetch customers");
				console.error("Error fetching customers:", err);
			} finally {
				setLoading(false);
			}
		},
		[debouncedSearchTerm, debouncedSortBy] // 當搜尋關鍵字或排序方式改變時，才重新產生 fetchCustomers 函數
	);

	useEffect(() => {
		fetchCustomers();
	}, [debouncedSearchTerm, debouncedSortBy, fetchCustomers]); // 監聽搜尋和排序狀態變化

	// Refresh function to force reload of current page
	const refreshCustomers = async () => {
		console.log("Refreshing customer list...");
		try {
			setError(""); // Clear any existing errors
			await fetchCustomers();
			console.log("Customer list refreshed successfully");
		} catch (err: unknown) {
			console.error("Error refreshing customers:", err);
			setError("Failed to refresh customer list");
		}
	};

	const handleNextPage = () => {
		if (pagination.next) {
			fetchCustomers(pagination.next);
		}
	};

	const handlePreviousPage = () => {
		if (pagination.previous) {
			fetchCustomers(pagination.previous);
		}
	};

	const handleAddCustomer = () => {
		setSelectedCustomer(null);
		setViewMode("form");
	};

	const handleImportCustomers = () => {
		setViewMode("import");
	};

	const handleEditCustomer = (customer: Customer) => {
		setSelectedCustomer(customer);
		setViewMode("form");
	};

	const handleViewCustomer = (customer: Customer) => {
		setSelectedCustomerId(customer.id);
		setViewMode("detail");
	};

	const handleSaveCustomer = async (customer: Customer) => {
		console.log("Customer saved, refreshing list with updated data:", customer);

		// Always refresh the entire customer list to ensure all related data is properly loaded
		try {
			await refreshCustomers();
			console.log("Successfully refreshed customer list with complete data");
		} catch (error) {
			console.error("Error refreshing customer list:", error);
			setError("Customer saved but failed to refresh list. Please refresh the page to see updated data.");
		}

		setViewMode("list");
		setSelectedCustomer(null);
	};

	const handleImportComplete = async () => {
		console.log("Import completed, refreshing customer list...");
		try {
			await refreshCustomers();
			console.log("Successfully refreshed customer list after import");
		} catch (error) {
			console.error("Error refreshing customer list after import:", error);
			setError("Import completed but failed to refresh list. Please refresh the page to see updated data.");
		}
		setViewMode("list");
	};

	const handleCancel = () => {
		setViewMode("list");
		setSelectedCustomer(null);
		setSelectedCustomerId(null);
	};

	// Show form view
	if (viewMode === "form") {
		return (
			<CustomerForm
				customer={selectedCustomer || undefined}
				onSave={handleSaveCustomer}
				onCancel={handleCancel}
			/>
		);
	}

	// Show detail view
	if (viewMode === "detail" && selectedCustomerId) {
		return (
			<CustomerDetail
				customerId={selectedCustomerId}
				onEdit={handleEditCustomer}
				onBack={handleCancel}
			/>
		);
	}

	// Show import view
	if (viewMode === "import") {
		return (
			<CustomerImport
				onImportComplete={handleImportComplete}
				onCancel={handleCancel}
			/>
		);
	}

	if (loading && customers.length === 0) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='sm:flex sm:items-center'>
				<div className='sm:flex-auto'>
					<h1 className='text-2xl font-semibold text-gray-900'>客戶管理</h1>
					<p className='mt-2 text-sm text-gray-700'>管理系統中的所有客戶資料</p>
				</div>
				<div className='mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3'>
					<button
						type='button'
						onClick={handleImportCustomers}
						className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto'
					>
						匯入客戶
					</button>
					<button
						type='button'
						onClick={handleAddCustomer}
						className='inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto'
					>
						新增客戶
					</button>
				</div>
			</div>

			{/* 搜尋和排序區域 */}
			<div className='flex flex-col sm:flex-row gap-4 max-w-4xl'>
				{/* 搜尋框 */}
				<div className='flex-1 max-w-md'>
					<div className='relative group'>
						<input
							type='text'
							placeholder='搜尋客戶...'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-gray-300 text-sm'
						/>
						{/* 搜尋中的轉圈動畫：當使用者輸入中且還未達到 debounce 時間時顯示 */}
						{searchTerm !== debouncedSearchTerm && (
							<div className='absolute right-4 top-1/2 transform -translate-y-1/2'>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
							</div>
						)}
						{/* 搜尋圖示 */}
						<div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* 排序下拉選單 */}
				<div className='w-full sm:w-64'>
					<div className='relative group'>
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className='w-full px-4 py-3 pl-12 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-gray-300 text-sm appearance-none cursor-pointer'
						>
							{/* 預設不排序 */}
							<option value=''>不排序</option>
							{/* 總消費額由低到高（ASC = 遞增） */}
							<option value='annotated_total_spent'>總消費額：由低到高</option>
							{/* 總消費額由高到低（DESC = 遞減） */}
							<option value='-annotated_total_spent'>總消費額：由高到低</option>
							{/* 訂單數排序 */}
							<option value='annotated_total_orders'>訂單數：由少到多</option>
							<option value='-annotated_total_orders'>訂單數：由多到少</option>
							{/* 時間排序選項 */}
							<option value='created_at'>加入時間：由舊到新</option>
							<option value='-created_at'>加入時間：由新到舊</option>
						</select>

						{/* 排序中的轉圈動畫：當選擇排序且還未達到 debounce 時間時顯示 */}
						{sortBy !== debouncedSortBy && (
							<div className='absolute right-12 top-1/2 transform -translate-y-1/2'>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500'></div>
							</div>
						)}

						{/* 排序圖示 */}
						<div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none'>
							<svg
								className='w-5 h-5'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M3 4h13M3 8h9m-9 4h6m0 0l-3-3m3 3l3-3m-3 3v12'
								/>
							</svg>
						</div>

						{/* 下拉箭頭 */}
						<div className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none'>
							<svg
								className='w-4 h-4'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 9l-7 7-7-7'
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>

			{error && (
				<div className='rounded-md bg-red-50 p-4'>
					<div className='text-sm text-red-700'>{error}</div>
				</div>
			)}

			{/* Customer Table */}
			<div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
				<table className='min-w-full divide-y divide-gray-300'>
					<thead className='bg-gray-50'>
						<tr>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>客戶</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>聯絡方式</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>公司</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>來源</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>訂單數</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>總消費額</th>
							<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>狀態</th>
							<th className='relative px-6 py-3'>
								<span className='sr-only'>操作</span>
							</th>
						</tr>
					</thead>
					<tbody className='bg-white divide-y divide-gray-200'>
						{customers.map((customer) => (
							<tr
								key={customer.id}
								className='hover:bg-gray-50'
							>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='flex-1'>
											<div className='text-sm font-medium text-gray-900'>
												<button
													onClick={() => handleViewCustomer(customer)}
													className='text-blue-600 hover:text-blue-800'
												>
													{customer.full_name}
												</button>
												{customer.age && <span className='ml-2 text-xs text-gray-400'>({customer.age}歲)</span>}
											</div>
											<div className='text-sm text-gray-500 flex items-center space-x-2'>
												<span>ID: {customer.id}</span>
												{customer.gender && (
													<span className='text-xs'>
														{customer.gender === "male" && "♂️"}
														{customer.gender === "female" && "♀️"}
														{customer.gender === "other" && "⚧️"}
													</span>
												)}
											</div>
										</div>
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-900'>{customer.email}</div>
									<div className='text-sm text-gray-500'>{customer.phone}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{customer.company || "-"}</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex flex-col space-y-1'>
										<span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>{customer.source}</span>
										{customer.seasonal_purchase_pattern && (
											<span className='text-xs text-gray-500'>
												購買季節偏好:
												{customer.seasonal_purchase_pattern === "spring" && "🌸 春季"}
												{customer.seasonal_purchase_pattern === "summer" && "☀️ 夏季"}
												{customer.seasonal_purchase_pattern === "autumn" && "🍂 秋季"}
												{customer.seasonal_purchase_pattern === "winter" && "❄️ 冬季"}
												{customer.seasonal_purchase_pattern === "year_round" && "🔄 全年"}
											</span>
										)}
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>{customer.total_orders}</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm text-gray-900'>${typeof customer.total_spent === "number" ? customer.total_spent.toFixed(2) : parseFloat(customer.total_spent || "0").toFixed(2)}</div>
									{customer.product_categories_interest && customer.product_categories_interest.length > 0 && (
										<div className='text-xs text-gray-500 mt-1'>
											<span className='inline-flex items-center'>對 {customer.product_categories_interest.length} 個產品類別感興趣</span>
										</div>
									)}
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${customer.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{customer.is_active ? "啟用" : "停用"}</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
									<button
										onClick={() => handleEditCustomer(customer)}
										className='text-blue-600 hover:text-blue-900 mr-4'
									>
										編輯
									</button>

								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			{(pagination.next || pagination.previous) && (
				<div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6'>
					<div className='flex flex-1 justify-between sm:hidden'>
						<button
							onClick={handlePreviousPage}
							disabled={!pagination.previous}
							className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
						>
							上一頁
						</button>
						<button
							onClick={handleNextPage}
							disabled={!pagination.next}
							className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
						>
							下一頁
						</button>
					</div>
					<div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
						<div>
							<p className='text-sm text-gray-700'>
								顯示 <span className='font-medium'>{customers.length}</span> 筆，共 <span className='font-medium'>{pagination.count}</span> 筆資料
							</p>
						</div>
						<div>
							<nav className='isolate inline-flex -space-x-px rounded-md shadow-sm'>
								<button
									onClick={handlePreviousPage}
									disabled={!pagination.previous}
									className='relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50'
								>
									上一頁
								</button>
								<button
									onClick={handleNextPage}
									disabled={!pagination.next}
									className='relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50'
								>
									下一頁
								</button>
							</nav>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomerList;
