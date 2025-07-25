import React from 'react';

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
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
      {/* 總客戶數 */}
      <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">總客戶數</p>
            <p className="text-3xl font-bold">{overview.total_customers.toLocaleString()}</p>
            <p className="text-blue-200 text-sm mt-1">轉換率 {overview.conversion_rate}%</p>
          </div>
          <div className="text-blue-200">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* 總營收 */}
      <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">總營收</p>
            <p className="text-3xl font-bold">{formatCurrency(overview.total_revenue)}</p>
            <p className="text-green-200 text-sm mt-1">淨收入 {formatCurrency(overview.net_revenue)}</p>
          </div>
          <div className="text-green-200">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* 總訂單數 */}
      <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm">總訂單數</p>
            <p className="text-3xl font-bold">{overview.total_orders.toLocaleString()}</p>
            <p className="text-purple-200 text-sm mt-1">平均訂單價值 {formatCurrency(overview.average_order_value)}</p>
          </div>
          <div className="text-purple-200">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 012 0v6a1 1 0 01-2 0V9zm6 0a1 1 0 012 0v6a1 1 0 01-2 0V9z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* 總交易數 */}
      <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">總交易數</p>
            <p className="text-3xl font-bold">{overview.total_transactions.toLocaleString()}</p>
            <p className="text-orange-200 text-sm mt-1">手續費 {formatCurrency(transactionStats.total_fees)}</p>
          </div>
          <div className="text-orange-200">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* 平均客戶價值 (CLV) */}
      <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-pink-100 text-sm">平均 CLV</p>
            <p className="text-3xl font-bold">{formatCurrency(customerStats.avg_clv)}</p>
            <p className="text-pink-200 text-xs mt-1">每個客戶在整個生命週期內預期能為公司帶來的總價值</p>
            <p className="text-pink-200 text-sm mt-1">高價值客戶 {customerStats.high_value_customers} 人</p>
          </div>
          <div className="text-pink-200">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KPICards;