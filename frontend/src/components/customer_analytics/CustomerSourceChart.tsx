import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CustomerSourceData {
  source: string;
  count: number;
}

interface CustomerSourceChartProps {
  data: CustomerSourceData[];
}

const CustomerSourceChart: React.FC<CustomerSourceChartProps> = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">客戶來源分布</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ source, percent }) => `${source} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerSourceChart;