import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

interface CustomerOverviewData {
  overview: {
    total_customers: number;
    customers_with_age: number;
    customers_with_gender: number;
    customers_with_preferences: number;
    customers_with_seasonal: number;
    avg_age: number;
    data_completeness: number;
  };
}

const CustomerOverview: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<CustomerOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_from: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    age_min: '',
    age_max: '',
    gender: ''
  });

  useEffect(() => {
    fetchOverviewData();
  }, [filters]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/customer-demographics/', { params: filters });
      setData(response.data);
    } catch (error) {
      console.error('載入客戶總覽數據失敗:', error);
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
      source: '',
      age_min: '',
      age_max: '',
      gender: ''
    });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶總覽</h1>
        <p className="text-gray-600">客戶數據基本統計與資料完整度概覽</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年齡範圍</label>
            <div className="flex space-x-1">
              <input
                type="number"
                placeholder="最小"
                value={filters.age_min}
                onChange={(e) => handleFilterChange('age_min', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <input
                type="number"
                placeholder="最大"
                value={filters.age_max}
                onChange={(e) => handleFilterChange('age_max', e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部性別</option>
              <option value="male">男性</option>
              <option value="female">女性</option>
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

      {/* 數據概覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overview.total_customers}</div>
              <div className="text-gray-300 text-sm mt-1">總客戶數</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overview.customers_with_age}</div>
              <div className="text-gray-300 text-sm mt-1">有年齡資料</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overview.customers_with_gender}</div>
              <div className="text-gray-300 text-sm mt-1">有性別資料</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overview.customers_with_preferences}</div>
              <div className="text-gray-300 text-sm mt-1">有產品偏好</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overview.avg_age.toFixed(1)}</div>
              <div className="text-gray-300 text-sm mt-1">平均年齡</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{data.overview.data_completeness.toFixed(1)}%</div>
              <div className="text-gray-300 text-sm mt-1">資料完整度</div>
            </div>
          </div>
        </div>

      </div>

      {/* 快速導航卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/customer-demographics')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">客戶人口分析</h3>
            <div className="text-2xl">📈</div>
          </div>
          <p className="text-gray-600 text-sm mb-4">深入了解客戶的年齡和性別分布，分析不同群體的消費行為</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            查看詳細分析 →
          </button>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/customer-behavior')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">客戶行為分析</h3>
            <div className="text-2xl">🛒</div>
          </div>
          <p className="text-gray-600 text-sm mb-4">分析客戶的產品偏好和季節性購買模式，優化產品策略</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            查看詳細分析 →
          </button>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/customer-segmentation')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">客戶分群分析</h3>
            <div className="text-2xl">🎯</div>
          </div>
          <p className="text-gray-600 text-sm mb-4">了解客戶來源渠道和等級分布，制定精準行銷策略</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            查看詳細分析 →
          </button>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/customer-value-analytics')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">客戶價值分析</h3>
            <div className="text-2xl">💰</div>
          </div>
          <p className="text-gray-600 text-sm mb-4">深度分析客戶生命週期價值 (CLV)、消費模式與商業價值</p>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            查看詳細分析 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;