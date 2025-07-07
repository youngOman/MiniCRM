import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../../../services/api';

// 分析圖表組件
import CustomerSourceChart from '../CustomerSourceChart';
import CustomerTierChart from '../CustomerTierChart';
import CustomerSegmentMatrix from '../CustomerSegmentMatrix';

// 數據接口定義
interface CustomerSourceData {
  source: string;
  count: number;
}

interface CustomerTierData {
  tier: string;
  count: number;
  color: string;
}

interface CustomerSegmentData {
  age: number;
  total_spent: number;
  total_orders: number;
  full_name: string;
  gender: string;
  tier: string;
}

interface CustomerSegmentationData {
  customer_sources: CustomerSourceData[];
  customer_tiers: CustomerTierData[];
  customer_segments: CustomerSegmentData[];
  overview: {
    total_customers: number;
    most_common_source: string;
    most_common_tier: string;
    segment_diversity: number;
  };
}

const CustomerSegmentation: React.FC = () => {
  const [data, setData] = useState<CustomerSegmentationData | null>(null);
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
    fetchSegmentationData();
  }, [filters]);

  const fetchSegmentationData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/customer-demographics/', { params: filters });
      setData(response.data);
    } catch (error) {
      console.error('載入客戶分群分析數據失敗:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶分群分析</h1>
        <p className="text-gray-600">了解客戶來源渠道、等級分布和細分群體特徵</p>
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
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.total_customers}</div>
          <div className="text-blue-100 text-sm">總客戶數</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-lg font-bold">{data.overview.most_common_source || '無資料'}</div>
          <div className="text-green-100 text-sm">主要來源</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-lg font-bold">{data.overview.most_common_tier || '無資料'}</div>
          <div className="text-purple-100 text-sm">主要等級</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.segment_diversity?.toFixed(1) || '0.0'}</div>
          <div className="text-orange-100 text-sm">分群多樣性</div>
        </div>
      </div>

      {/* 來源和等級分析 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">客戶來源與等級分析</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CustomerSourceChart data={data.customer_sources} />
          <CustomerTierChart data={data.customer_tiers} />
        </div>
      </div>

      {/* 客戶細分矩陣 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">客戶細分矩陣</h2>
        <CustomerSegmentMatrix data={data.customer_segments} />
      </div>

      {/* 分群洞察卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">渠道優化建議</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">加強主要來源渠道的投資</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">探索表現較差渠道的改善機會</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">開發新的客戶獲取渠道</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">等級管理策略</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">設計高等級客戶專屬權益</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">建立客戶等級提升路徑</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">針對不同等級制定差異化服務</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">精準行銷策略</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">基於客戶群體特徵個人化內容</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">設計分群專屬的促銷活動</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <p className="text-gray-600 text-sm">優化客戶觸點和溝通時機</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;