import React, { useState, useEffect } from "react";
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
	const [searchTerm, setSearchTerm] = useState("");
	const [pagination, setPagination] = useState({
		count: 0,
		next: null as string | null,
		previous: null as string | null,
	});
	const [viewMode, setViewMode] = useState<ViewMode>("list");
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

	const fetchCustomers = React.useCallback(
		async (url?: string) => {
			try {
				setLoading(true);
				const endpoint = url || `/customers/${searchTerm ? `?search=${searchTerm}` : ""}`;
				const response = await api.get<PaginatedResponse<Customer>>(endpoint);

				setCustomers(response.data.results);
				setPagination({
					count: response.data.count,
					next: response.data.next,
					previous: response.data.previous,
				});
			} catch (err: unknown) {
				setError("Failed to fetch customers");
				console.error("Error fetching customers:", err);
			} finally {
				setLoading(false);
			}
		},
		[searchTerm] // 明確指定依賴 searchTerm 以便在搜尋時重新獲取客戶資料
	);

	useEffect(() => {
		fetchCustomers();
	}, [searchTerm, fetchCustomers]);

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
		return <CustomerForm customer={selectedCustomer || undefined} onSave={handleSaveCustomer} onCancel={handleCancel} />;
	}

	// Show detail view
	if (viewMode === "detail" && selectedCustomerId) {
		return <CustomerDetail customerId={selectedCustomerId} onEdit={handleEditCustomer} onBack={handleCancel} />;
	}

	// Show import view
	if (viewMode === "import") {
		return <CustomerImport onImportComplete={handleImportComplete} onCancel={handleCancel} />;
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

			{/* Search */}
			<div className='max-w-md'>
				<div className='relative group'>
					<input
						type='text'
						placeholder='搜尋客戶...'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className='w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white focus:bg-white group-hover:border-gray-300 text-sm'
					/>
					<div className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'>
						<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
						</svg>
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
							<tr key={customer.id} className='hover:bg-gray-50'>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='flex-1'>
											<div className='text-sm font-medium text-gray-900'>
												<button onClick={() => handleViewCustomer(customer)} className='text-blue-600 hover:text-blue-800'>
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
									<button onClick={() => handleEditCustomer(customer)} className='text-blue-600 hover:text-blue-900 mr-4'>
										編輯
									</button>
									<button onClick={() => handleViewCustomer(customer)} className='text-gray-600 hover:text-gray-900'>
										查看
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
						<button onClick={handlePreviousPage} disabled={!pagination.previous} className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'>
							上一頁
						</button>
						<button onClick={handleNextPage} disabled={!pagination.next} className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'>
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
								<button onClick={handlePreviousPage} disabled={!pagination.previous} className='relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50'>
									上一頁
								</button>
								<button onClick={handleNextPage} disabled={!pagination.next} className='relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50'>
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
