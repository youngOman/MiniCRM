import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface SeasonalData {
  season: string;
  season_display: string;
  count: number;
  percentage: number;
  avg_spent: number;
  total_spent: number;
  avg_orders: number;
}

interface SeasonalAnalysisChartProps {
  data: SeasonalData[];
  type: 'distribution' | 'performance';
}

const SeasonalAnalysisChart: React.FC<SeasonalAnalysisChartProps> = ({ data, type }) => {
  const SEASON_COLORS = {
    'spring': '#10B981',   // 綠色 - 春
    'summer': '#F59E0B',   // 黃色 - 夏
    'autumn': '#EF4444',   // 紅色 - 秋
    'winter': '#3B82F6',   // 藍色 - 冬
    'year_round': '#8B5CF6' // 紫色 - 全年
  };

  const SEASON_ICONS = {
    'spring': '🌸',
    'summer': '☀️', 
    'autumn': '🍂',
    'winter': '❄️',
    'year_round': '🔄'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTitle = () => {
    return type === 'distribution' ? '季節性購買偏好分布' : '季節性購買表現分析';
  };

  if (type === 'distribution') {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ season_display, percentage }) => `${season_display} ${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={SEASON_COLORS[entry.season as keyof typeof SEASON_COLORS] || '#6B7280'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} 人`, '客戶數']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* 季節分布詳情 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {SEASON_ICONS[item.season as keyof typeof SEASON_ICONS]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{item.season_display}</div>
                  <div className="text-sm text-gray-500">{item.count} 人 ({item.percentage.toFixed(1)}%)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{formatCurrency(item.avg_spent)}</div>
                <div className="text-sm text-gray-500">平均消費</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // performance type
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="season_display"
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), '平均消費金額']}
          />
          <Bar dataKey="avg_spent">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={SEASON_COLORS[entry.season as keyof typeof SEASON_COLORS] || '#6B7280'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* 詳細表現分析 */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">季節表現排名</h4>
        <div className="space-y-3">
          {data
            .sort((a, b) => b.avg_spent - a.avg_spent)
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="text-2xl">
                      {SEASON_ICONS[item.season as keyof typeof SEASON_ICONS]}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.season_display}</div>
                    <div className="text-sm text-gray-500">{item.count} 位客戶偏好</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-lg text-gray-900">{formatCurrency(item.avg_spent)}</div>
                  <div className="text-sm text-gray-500">平均 {item.avg_orders.toFixed(1)} 筆訂單</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 季節性洞察 */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-blue-900 mb-2">💡 季節性行銷洞察</h4>
        <div className="text-sm text-blue-800 space-y-1">
          {data.length > 0 && (
            <>
              <div>• 最高消費季節：{data.sort((a, b) => b.avg_spent - a.avg_spent)[0]?.season_display} ({formatCurrency(data.sort((a, b) => b.avg_spent - a.avg_spent)[0]?.avg_spent)})</div>
              <div>• 最受歡迎季節：{data.sort((a, b) => b.count - a.count)[0]?.season_display} ({data.sort((a, b) => b.count - a.count)[0]?.count} 人偏好)</div>
              <div>• 建議重點關注高價值季節的促銷活動安排</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalAnalysisChart;