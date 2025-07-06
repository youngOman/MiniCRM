import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AgeGroupData {
  age_group: string;
  count: number;
  total_spent: number;
  avg_spent: number;
}

interface AgeAnalysisChartProps {
  data: AgeGroupData[];
  type: 'distribution' | 'spending';
}

const AgeAnalysisChart: React.FC<AgeAnalysisChartProps> = ({ data, type }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDataKey = () => {
    return type === 'distribution' ? 'count' : 'avg_spent';
  };

  const getYAxisLabel = () => {
    return type === 'distribution' ? '客戶數量' : '平均消費金額';
  };

  const getTooltipFormatter = (value: number) => {
    return type === 'distribution' ? `${value} 人` : formatCurrency(value);
  };

  const getTitle = () => {
    return type === 'distribution' ? '年齡分布' : '年齡群組平均消費金額';
  };

  const getBarColor = () => {
    return type === 'distribution' ? '#3B82F6' : '#10B981';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="age_group" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            label={{ 
              value: getYAxisLabel(), 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip 
            formatter={(value: number) => [getTooltipFormatter(value), getYAxisLabel()]}
            labelFormatter={(label) => `年齡群組: ${label}`}
          />
          <Bar dataKey={getDataKey()} fill={getBarColor()} />
        </BarChart>
      </ResponsiveContainer>
      
      {/* 統計摘要 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-gray-500">總客戶數</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.total_spent, 0))}
          </div>
          <div className="text-gray-500">總消費金額</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {data.length > 0 ? formatCurrency(
              data.reduce((sum, item) => sum + item.total_spent, 0) / 
              data.reduce((sum, item) => sum + item.count, 0)
            ) : '$0'}
          </div>
          <div className="text-gray-500">整體平均消費</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {data.length}
          </div>
          <div className="text-gray-500">年齡群組數</div>
        </div>
      </div>
    </div>
  );
};

export default AgeAnalysisChart;