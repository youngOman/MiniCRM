import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../services/api';

// Dashboard子組件
import KPICards from './dashboard/KPICards';
import RevenueTrendChart from './dashboard/RevenueTrendChart';
import CustomerGrowthChart from './dashboard/CustomerGrowthChart';
import OrderGrowthChart from './dashboard/OrderGrowthChart';
import PaymentMethodChart from './dashboard/PaymentMethodChart';
import DashboardFilters from './dashboard/DashboardFilters';
import StatsCards from './dashboard/StatsCards';

interface DashboardStats {
  overview: {
    total_customers: number;
    total_orders: number;
    total_transactions: number;
    total_revenue: number;
    net_revenue: number;
    average_order_value: number;
    conversion_rate: number;
  };
  customer_stats: {
    new_customers_today: number;
    new_customers_this_month: number;
    avg_customer_value: number;
    customer_sources: Array<{ source: string; count: number }>;
  };
  order_stats: {
    orders_today: number;
    orders_this_month: number;
    pending_orders: number;
    order_status_distribution: Array<{ status: string; count: number }>;
  };
  transaction_stats: {
    transactions_today: number;
    transactions_this_month: number;
    total_fees: number;
    payment_methods: Array<{ payment_method: string; count: number; total_amount: number }>;
  };
}


interface TrendData {
  customer_trend: Array<{ date: string; count: number }>;
  order_trend: Array<{ date: string; count: number; total_amount: number }>;
  transaction_trend: Array<{ date: string; count: number; total_amount: number; total_fees: number }>;
  period: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_from: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    // tags: '',
    period: 'month'
  });


  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, trendsResponse] = await Promise.all([
        api.get('/reports/dashboard/', { params: filters }),
        api.get('/reports/trends/', { params: filters })
      ]);
      
      setStats(statsResponse.data);
      setTrends(trendsResponse.data);
    } catch (error) {
      console.error('載入儀表板數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      date_from: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
      date_to: format(new Date(), 'yyyy-MM-dd'),
      source: '',
      // tags: '',
      period: 'month'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats || !trends) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">載入數據失敗，請重新整理頁面</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">營銷分析儀表板</h1>
        <p className="text-gray-600">掌握營銷效果、客戶獲取與轉換分析</p>
      </div>

      {/* 篩選器 */}
      <DashboardFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
      />

      {/* 關鍵指標卡片 */}
      <KPICards 
        overview={stats.overview}
        transactionStats={stats.transaction_stats}
      />

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RevenueTrendChart 
          data={trends.order_trend}
          dateFrom={filters.date_from}
          dateTo={filters.date_to}
        />
        
        <CustomerGrowthChart 
          data={trends.customer_trend}
          dateFrom={filters.date_from}
          dateTo={filters.date_to}
        />
        
        <OrderGrowthChart 
          data={trends.order_trend}
          dateFrom={filters.date_from}
          dateTo={filters.date_to}
        />
        
        <PaymentMethodChart 
          data={stats.transaction_stats.payment_methods}
        />
      </div>

      {/* 詳細統計表格 */}
      <StatsCards 
        customerStats={stats.customer_stats}
        orderStats={stats.order_stats}
        transactionStats={stats.transaction_stats}
        overview={stats.overview}
      />
    </div>
  );
};

export default Dashboard;