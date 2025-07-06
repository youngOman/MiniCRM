import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CustomerTier {
  tier: string;
  count: number;
  color: string;
}

interface CustomerTierChartProps {
  data: CustomerTier[];
}

const CustomerTierChart: React.FC<CustomerTierChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">客戶等級分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ tier, percent }) => `${tier} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((tier, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: tier.color }}
            ></div>
            <span className="text-sm text-gray-600">{tier.tier}: {tier.count}人</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerTierChart;