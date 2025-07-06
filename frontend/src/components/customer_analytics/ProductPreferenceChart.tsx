import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProductCategoryData {
  category: string;
  count: number;
  percentage: number;
  avg_spent: number;
  total_spent: number;
}

interface ProductPreferenceChartProps {
  data: ProductCategoryData[];
  type: 'popularity' | 'revenue';
}

const ProductPreferenceChart: React.FC<ProductPreferenceChartProps> = ({ data, type }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 根據數值大小產生漸層色彩
  const getBarColor = (value: number, maxValue: number) => {
    const intensity = value / maxValue;
    if (type === 'popularity') {
      return `hsl(217, ${50 + intensity * 50}%, ${70 - intensity * 20}%)`;
    } else {
      return `hsl(142, ${50 + intensity * 50}%, ${70 - intensity * 20}%)`;
    }
  };

  const sortedData = [...data].sort((a, b) => {
    return type === 'popularity' ? b.count - a.count : b.total_spent - a.total_spent;
  });

  const maxValue = type === 'popularity' 
    ? Math.max(...data.map(d => d.count))
    : Math.max(...data.map(d => d.total_spent));

  const getDataKey = () => type === 'popularity' ? 'count' : 'total_spent';
  const getYAxisLabel = () => type === 'popularity' ? '感興趣客戶數' : '相關總消費金額';
  const getTitle = () => type === 'popularity' ? '產品類別受歡迎程度' : '產品類別營收貢獻';

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">{getTitle()}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={sortedData} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="category" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            label={{ 
              value: getYAxisLabel(), 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip 
            formatter={(value: number) => [
              type === 'popularity' ? `${value} 人` : formatCurrency(value), 
              getYAxisLabel()
            ]}
            labelFormatter={(label) => `產品類別: ${label}`}
          />
          <Bar dataKey={getDataKey()}>
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(
                  type === 'popularity' ? entry.count : entry.total_spent, 
                  maxValue
                )} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* 詳細統計表格 */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">詳細排名</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-700">排名</th>
                <th className="px-3 py-2 text-left font-medium text-gray-700">產品類別</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">感興趣人數</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">市場占比</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">平均消費</th>
                <th className="px-3 py-2 text-right font-medium text-gray-700">總消費</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedData.slice(0, 5).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium text-gray-900">{item.category}</td>
                  <td className="px-3 py-2 text-right">{item.count} 人</td>
                  <td className="px-3 py-2 text-right">{item.percentage.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(item.avg_spent)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.total_spent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 總結統計 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{data.length}</div>
          <div className="text-gray-500">產品類別總數</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-gray-500">總感興趣人次</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {formatCurrency(data.reduce((sum, item) => sum + item.total_spent, 0))}
          </div>
          <div className="text-gray-500">總相關消費</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900">
            {data.length > 0 ? (data.reduce((sum, item) => sum + item.count, 0) / data.length).toFixed(1) : '0'}
          </div>
          <div className="text-gray-500">平均每類別人數</div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreferenceChart;