import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../services/auth";

interface SidebarProps {
	isCollapsed: boolean;
	onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
	const navigate = useNavigate();

	const handleLogout = async () => {
		await authService.logout();
		navigate("/login");
	};

	const navItems = [
		{
			to: "/dashboard",
			label: "營銷分析儀表板",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
				</svg>
			),
		},
		{
			to: "/customers",
			label: "客戶管理",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' />
				</svg>
			),
		},
		{
			to: "/customer-overview",
			label: "客戶總覽",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
				</svg>
			),
		},
		{
			to: "/customer-demographics",
			label: "客戶人口分析",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
				</svg>
			),
		},
		{
			to: "/customer-behavior",
			label: "客戶行為分析",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
				</svg>
			),
		},
		{
			to: "/customer-segmentation",
			label: "客戶分群分析",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
				</svg>
			),
		},
		{
			to: "/customer-value-analytics",
			label: "客戶價值分析",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
				</svg>
			),
		},
		{
			to: "/orders",
			label: "訂單管理",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
				</svg>
			),
		},
		{
			to: "/transactions",
			label: "交易記錄",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
				</svg>
			),
		},
		{
			to: "/products",
			label: "產品管理",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
				</svg>
			),
		},
		{
			to: "/service-tickets",
			label: "客服工單",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' />
				</svg>
			),
		},
		{
			to: "/knowledge-base",
			label: "知識庫",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
				</svg>
			),
		},
		{
			to: "/faq",
			label: "常見問題",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
				</svg>
			),
		},
	];

	return (
		<div className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex-col h-screen fixed left-0 top-0 z-50 hidden md:flex`}>
			{/* Header */}
			<div className='flex items-center justify-between p-4 border-b border-gray-200'>
				<div className={`flex items-center space-x-3 ${isCollapsed ? "justify-center" : ""}`}>
					<div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg'>
						<svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
						</svg>
					</div>
					{!isCollapsed && <h1 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent'>MiniCRM Pro</h1>}
				</div>
				<button onClick={onToggle} className='p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200'>
					<svg className='w-4 h-4 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						{isCollapsed ? <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' /> : <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />}
					</svg>
				</button>
			</div>

			{/* Navigation */}
			<nav className='flex-1 py-4 px-2 overflow-y-auto'>
				<div className='space-y-1'>
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							className={({ isActive }) =>
								`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"} ${isCollapsed ? "justify-center" : ""}`
							}
						>
							<span className={`transition-transform duration-200 group-hover:scale-110 ${isCollapsed ? "" : "mr-3"}`}>{item.icon}</span>
							{!isCollapsed && <span className='truncate'>{item.label}</span>}
						</NavLink>
					))}
				</div>
			</nav>

			{/* User Profile & Logout */}
			<div className='border-t border-gray-200 p-4'>
				{!isCollapsed && (
					<div className='flex items-center space-x-3 mb-4'>
						<div className='w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center'>
							<svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
							</svg>
						</div>
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-medium text-gray-900 truncate'>管理員</p>
							<p className='text-xs text-gray-500'>系統管理員</p>
						</div>
					</div>
				)}
				<button onClick={handleLogout} className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center" : ""}`} title={isCollapsed ? "登出" : ""}>
					<svg className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
						<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
					</svg>
					{!isCollapsed && <span>登出</span>}
				</button>
			</div>
		</div>
	);
};

export default Sidebar;
