import React from "react";

interface OverviewStats {
	total_customers: number;
	total_orders: number;
	total_transactions: number;
	total_revenue: number;
	net_revenue: number;
	average_order_value: number;
	conversion_rate: number;
}

interface TransactionStats {
	total_fees: number;
}

interface CustomerStats {
	avg_clv: number;
	high_value_customers: number;
	avg_purchase_frequency: number;
}

interface KPICardsProps {
	overview: OverviewStats;
	transactionStats: TransactionStats;
	customerStats: CustomerStats;
}

const KPICards: React.FC<KPICardsProps> = ({ overview, transactionStats, customerStats }) => {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("zh-TW", {
			style: "currency",
			currency: "TWD",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8'>
			{/* 總客戶數 */}
			<div className='bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-blue-100 text-sm'>總客戶數</p>
						<p className='text-3xl font-bold'>{overview.total_customers.toLocaleString()}</p>
						<p className='text-blue-200 text-sm mt-1'>轉換率 {overview.conversion_rate}%</p>
					</div>
				</div>
			</div>

			{/* 總營收 */}
			<div className='bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-green-100 text-sm'>總營收</p>
						<p className='text-3xl font-bold'>{formatCurrency(overview.total_revenue)}</p>
						<p className='text-green-200 text-sm mt-1'>
							淨收入 {formatCurrency(overview.net_revenue)}
						</p>
					</div>
				</div>
			</div>

			{/* 總訂單數 */}
			<div className='bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-purple-100 text-sm'>總訂單數</p>
						<p className='text-3xl font-bold'>{overview.total_orders.toLocaleString()}</p>
						<p className='text-purple-200 text-sm mt-1'>
							平均訂單價值 {formatCurrency(overview.average_order_value)}
						</p>
					</div>
				</div>
			</div>

			{/* 總交易數 */}
			<div className='bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-orange-100 text-sm'>總交易數</p>
						<p className='text-3xl font-bold'>{overview.total_transactions.toLocaleString()}</p>
						<p className='text-orange-200 text-sm mt-1'>
							手續費 {formatCurrency(transactionStats.total_fees)}
						</p>
					</div>
				</div>
			</div>

			{/* 平均客戶價值 (CLV) */}
			<div className='bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-pink-100 text-sm'>平均 CLV</p>
						<p className='text-3xl font-bold'>{formatCurrency(customerStats.avg_clv)}</p>
						<p className='text-pink-200 text-xs mt-1'>
							每個客戶在整個生命週期內預期能為公司帶來的總價值
						</p>
						<p className='text-pink-200 text-sm mt-1'>
							高價值客戶 {customerStats.high_value_customers} 人
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default KPICards;
