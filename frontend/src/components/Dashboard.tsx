import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../services/api';

// Dashboard子組件
import KPICards from './dashboard/KPICards';
import RevenueTrendChart from './dashboard/RevenueTrendChart';
import CustomerGrowthChart from './dashboard/CustomerGrowthChart';
import CustomerSourceChart from './dashboard/CustomerSourceChart';
import PaymentMethodChart from './dashboard/PaymentMethodChart';
import CustomerTierChart from './dashboard/CustomerTierChart';
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

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  total_orders: number;
  total_spent: number;
}

interface CustomerTier {
  tier: string;
  count: number;
  color: string;
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerTiers, setCustomerTiers] = useState<CustomerTier[]>([]); // 客戶等級分布
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_from: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    // tags: '',
    period: 'month'
  });

  // 客戶等級分類邏輯
  const getCustomerTier = (totalSpent: number, totalOrders: number): { tier: string; color: string } => {
    if (totalSpent >= 60000) {
      return { tier: '白金客戶', color: '#8B5CF6' };
    } else if (totalSpent >= 20000 && totalOrders >= 1) {
      return { tier: '黃金客戶', color: '#F59E0B' };
    } else if (totalSpent >= 5000 && totalOrders >= 2) {
      return { tier: '白銀客戶', color: '#6B7280' };
    } else if (totalSpent > 0 && totalOrders >= 1) {
      return { tier: '一般客戶', color: '#10B981' };
    } else {
      return { tier: '潛在客戶', color: '#EF4444' };
    }
  };

  // 計算客戶等級分布
  const calculateCustomerTiers = (customers: Customer[]): CustomerTier[] => {
    const tierCounts = new Map<string, { count: number; color: string }>();
    
    customers.forEach(customer => {
      const { tier, color } = getCustomerTier(customer.total_spent, customer.total_orders);
      if (tierCounts.has(tier)) {
        tierCounts.get(tier)!.count += 1;
      } else {
        tierCounts.set(tier, { count: 1, color });
      }
    });

    return Array.from(tierCounts.entries()).map(([tier, { count, color }]) => ({
      tier,
      count,
      color
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, trendsResponse, customersResponse] = await Promise.all([
        api.get('/reports/dashboard/', { params: filters }),
        api.get('/reports/trends/', { params: filters }),
        api.get('/customers/', { 
          params: { 
            limit: 10000, // 增加限制以獲取更多客戶資料
            date_from: filters.date_from,
            date_to: filters.date_to,
            source: filters.source,
            // tags: filters.tags
          } 
        })
      ]);
      
      setStats(statsResponse.data);
      setTrends(trendsResponse.data);
      setCustomers(customersResponse.data.results || []);
      // 計算客戶等級分布
      const tiers = calculateCustomerTiers(customersResponse.data.results|| []);
      setCustomerTiers(tiers);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">營運儀表板</h1>
        <p className="text-gray-600">一鍵掌握關鍵營運指標與趨勢分析</p>
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
        
        <CustomerSourceChart 
          data={stats.customer_stats.customer_sources}
        />
        
        <PaymentMethodChart 
          data={stats.transaction_stats.payment_methods}
        />
        
        <CustomerTierChart 
          data={customerTiers}
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