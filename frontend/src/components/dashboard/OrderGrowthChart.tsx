import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface OrderTrendData {
  date: string;
  count: number;
  total_amount: number;
}

interface OrderGrowthChartProps {
  data: OrderTrendData[];
  dateFrom: string;
  dateTo: string;
}

const OrderGrowthChart: React.FC<OrderGrowthChartProps> = ({ data, dateFrom, dateTo }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MM/dd');
    } catch {
      return dateString;
    }
  };

  const formatTooltipDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch {
      return dateString;
    }
  };

  const formattedData = data.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">訂單成長趨勢</h3>
        <p className="text-sm text-gray-600">
          期間：{format(new Date(dateFrom), 'yyyy-MM-dd')} 至 {format(new Date(dateTo), 'yyyy-MM-dd')}
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <Tooltip 
              labelFormatter={(value, payload) => {
                if (payload && payload.length > 0) {
                  const originalData = payload[0].payload;
                  return `日期: ${formatTooltipDate(originalData.date)}`;
                }
                return value;
              }}
              formatter={(value: number, name: string) => {
                if (name === 'count') {
                  return [value, '訂單數量'];
                }
                return [value, name];
              }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-sm text-gray-600">總訂單數</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {data.length > 0 ? Math.round(data.reduce((sum, item) => sum + item.count, 0) / data.length) : 0}
          </div>
          <div className="text-sm text-gray-600">平均每期</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.length > 1 ? 
              Math.round(((data[data.length - 1]?.count || 0) - (data[0]?.count || 0)) / (data[0]?.count || 1) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">成長率</div>
        </div>
      </div>
    </div>
  );
};

export default OrderGrowthChart;