import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PaymentMethodData {
  payment_method: string;
  count: number;
  total_amount: number;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
}

const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">付款方式分析</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="payment_method" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Bar dataKey="total_amount" fill="#8B5CF6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentMethodChart;