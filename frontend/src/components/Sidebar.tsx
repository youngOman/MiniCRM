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
			label: "營運總覽",
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
			to: "/customer-analytics",
			label: "客戶分析",
			icon: (
				<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' />
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
	];

	return (
		<div className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-50 hidden md:flex`}>
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
