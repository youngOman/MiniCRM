import React from 'react';

interface FilterState {
  date_from: string;
  date_to: string;
  source: string;
  period: string;
}

interface DashboardFiltersProps {
  filters: FilterState;
  onFilterChange: (field: string, value: string) => void;
  onResetFilters: () => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ 
  filters, 
  onFilterChange, 
  onResetFilters 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <h2 className="text-lg font-semibold mb-4">篩選條件</h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">客戶來源</label>
          <select
            value={filters.source}
            onChange={(e) => onFilterChange('source', e.target.value)}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">時間粒度</label>
          <select
            value={filters.period}
            onChange={(e) => onFilterChange('period', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">按日</option>
            <option value="month">按月</option>
            <option value="year">按年</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onResetFilters}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            重置篩選
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;