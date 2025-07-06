import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface GenderData {
  gender: string;
  gender_display: string;
  count: number;
  total_spent: number;
  avg_spent: number;
  avg_orders: number;
}

interface GenderAnalysisChartProps {
  data: GenderData[];
  type: 'distribution' | 'spending' | 'behavior';
}

const GenderAnalysisChart: React.FC<GenderAnalysisChartProps> = ({ data, type }) => {
  const COLORS = {
    'male': '#3B82F6',
    'female': '#EC4899', 
    'other': '#8B5CF6',
    'prefer_not_to_say': '#6B7280'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTitle = () => {
    switch (type) {
      case 'distribution': return '性別分布';
      case 'spending': return '性別平均消費金額';
      case 'behavior': return '性別購買行為對比';
      default: return '性別分析';
    }
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
              label={({ gender_display, percent }) => `${gender_display} ${((percent ?? 0) * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.gender as keyof typeof COLORS] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value} 人`, '客戶數']}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* 圖例和統計 */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.gender as keyof typeof COLORS] || '#6B7280' }}
                ></div>
                <span className="text-sm text-gray-700">{item.gender_display}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {item.count}人 ({((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'spending') {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gender_display" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '平均消費金額']}
            />
            <Bar dataKey="avg_spent" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
        
        {/* 消費統計摘要 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(Math.max(...data.map(d => d.avg_spent)))}
            </div>
            <div className="text-gray-500">最高平均消費</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(Math.min(...data.map(d => d.avg_spent)))}
            </div>
            <div className="text-gray-500">最低平均消費</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(data.reduce((sum, d) => sum + d.total_spent, 0) / data.reduce((sum, d) => sum + d.count, 0))}
            </div>
            <div className="text-gray-500">整體平均消費</div>
          </div>
        </div>
      </div>
    );
  }

  // behavior type - 顯示訂單頻率對比
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="gender_display" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [value.toFixed(1), '平均訂單數']}
          />
          <Bar dataKey="avg_orders" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
      
      {/* 行為分析摘要 */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[item.gender as keyof typeof COLORS] || '#6B7280' }}
              ></div>
              <span className="text-sm font-medium">{item.gender_display}</span>
            </div>
            <div className="text-sm text-gray-600">
              平均 {item.avg_orders.toFixed(1)} 筆訂單 • {formatCurrency(item.avg_spent)} 消費
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderAnalysisChart;