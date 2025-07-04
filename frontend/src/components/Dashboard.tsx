import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import api from '../services/api';

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];


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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy/MM/dd');
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
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">篩選條件</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">客戶來源</label>
            <select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部來源</option>
              <option value="website">官網</option>
              <option value="social_media">社群媒體</option>
              <option value="referral">推薦</option>
              <option value="advertisement">廣告</option>
              <option value="other">其他</option>
            </select>
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">標籤</label>
            <input
              type="text"
              value={filters.tags}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
              placeholder="標籤關鍵字"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">時間粒度</label>
            <select
              value={filters.period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">按日</option>
              <option value="month">按月</option>
              <option value="year">按年</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              重置篩選
            </button>
          </div>
        </div>
      </div>

      {/* 關鍵指標卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">總客戶數</p>
              <p className="text-3xl font-bold">{stats.overview.total_customers.toLocaleString()}</p>
              <p className="text-blue-200 text-sm mt-1">轉換率 {stats.overview.conversion_rate}%</p>
            </div>
            <div className="text-blue-200">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">總營收</p>
              <p className="text-3xl font-bold">{formatCurrency(stats.overview.total_revenue)}</p>
              <p className="text-green-200 text-sm mt-1">淨收入 {formatCurrency(stats.overview.net_revenue)}</p>
            </div>
            <div className="text-green-200">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">總訂單數</p>
              <p className="text-3xl font-bold">{stats.overview.total_orders.toLocaleString()}</p>
              <p className="text-purple-200 text-sm mt-1">平均訂單價值 {formatCurrency(stats.overview.average_order_value)}</p>
            </div>
            <div className="text-purple-200">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9a1 1 0 012 0v6a1 1 0 01-2 0V9zm6 0a1 1 0 012 0v6a1 1 0 01-2 0V9z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">總交易數</p>
              <p className="text-3xl font-bold">{stats.overview.total_transactions.toLocaleString()}</p>
              <p className="text-orange-200 text-sm mt-1">手續費 {formatCurrency(stats.transaction_stats.total_fees)}</p>
            </div>
            <div className="text-orange-200">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 營收趨勢圖 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">營收趨勢 ({filters.date_from} ~ {filters.date_to})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends.order_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => `日期: ${formatDate(label)}`}
              />
              <Area type="monotone" dataKey="total_amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 客戶增長趨勢 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">客戶增長趨勢 ({filters.date_from} ~ {filters.date_to})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends.customer_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip labelFormatter={(label) => `日期: ${formatDate(label)}`} />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 客戶來源分布 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">客戶來源分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.customer_stats.customer_sources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percent }) => `${source} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.customer_stats.customer_sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 付款方式分析 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">付款方式分析</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.transaction_stats.payment_methods}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="payment_method" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="total_amount" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 客戶等級分布圓餅圖 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">客戶等級分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerTiers}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ tier, percent }) => `${tier} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {customerTiers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {customerTiers.map((tier, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: tier.color }}
                ></div>
                <span className="text-sm text-gray-600">{tier.tier}: {tier.count}人</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 詳細統計表格 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 今日數據 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">今日數據</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">新增客戶</span>
              <span className="font-semibold">{stats.customer_stats.new_customers_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">新增訂單</span>
              <span className="font-semibold">{stats.order_stats.orders_today}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成交易</span>
              <span className="font-semibold">{stats.transaction_stats.transactions_today}</span>
            </div>
          </div>
        </div>

        {/* 本月數據 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">本月數據</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">新增客戶</span>
              <span className="font-semibold">{stats.customer_stats.new_customers_this_month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">新增訂單</span>
              <span className="font-semibold">{stats.order_stats.orders_this_month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">完成交易</span>
              <span className="font-semibold">{stats.transaction_stats.transactions_this_month}</span>
            </div>
          </div>
        </div>

        {/* 客戶價值 */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">客戶指標</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">平均客戶價值</span>
              <span className="font-semibold">{formatCurrency(stats.customer_stats.avg_customer_value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">待處理訂單</span>
              <span className="font-semibold">{stats.order_stats.pending_orders}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">轉換率</span>
              <span className="font-semibold">{stats.overview.conversion_rate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;