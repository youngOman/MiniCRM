import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface CustomerTrendData {
  date: string;
  count: number;
}

interface CustomerGrowthChartProps {
  data: CustomerTrendData[];
  dateFrom: string;
  dateTo: string;
}

const CustomerGrowthChart: React.FC<CustomerGrowthChartProps> = ({ data, dateFrom, dateTo }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy/MM/dd');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">客戶增長趨勢 ({dateFrom} ~ {dateTo})</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
          <Tooltip labelFormatter={(label) => `日期: ${formatDate(label)}`} />
          <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerGrowthChart;