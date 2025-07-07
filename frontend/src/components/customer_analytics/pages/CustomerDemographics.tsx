import React, { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import api from '../../../services/api';

// 分析圖表組件
import AgeAnalysisChart from '../AgeAnalysisChart';
import GenderAnalysisChart from '../GenderAnalysisChart';

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

interface CustomerDemographicsData {
  age_analysis: AgeGroupData[];
  gender_analysis: GenderData[];
  overview: {
    total_customers: number;
    customers_with_age: number;
    customers_with_gender: number;
    avg_age: number;
  };
}

// 客戶人口分析
const CustomerDemographics: React.FC = () => {
  const [data, setData] = useState<CustomerDemographicsData | null>(null);
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
    fetchDemographicsData();
  }, [filters]);

  const fetchDemographicsData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/customer-demographics/', { params: filters });
      setData(response.data);
    } catch (error) {
      console.error('載入客戶人口分析數據失敗:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">客戶人口分析</h1>
        <p className="text-gray-600">深入了解客戶年齡和性別分布及其消費行為</p>
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
          <div className="text-2xl font-bold">{data.overview.customers_with_age}</div>
          <div className="text-green-100 text-sm">有年齡資料</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.customers_with_gender}</div>
          <div className="text-purple-100 text-sm">有性別資料</div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="text-2xl font-bold">{data.overview.avg_age.toFixed(1)}</div>
          <div className="text-pink-100 text-sm">平均年齡</div>
        </div>
      </div>

      {/* 年齡分析 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">年齡分析</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AgeAnalysisChart data={data.age_analysis} type="distribution" />
          <AgeAnalysisChart data={data.age_analysis} type="spending" />
        </div>
      </div>

      {/* 性別分析 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">性別分析</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GenderAnalysisChart data={data.gender_analysis} type="distribution" />
          <GenderAnalysisChart data={data.gender_analysis} type="spending" />
          <GenderAnalysisChart data={data.gender_analysis} type="behavior" />
        </div>
      </div>
    </div>
  );
};

export default CustomerDemographics;