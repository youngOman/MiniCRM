import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../../../services/api';

interface CLVOverview {
  total_customers: number;
  customers_with_orders: number;
  avg_clv: number;
  median_clv: number;
  total_clv: number;
  avg_order_value: number;
  avg_purchase_frequency: number;
}

interface CLVSegment {
  segment: string;
  count: number;
  total_value: number;
  avg_clv: number;
  percentage: number;
}

interface CLVBySource {
  source: string;
  count: number;
  avg_clv: number;
  total_clv: number;
  avg_orders: number;
}

interface TopCustomer {
  id: number;
  full_name: string;
  email: string;
  source: string;
  total_spent: number;
  total_orders: number;
  avg_order_value: number;
}

interface MonthlyTrend {
  month: string;
  new_customers: number;
  avg_clv: number;
  total_clv: number;
}

interface CustomerValueData {
  clv_overview: CLVOverview;
  clv_segments: CLVSegment[];
  clv_by_source: CLVBySource[];
  top_customers: TopCustomer[];
  monthly_clv_trend: MonthlyTrend[];
}

const CustomerValueAnalytics: React.FC = () => {
  const [data, setData] = useState<CustomerValueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_from: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    source: ''
  });

  useEffect(() => {
    fetchCLVData();
  }, [filters]);

  const fetchCLVData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/customer-clv/', { params: filters });
      setData(response.data);
    } catch (error) {
      console.error('載入客戶價值分析數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      date_from: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
      date_to: format(new Date(), 'yyyy-MM-dd'),
      source: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSegmentColor = (segment: string) => {
    const colors = {
      '低價值客戶': 'from-gray-500 to-gray-600',
      '中價值客戶': 'from-blue-500 to-blue-600',
      '高價值客戶': 'from-purple-500 to-purple-600',
      '頂級客戶': 'from-yellow-500 to-yellow-600'
    };
    return colors[segment as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶價值分析</h1>
        <p className="text-gray-600">深度分析客戶生命週期價值 (CLV)、消費模式與商業價值</p>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">篩選條件</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* CLV 概覽統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{formatCurrency(data.clv_overview.avg_clv)}</div>
              <div className="text-emerald-100 text-sm mt-1">平均 CLV</div>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.clv_overview.customers_with_orders}</div>
              <div className="text-blue-100 text-sm mt-1">有消費客戶</div>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('zh-TW', {
                  style: 'currency',
                  currency: 'TWD',
                  notation: 'compact',
                  minimumFractionDigits: 0
                }).format(data.clv_overview.total_clv)}
              </div>
              <div className="text-purple-100 text-sm mt-1">總客戶價值</div>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.clv_overview.avg_purchase_frequency.toFixed(1)}</div>
              <div className="text-orange-100 text-sm mt-1">月平均購買頻率</div>
            </div>
            <div className="text-4xl opacity-80">🔄</div>
          </div>
        </div>
      </div>

      {/* CLV 分布分析 */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">客戶價值分布</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.clv_segments.map((segment, index) => (
            <div key={index} className={`bg-gradient-to-r ${getSegmentColor(segment.segment)} rounded-lg p-4 text-white`}>
              <div className="text-lg font-semibold">{segment.segment}</div>
              <div className="text-2xl font-bold mt-2">{segment.count} 人</div>
              <div className="text-sm opacity-90">佔比 {segment.percentage}%</div>
              <div className="text-sm opacity-90">平均 CLV: {formatCurrency(segment.avg_clv)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 按來源的 CLV 分析 */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">各來源客戶價值</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">來源</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶數</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均 CLV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總價值</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均訂單數</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.clv_by_source.map((source, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.source === 'website' ? '官網' :
                     source.source === 'social_media' ? '社群媒體' :
                     source.source === 'referral' ? '推薦' :
                     source.source === 'advertisement' ? '廣告' : '其他'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{source.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(source.avg_clv)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(source.total_clv)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{source.avg_orders.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 頂級客戶列表 */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6">頂級客戶 (CLV 前20名)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">來源</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總消費</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">訂單數</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均訂單價值</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.top_customers.map((customer, index) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                    {index === 0 && <span className="ml-1">🥇</span>}
                    {index === 1 && <span className="ml-1">🥈</span>}
                    {index === 2 && <span className="ml-1">🥉</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.source === 'website' ? '官網' :
                     customer.source === 'social_media' ? '社群媒體' :
                     customer.source === 'referral' ? '推薦' :
                     customer.source === 'advertisement' ? '廣告' : '其他'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(customer.total_spent)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.total_orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(customer.avg_order_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 月度 CLV 趨勢 */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">月度 CLV 趨勢</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">月份</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">新客戶數</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均 CLV</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">總 CLV</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.monthly_clv_trend.map((trend, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trend.new_customers}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trend.avg_clv)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(trend.total_clv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerValueAnalytics;