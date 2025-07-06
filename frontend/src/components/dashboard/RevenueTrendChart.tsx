import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface OrderTrendData {
  date: string;
  count: number;
  total_amount: number;
}

interface RevenueTrendChartProps {
  data: OrderTrendData[];
  dateFrom: string;
  dateTo: string;
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, dateFrom, dateTo }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy/MM/dd');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">營收趨勢 ({dateFrom} ~ {dateTo})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => `日期: ${formatDate(label)}`}
          />
          <Area type="monotone" dataKey="total_amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;