import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
	ServiceTicket,
	ServiceTicketFormData,
	TICKET_CATEGORIES,
	TICKET_PRIORITIES,
	TICKET_STATUSES,
} from "../types/customer-service";
import { Customer } from "../types/customer";

interface CustomerOption {
	id: number;
	full_name: string;
	email?: string;
	phone?: string;
}

interface AdminUser {
	id: number;
	name: string;
	role?: string;
	email?: string;
}

const ServiceTicketForm: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const isEdit = Boolean(id);

	const [formData, setFormData] = useState<ServiceTicketFormData>({
		customer: "",
		title: "",
		description: "",
		category: "general_inquiry",
		priority: "medium",
		status: "open",
		tags: [],
		assigned_to: "",
	});

	const [customers, setCustomers] = useState<CustomerOption[]>([]);
	const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tagInput, setTagInput] = useState("");

	useEffect(() => {
		fetchCustomers();
		fetchAdminUsers();
		if (isEdit && id) {
			fetchTicketDetail(parseInt(id));
		}
	}, [isEdit, id]);

	const fetchCustomers = async () => {
		try {
			const response = await api.get<{ results: Customer[] }>("/customers/?limit=1000");
			setCustomers(
				response.data.results.map((customer) => ({
					id: customer.id,
					full_name: customer.full_name,
					email: customer.email,
					phone: customer.phone,
				}))
			);
		} catch (err) {
			console.error("Error fetching customers:", err);
		}
	};

	const fetchAdminUsers = async () => {
		try {
			// TODO: 實作實際的後台管理員 API
			// const response = await api.get<{results: AdminUser[]}>('/admin/users/?role=customer_service');

			// 暫時使用模擬資料
			setAdminUsers([
				{ id: 1, name: "客服專員 A" },
				{ id: 2, name: "客服專員 B" },
				{ id: 3, name: "客服主管" },
			]);
		} catch (err) {
			console.error("Error fetching admin users:", err);
		}
	};

	const fetchTicketDetail = async (ticketId: number) => {
		try {
			setLoading(true);
			const response = await api.get<ServiceTicket>(`/customer-service/tickets/${ticketId}/`);
			const ticket = response.data;

			setFormData({
				customer: ticket.customer.toString(),
				title: ticket.title,
				description: ticket.description,
				category: ticket.category,
				priority: ticket.priority,
				status: ticket.status,
				tags: ticket.tags || [],
				assigned_to: ticket.assigned_to?.toString() || "",
			});
		} catch (err) {
			setError("載入工單資料失敗");
			console.error("Error fetching ticket detail:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (field: keyof ServiceTicketFormData, value: string | string[]) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleAddTag = () => {
		if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
			setFormData((prev) => ({
				...prev,
				tags: [...(prev.tags || []), tagInput.trim()],
			}));
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove: string) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.customer || !formData.title || !formData.description) {
			setError("請填寫必填欄位");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const submitData = {
				customer: parseInt(formData.customer),
				title: formData.title,
				description: formData.description,
				category: formData.category,
				priority: formData.priority,
				status: formData.status,
				tags: formData.tags,
				assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
			};

			if (isEdit && id) {
				await api.put(`/customer-service/tickets/${id}/`, submitData);
			} else {
				await api.post("/customer-service/tickets/", submitData);
			}

			navigate("/service-tickets");
		} catch (err: unknown) {
			setError(err.response?.data?.detail || "儲存工單失敗");
			console.error("Error saving ticket:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading && isEdit) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-6'>
			<div className='mb-6'>
				<div className='flex items-center space-x-4'>
					<button
						onClick={() => navigate("/service-tickets")}
						className='text-indigo-600 hover:text-indigo-800'
					>
						← 返回工單列表
					</button>
					<h1 className='text-2xl font-bold text-gray-900'>{isEdit ? "編輯工單" : "新增工單"}</h1>
				</div>
			</div>

			{error && (
				<div className='mb-6 bg-red-50 border border-red-200 rounded-md p-4'>
					<div className='text-red-700'>{error}</div>
				</div>
			)}

			<div className='bg-white shadow rounded-lg'>
				<form
					onSubmit={handleSubmit}
					className='px-6 py-4 space-y-6'
				>
					{/* 基本資訊 */}
					<div>
						<h2 className='text-lg font-medium text-gray-900 mb-4'>基本資訊</h2>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									客戶 <span className='text-red-500'>*</span>
								</label>
								<select
									value={formData.customer}
									onChange={(e) => handleInputChange("customer", e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
									required
								>
									<option value=''>請選擇客戶</option>
									{customers.map((customer) => (
										<option
											key={customer.id}
											value={customer.id}
										>
											{customer.full_name} {customer.email && `(${customer.email})`}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									分類 <span className='text-red-500'>*</span>
								</label>
								<select
									value={formData.category}
									onChange={(e) => handleInputChange("category", e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
									required
								>
									{TICKET_CATEGORIES.map((category) => (
										<option
											key={category.value}
											value={category.value}
										>
											{category.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									優先級 <span className='text-red-500'>*</span>
								</label>
								<select
									value={formData.priority}
									onChange={(e) => handleInputChange("priority", e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
									required
								>
									{TICKET_PRIORITIES.map((priority) => (
										<option
											key={priority.value}
											value={priority.value}
										>
											{priority.label}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>狀態</label>
								<select
									value={formData.status}
									onChange={(e) => handleInputChange("status", e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
								>
									{TICKET_STATUSES.map((status) => (
										<option
											key={status.value}
											value={status.value}
										>
											{status.label}
										</option>
									))}
								</select>
							</div>

							<div className='md:col-span-2'>
								<label className='block text-sm font-medium text-gray-700 mb-2'>負責人</label>
								<select
									value={formData.assigned_to}
									onChange={(e) => handleInputChange("assigned_to", e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
								>
									<option value=''>未分配</option>
									{adminUsers.map((user) => (
										<option
											key={user.id}
											value={user.id}
										>
											{user.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* 工單內容 */}
					<div>
						<h2 className='text-lg font-medium text-gray-900 mb-4'>工單內容</h2>

						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									標題 <span className='text-red-500'>*</span>
								</label>
								<input
									type='text'
									value={formData.title}
									onChange={(e) => handleInputChange("title", e.target.value)}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
									placeholder='請輸入工單標題'
									required
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>
									問題描述 <span className='text-red-500'>*</span>
								</label>
								<textarea
									value={formData.description}
									onChange={(e) => handleInputChange("description", e.target.value)}
									rows={6}
									className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
									placeholder='請詳細描述問題...'
									required
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>標籤</label>
								<div className='flex items-center space-x-2 mb-2'>
									<input
										type='text'
										value={tagInput}
										onChange={(e) => setTagInput(e.target.value)}
										onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
										className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
										placeholder='輸入標籤後按 Enter'
									/>
									<button
										type='button'
										onClick={handleAddTag}
										className='px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
									>
										新增
									</button>
								</div>
								{formData.tags && formData.tags.length > 0 && (
									<div className='flex flex-wrap gap-2'>
										{formData.tags.map((tag, index) => (
											<span
												key={index}
												className='inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full'
											>
												{tag}
												<button
													type='button'
													onClick={() => handleRemoveTag(tag)}
													className='ml-1 text-indigo-600 hover:text-indigo-800'
												>
													×
												</button>
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* 提交按鈕 */}
					<div className='flex justify-end space-x-3 pt-6 border-t'>
						<button
							type='button'
							onClick={() => navigate("/service-tickets")}
							className='px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
						>
							取消
						</button>
						<button
							type='submit'
							disabled={loading}
							className='px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50'
						>
							{loading ? "儲存中..." : isEdit ? "更新工單" : "建立工單"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ServiceTicketForm;
