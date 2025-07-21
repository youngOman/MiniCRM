import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { FAQ, FAQResponse, FAQ_CATEGORIES } from "../types/customer-service";
import { ApiError } from "../types/error";

const FAQList: React.FC = () => {
	const navigate = useNavigate();
	const [faqs, setFaqs] = useState<FAQ[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);

	// 篩選器狀態
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [featuredFilter, setFeaturedFilter] = useState("");
	const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

	const fetchFAQs = useCallback(
		async (page = 1) => {
			try {
				setLoading(true);

				const params = new URLSearchParams({
					page: page.toString(),
					page_size: "20",
				});

				if (searchTerm) params.append("search", searchTerm);
				if (categoryFilter) params.append("category", categoryFilter);
				if (featuredFilter) params.append("is_featured", featuredFilter);

				const response = await api.get<FAQResponse>(`/customer-service/faq/?${params}`);

				setFaqs(response.data.results);
				setTotalCount(response.data.count);
				setTotalPages(Math.ceil(response.data.count / 20));
				setCurrentPage(page);
			} catch (err) {
				const error = err as ApiError;
				setError(error.response?.data?.detail || error.message || "載入FAQ失敗");
				console.error("Error fetching FAQs:", err);
			} finally {
				setLoading(false);
			}
		},
		[searchTerm, categoryFilter, featuredFilter]
	);

	useEffect(() => {
		fetchFAQs(1);
	}, [searchTerm, categoryFilter, featuredFilter, fetchFAQs]);

	const handleDeleteFAQ = async (faqId: number) => {
		if (!window.confirm("確定要刪除這個常見問題嗎？")) {
			return;
		}

		try {
			await api.delete(`/customer-service/faq/${faqId}/`);
			fetchFAQs(currentPage);
		} catch (err) {
			const error = err as ApiError;
			const errorMessage = error.response?.data?.detail || error.message || "刪除失敗";
			console.error("Error deleting FAQ:", err);
			alert(errorMessage);
		}
	};

	const getLabelByValue = (options: Array<{ value: string; label: string }>, value: string) => {
		return options.find((option) => option.value === value)?.label || value;
	};

	const toggleFAQ = (faqId: number) => {
		setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
	};

	if (loading) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-red-50 border border-red-200 rounded-md p-4'>
				<div className='text-red-700'>{error}</div>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto p-6'>
			<div className='mb-6'>
				<div className='flex justify-between items-center mb-4'>
					<h1 className='text-2xl font-bold text-gray-900'>常見問題管理</h1>
					<button
						onClick={() => navigate("/faq/new")}
						className='bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700'
					>
						新增FAQ
					</button>
				</div>

				{/* 搜尋和篩選器 */}
				<div className='bg-white p-4 rounded-lg shadow mb-4'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div>
							<input
								type='text'
								placeholder='搜尋問題或答案...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
							/>
						</div>
						<div>
							<select
								value={categoryFilter}
								onChange={(e) => setCategoryFilter(e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
							>
								<option value=''>全部分類</option>
								{FAQ_CATEGORIES.map((category) => (
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
							<select
								value={featuredFilter}
								onChange={(e) => setFeaturedFilter(e.target.value)}
								className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500'
							>
								<option value=''>全部FAQ</option>
								<option value='true'>置頂FAQ</option>
								<option value='false'>一般FAQ</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			{/* FAQ 列表 */}
			<div className='bg-white shadow rounded-lg'>
				<div className='px-4 py-5 sm:p-6'>
					<div className='text-sm text-gray-500 mb-4'>共 {totalCount} 個常見問題</div>

					{faqs.length === 0 ? (
						<div className='text-center py-8'>
							<p className='text-gray-500'>目前沒有常見問題</p>
						</div>
					) : (
						<div className='space-y-4'>
							{faqs.map((faq) => (
								<div
									key={faq.id}
									className='border border-gray-200 rounded-lg'
								>
									<div className='p-4'>
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<div className='flex items-center space-x-2 mb-2'>
													<span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'>
														{getLabelByValue(FAQ_CATEGORIES, faq.category)}
													</span>
													{faq.is_featured && (
														<span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'>
															置頂
														</span>
													)}
													<span className='text-xs text-gray-500'>瀏覽次數: {faq.view_count}</span>
												</div>

												<button
													onClick={() => toggleFAQ(faq.id)}
													className='text-left w-full'
												>
													<h3 className='text-lg font-medium text-gray-900 hover:text-indigo-600'>
														{faq.question}
													</h3>
												</button>

												{expandedFAQ === faq.id && (
													<div className='mt-4 pt-4 border-t border-gray-100'>
														<div className='prose max-w-none'>
															<p className='text-gray-700 whitespace-pre-wrap'>{faq.answer}</p>
														</div>
													</div>
												)}
											</div>

											<div className='flex items-center space-x-2 ml-4'>
												<button
													onClick={() => navigate(`/faq/${faq.id}/edit`)}
													className='text-indigo-600 hover:text-indigo-800 text-sm'
												>
													編輯
												</button>
												<button
													onClick={() => handleDeleteFAQ(faq.id)}
													className='text-red-600 hover:text-red-800 text-sm'
												>
													刪除
												</button>
												<button
													onClick={() => toggleFAQ(faq.id)}
													className='text-gray-400 hover:text-gray-600'
												>
													<svg
														className={`w-5 h-5 transition-transform duration-200 ${
															expandedFAQ === faq.id ? "transform rotate-180" : ""
														}`}
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth='2'
															d='M19 9l-7 7-7-7'
														/>
													</svg>
												</button>
											</div>
										</div>

										<div className='flex items-center justify-between mt-3 text-sm text-gray-500'>
											<span>建立時間: {new Date(faq.created_at).toLocaleDateString("zh-TW")}</span>
											<span>排序: {faq.sort_order}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* 分頁 */}
				{totalPages > 1 && (
					<div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
						<div className='flex-1 flex justify-between sm:hidden'>
							<button
								onClick={() => fetchFAQs(currentPage - 1)}
								disabled={currentPage === 1}
								className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
							>
								上一頁
							</button>
							<button
								onClick={() => fetchFAQs(currentPage + 1)}
								disabled={currentPage === totalPages}
								className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
							>
								下一頁
							</button>
						</div>
						<div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
							<div>
								<p className='text-sm text-gray-700'>
									顯示第 <span className='font-medium'>{(currentPage - 1) * 20 + 1}</span> 到{" "}
									<span className='font-medium'>{Math.min(currentPage * 20, totalCount)}</span>{" "}
									個，共 <span className='font-medium'>{totalCount}</span> 個常見問題
								</p>
							</div>
							<div>
								<nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
									<button
										onClick={() => fetchFAQs(currentPage - 1)}
										disabled={currentPage === 1}
										className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
									>
										上一頁
									</button>
									{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
										const page = i + 1;
										return (
											<button
												key={page}
												onClick={() => fetchFAQs(page)}
												className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
													currentPage === page
														? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
														: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
												}`}
											>
												{page}
											</button>
										);
									})}
									<button
										onClick={() => fetchFAQs(currentPage + 1)}
										disabled={currentPage === totalPages}
										className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
									>
										下一頁
									</button>
								</nav>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default FAQList;
