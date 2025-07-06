import React from 'react';

interface CustomerStats {
  new_customers_today: number;
  new_customers_this_month: number;
  avg_customer_value: number;
}

interface OrderStats {
  orders_today: number;
  orders_this_month: number;
  pending_orders: number;
}

interface TransactionStats {
  transactions_today: number;
  transactions_this_month: number;
}

interface OverviewStats {
  conversion_rate: number;
}

interface StatsCardsProps {
  customerStats: CustomerStats;
  orderStats: OrderStats;
  transactionStats: TransactionStats;
  overview: OverviewStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  customerStats, 
  orderStats, 
  transactionStats, 
  overview 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 今日數據 */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">今日數據</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">新增客戶</span>
            <span className="font-semibold">{customerStats.new_customers_today}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">新增訂單</span>
            <span className="font-semibold">{orderStats.orders_today}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">完成交易</span>
            <span className="font-semibold">{transactionStats.transactions_today}</span>
          </div>
        </div>
      </div>

      {/* 本月數據 */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">本月數據</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">新增客戶</span>
            <span className="font-semibold">{customerStats.new_customers_this_month}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">新增訂單</span>
            <span className="font-semibold">{orderStats.orders_this_month}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">完成交易</span>
            <span className="font-semibold">{transactionStats.transactions_this_month}</span>
          </div>
        </div>
      </div>

      {/* 客戶價值 */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">客戶指標</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">平均客戶價值</span>
            <span className="font-semibold">{formatCurrency(customerStats.avg_customer_value)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">待處理訂單</span>
            <span className="font-semibold">{orderStats.pending_orders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">轉換率</span>
            <span className="font-semibold">{overview.conversion_rate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;