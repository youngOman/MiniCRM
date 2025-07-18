import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import authService from "../services/auth";

const MobileHeader: React.FC = () => {
	const navigate = useNavigate();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
			to: "/customer-analytics",
			label: "客戶分析儀表板",
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
		<nav className='md:hidden bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50'>
			<div className='px-4'>
				<div className='flex justify-between h-16'>
					{/* Logo */}
					<div className='flex items-center'>
						<div className='flex items-center space-x-3'>
							<div className='w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg'>
								<svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
								</svg>
							</div>
							<h1 className='text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent'>MiniCRM Pro</h1>
						</div>
					</div>

					{/* Mobile menu button */}
					<div className='flex items-center'>
						<button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className='inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300'>
							<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
								{isMobileMenuOpen ? <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /> : <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />}
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Navigation Menu */}
			{isMobileMenuOpen && (
				<div className='border-t border-gray-200 bg-white'>
					<div className='px-4 pt-2 pb-3 space-y-1'>
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								onClick={() => setIsMobileMenuOpen(false)}
								className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${isActive ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
							>
								<span className='mr-3'>{item.icon}</span>
								{item.label}
							</NavLink>
						))}
						<div className='border-t border-gray-200 pt-4 mt-4'>
							<div className='flex items-center px-4 py-2 mb-3'>
								<div className='w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3'>
									<svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
										<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
									</svg>
								</div>
								<span className='text-base font-medium text-gray-900'>管理員</span>
							</div>
							<button onClick={handleLogout} className='flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300'>
								<svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
									<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' />
								</svg>
								登出
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default MobileHeader;
