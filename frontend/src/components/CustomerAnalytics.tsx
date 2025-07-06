import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../services/api';

// 分析圖表組件
import AgeAnalysisChart from './customer_analytics/AgeAnalysisChart';
import GenderAnalysisChart from './customer_analytics/GenderAnalysisChart';
import ProductPreferenceChart from './customer_analytics/ProductPreferenceChart';
import SeasonalAnalysisChart from './customer_analytics/SeasonalAnalysisChart';
import CustomerSegmentMatrix from './customer_analytics/CustomerSegmentMatrix';

// 數據接口定義
interface AgeGroupData {
  age_group: string;
  count: number;
  total_spent: number;
  avg_spent: number;
}

interface GenderData {
  gender: string;
  gender_display: string;
  count: number;
  total_spent: number;
  avg_spent: number;
  avg_orders: number;
}

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

interface CustomerSegmentData {
  age: number;
  total_spent: number;
  total_orders: number;
  full_name: string;
  gender: string;
  tier: string;
}

interface CustomerAnalyticsData {
  age_analysis: AgeGroupData[];
  gender_analysis: GenderData[];
  product_preferences: ProductCategoryData[];
  seasonal_analysis: SeasonalData[];
  customer_segments: CustomerSegmentData[];
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

const CustomerAnalytics: React.FC = () => {
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
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
    fetchAnalyticsData();
  }, [filters]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 暫時使用模擬數據，之後會創建真實的 API 端點
      const mockData: CustomerAnalyticsData = {
        age_analysis: [
          { age_group: '18-25', count: 25, total_spent: 125000, avg_spent: 5000 },
          { age_group: '26-35', count: 45, total_spent: 450000, avg_spent: 10000 },
          { age_group: '36-45', count: 35, total_spent: 525000, avg_spent: 15000 },
          { age_group: '46-55', count: 20, total_spent: 360000, avg_spent: 18000 },
          { age_group: '56+', count: 15, total_spent: 300000, avg_spent: 20000 }
        ],
        gender_analysis: [
          { gender: 'male', gender_display: '男性', count: 65, total_spent: 780000, avg_spent: 12000, avg_orders: 4.2 },
          { gender: 'female', gender_display: '女性', count: 70, total_spent: 910000, avg_spent: 13000, avg_orders: 4.8 },
          { gender: 'other', gender_display: '其他', count: 3, total_spent: 45000, avg_spent: 15000, avg_orders: 3.0 },
          { gender: 'prefer_not_to_say', gender_display: '不願透露', count: 2, total_spent: 25000, avg_spent: 12500, avg_orders: 2.5 }
        ],
        product_preferences: [
          { category: '電子產品', count: 45, percentage: 32.1, avg_spent: 15000, total_spent: 675000 },
          { category: '服飾配件', count: 38, percentage: 27.1, avg_spent: 8000, total_spent: 304000 },
          { category: '居家用品', count: 32, percentage: 22.9, avg_spent: 6000, total_spent: 192000 },
          { category: '美妝保養', count: 28, percentage: 20.0, avg_spent: 7000, total_spent: 196000 },
          { category: '運動健身', count: 25, percentage: 17.9, avg_spent: 9000, total_spent: 225000 },
          { category: '書籍文具', count: 20, percentage: 14.3, avg_spent: 3000, total_spent: 60000 },
          { category: '食品飲料', count: 18, percentage: 12.9, avg_spent: 4000, total_spent: 72000 },
          { category: '旅遊票券', count: 15, percentage: 10.7, avg_spent: 20000, total_spent: 300000 },
          { category: '汽車用品', count: 12, percentage: 8.6, avg_spent: 12000, total_spent: 144000 },
          { category: '寵物用品', count: 10, percentage: 7.1, avg_spent: 5000, total_spent: 50000 }
        ],
        seasonal_analysis: [
          { season: 'spring', season_display: '春季購買', count: 25, percentage: 29.4, avg_spent: 12000, total_spent: 300000, avg_orders: 4.2 },
          { season: 'summer', season_display: '夏季購買', count: 20, percentage: 23.5, avg_spent: 15000, total_spent: 300000, avg_orders: 5.1 },
          { season: 'autumn', season_display: '秋季購買', count: 18, percentage: 21.2, avg_spent: 14000, total_spent: 252000, avg_orders: 4.8 },
          { season: 'winter', season_display: '冬季購買', count: 15, percentage: 17.6, avg_spent: 16000, total_spent: 240000, avg_orders: 5.5 },
          { season: 'year_round', season_display: '全年均勻', count: 7, percentage: 8.2, avg_spent: 18000, total_spent: 126000, avg_orders: 6.2 }
        ],
        customer_segments: Array.from({ length: 50 }, (_, i) => ({
          age: 20 + Math.floor(Math.random() * 40),
          total_spent: Math.floor(Math.random() * 50000) + 1000,
          total_orders: Math.floor(Math.random() * 15) + 1,
          full_name: `客戶${i + 1}`,
          gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
          tier: ['一般客戶', '白銀客戶', '黃金客戶', '白金客戶'][Math.floor(Math.random() * 4)]
        })),
        overview: {
          total_customers: 140,
          customers_with_age: 125,
          customers_with_gender: 130,
          customers_with_preferences: 95,
          customers_with_seasonal: 85,
          avg_age: 36.5,
          data_completeness: 78.6
        }
      };

      setData(mockData);
    } catch (error) {
      console.error('載入客戶分析數據失敗:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶分析儀表板</h1>
        <p className="text-gray-600">深入了解客戶人口統計、偏好和行為模式</p>
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.total_customers}</div>
          <div className="text-blue-100 text-sm">總客戶數</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.customers_with_age}</div>
          <div className="text-green-100 text-sm">有年齡資料</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.customers_with_gender}</div>
          <div className="text-purple-100 text-sm">有性別資料</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.customers_with_preferences}</div>
          <div className="text-orange-100 text-sm">有產品偏好</div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.avg_age.toFixed(1)}</div>
          <div className="text-pink-100 text-sm">平均年齡</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.data_completeness.toFixed(1)}%</div>
          <div className="text-indigo-100 text-sm">資料完整度</div>
        </div>
      </div>

      {/* 年齡分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <AgeAnalysisChart data={data.age_analysis} type="distribution" />
        <AgeAnalysisChart data={data.age_analysis} type="spending" />
      </div>

      {/* 性別分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <GenderAnalysisChart data={data.gender_analysis} type="distribution" />
        <GenderAnalysisChart data={data.gender_analysis} type="spending" />
        <GenderAnalysisChart data={data.gender_analysis} type="behavior" />
      </div>

      {/* 產品偏好分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProductPreferenceChart data={data.product_preferences} type="popularity" />
        <ProductPreferenceChart data={data.product_preferences} type="revenue" />
      </div>

      {/* 季節性分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <SeasonalAnalysisChart data={data.seasonal_analysis} type="distribution" />
        <SeasonalAnalysisChart data={data.seasonal_analysis} type="performance" />
      </div>

      {/* 客戶細分矩陣 */}
      <div className="mb-8">
        <CustomerSegmentMatrix data={data.customer_segments} />
      </div>
    </div>
  );
};

export default CustomerAnalytics;