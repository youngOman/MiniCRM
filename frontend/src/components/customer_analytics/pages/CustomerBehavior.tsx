import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../../../services/api';

// 分析圖表組件
import ProductPreferenceChart from '../ProductPreferenceChart';
import SeasonalAnalysisChart from '../SeasonalAnalysisChart';

// 數據接口定義
interface ProductCategoryData {
  category: string;
  count: number;
  percentage: number;
  avg_spent: number;
  total_spent: number;
}

interface SeasonalData {
  season: string;
  season_display: string;
  count: number;
  percentage: number;
  avg_spent: number;
  total_spent: number;
  avg_orders: number;
}

interface CustomerBehaviorData {
  product_preferences: ProductCategoryData[];
  seasonal_analysis: SeasonalData[];
  overview: {
    customers_with_preferences: number;
    customers_with_seasonal: number;
    most_popular_category: string;
    most_active_season: string;
  };
}

const CustomerBehavior: React.FC = () => {
  const [data, setData] = useState<CustomerBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_from: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
    date_to: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    age_min: '',
    age_max: '',
    gender: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debouncing effect for filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [filters]);

  useEffect(() => {
    fetchBehaviorData();
  }, [debouncedFilters]);

  const fetchBehaviorData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/customer-demographics/', { params: debouncedFilters });
      setData(response.data);
    } catch (error) {
      console.error('載入客戶行為分析數據失敗:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶行為分析</h1>
        <p className="text-gray-600">分析客戶的產品偏好和購買行為模式</p>
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

      {/* 概覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="text-2xl font-bold">{data.overview.customers_with_preferences}</div>
          <div className="text-gray-300 text-sm">有產品偏好客戶</div>
        </div>
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="text-2xl font-bold">{data.overview.customers_with_seasonal}</div>
          <div className="text-gray-300 text-sm">有季節偏好客戶</div>
        </div>
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="text-lg font-bold">{data.overview.most_popular_category || '無資料'}</div>
          <div className="text-gray-300 text-sm">最受歡迎類別</div>
        </div>
        <div className="bg-gradient-to-br from-black/80 via-slate-900/70 to-black/80 rounded-lg text-white p-6 shadow-xl">
          <div className="text-lg font-bold">{data.overview.most_active_season || '無資料'}</div>
          <div className="text-gray-300 text-sm">最活躍季節</div>
        </div>
      </div>

      {/* 產品偏好分析 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">產品偏好分析</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProductPreferenceChart data={data.product_preferences} type="popularity" />
          <ProductPreferenceChart data={data.product_preferences} type="revenue" />
        </div>
      </div>

      {/* 季節性分析 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">季節性購買分析</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SeasonalAnalysisChart data={data.seasonal_analysis} type="distribution" />
          <SeasonalAnalysisChart data={data.seasonal_analysis} type="performance" />
        </div>
      </div>

      {/* 行為洞察卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">產品策略建議</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">根據產品偏好數據，重點推廣熱門類別商品</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">針對低關注類別制定促銷策略</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">開發個人化推薦系統提升轉換率</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">營銷時機建議</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">在活躍季節加大行銷投入</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">淡季時期實施客戶回購策略</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">根據季節特性調整庫存和促銷</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBehavior;