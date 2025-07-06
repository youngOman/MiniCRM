import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CustomerSegmentData {
  age: number;
  total_spent: number;
  total_orders: number;
  full_name: string;
  gender: string;
  tier: string;
}

interface CustomerSegmentMatrixProps {
  data: CustomerSegmentData[];
}

const CustomerSegmentMatrix: React.FC<CustomerSegmentMatrixProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // 客戶等級顏色映射
  const TIER_COLORS = {
    '白金客戶': '#8B5CF6',
    '黃金客戶': '#F59E0B', 
    '白銀客戶': '#6B7280',
    '一般客戶': '#10B981',
    '潛在客戶': '#EF4444'
  };

  // 計算年齡和消費的統計信息
  const ageStats = {
    min: Math.min(...data.map(d => d.age)),
    max: Math.max(...data.map(d => d.age)),
    avg: data.reduce((sum, d) => sum + d.age, 0) / data.length
  };

  const spentStats = {
    min: Math.min(...data.map(d => d.total_spent)),
    max: Math.max(...data.map(d => d.total_spent)),
    avg: data.reduce((sum, d) => sum + d.total_spent, 0) / data.length
  };

  // 客戶細分邏輯
  const getSegmentLabel = (age: number, spent: number) => {
    const isHighAge = age > ageStats.avg;
    const isHighSpent = spent > spentStats.avg;
    
    if (isHighAge && isHighSpent) return '成熟高價值';
    if (isHighAge && !isHighSpent) return '成熟潛力';
    if (!isHighAge && isHighSpent) return '年輕高價值';
    return '年輕潛力';
  };

  // 統計各細分區域的客戶數量
  const segmentStats = data.reduce((acc, customer) => {
    const segment = getSegmentLabel(customer.age, customer.total_spent);
    acc[segment] = (acc[segment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.full_name}</p>
          <p className="text-sm text-gray-600">年齡: {data.age} 歲</p>
          <p className="text-sm text-gray-600">總消費: {formatCurrency(data.total_spent)}</p>
          <p className="text-sm text-gray-600">訂單數: {data.total_orders}</p>
          <p className="text-sm text-gray-600">等級: {data.tier}</p>
          <p className="text-sm text-gray-600">細分: {getSegmentLabel(data.age, data.total_spent)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">客戶細分矩陣（年齡 vs 消費金額）</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            dataKey="age" 
            name="年齡"
            label={{ value: '年齡', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="total_spent" 
            name="總消費金額"
            label={{ value: '總消費金額', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter dataKey="total_spent">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={TIER_COLORS[entry.tier as keyof typeof TIER_COLORS] || '#6B7280'}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* 參考線說明 */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">矩陣解讀</h4>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <div className="font-medium">年齡分界線: {ageStats.avg.toFixed(0)} 歲</div>
            <div>消費分界線: {formatCurrency(spentStats.avg)}</div>
          </div>
          <div>
            <div>年齡範圍: {ageStats.min} - {ageStats.max} 歲</div>
            <div>消費範圍: {formatCurrency(spentStats.min)} - {formatCurrency(spentStats.max)}</div>
          </div>
        </div>
      </div>

      {/* 客戶細分統計 */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">客戶細分分布</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(segmentStats).map(([segment, count]) => (
            <div key={segment} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-lg text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{segment}</div>
              <div className="text-xs text-gray-500">
                {((count / data.length) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 客戶等級圖例 */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-3">客戶等級圖例</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(TIER_COLORS).map(([tier, color]) => (
            <div key={tier} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-sm text-gray-700">{tier}</span>
              <span className="text-xs text-gray-500">
                ({data.filter(d => d.tier === tier).length} 人)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 行銷策略建議 */}
      <div className="mt-6 bg-green-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-green-900 mb-2">🎯 行銷策略建議</h4>
        <div className="text-sm text-green-800 space-y-1">
          <div>• <strong>成熟高價值</strong>：VIP 服務、高端產品推薦</div>
          <div>• <strong>年輕高價值</strong>：趨勢產品、會員升級方案</div>
          <div>• <strong>成熟潛力</strong>：實用產品、價值導向行銷</div>
          <div>• <strong>年輕潛力</strong>：入門產品、體驗式行銷</div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentMatrix;