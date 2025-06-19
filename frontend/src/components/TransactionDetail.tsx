import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import api from '../services/api';

interface TransactionDetailProps {
  transactionId: number;
  onEdit: (transaction: Transaction) => void;
  onBack: () => void;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ transactionId, onEdit, onBack }) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactionData();
  }, [transactionId]);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      const response = await api.get<Transaction>(`/transactions/${transactionId}/`);
      setTransaction(response.data);
    } catch (err: any) {
      setError('Failed to fetch transaction data');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete transaction ${transaction.transaction_id}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/transactions/${transaction.id}/`);
      onBack();
    } catch (err: any) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  const formatCurrency = (amount: number | string, currency = 'USD') => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount || '0');
    return `${currency} ${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale': return 'bg-blue-100 text-blue-800';
      case 'refund': return 'bg-red-100 text-red-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'chargeback': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">Transaction not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Transactions
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Transaction {transaction.transaction_id}
              </h1>
              <p className="text-gray-600">
                {transaction.customer_info?.full_name || `Customer #${transaction.customer}`}
                {transaction.customer_info?.email && ` (${transaction.customer_info.email})`}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onEdit(transaction)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
            <div className="text-sm text-gray-500">Amount</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-600">
              {formatCurrency(transaction.net_amount, transaction.currency)}
            </div>
            <div className="text-sm text-gray-500">Net Amount</div>
          </div>
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Status</div>
          </div>
          <div className="text-center">
            <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(transaction.transaction_type)}`}>
              {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
            </div>
            <div className="text-sm text-gray-500 mt-1">Type</div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Transaction Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Transaction Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Transaction ID</dt>
                  <dd className="text-sm text-gray-900 font-mono">{transaction.transaction_id}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Payment Method</dt>
                  <dd className="text-sm text-gray-900">
                    {transaction.payment_method.replace('_', ' ').toUpperCase()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{formatDate(transaction.created_at)}</dd>
                </div>
                {transaction.processed_at && (
                  <div>
                    <dt className="text-sm text-gray-500">Processed</dt>
                    <dd className="text-sm text-gray-900">{formatDate(transaction.processed_at)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Financial Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">Amount</dt>
                  <dd className="text-sm text-gray-900 font-semibold">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Fee Amount</dt>
                  <dd className="text-sm text-gray-900">
                    {formatCurrency(transaction.fee_amount, transaction.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Net Amount</dt>
                  <dd className="text-sm text-gray-900 font-semibold">
                    {formatCurrency(transaction.net_amount, transaction.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-500">Currency</dt>
                  <dd className="text-sm text-gray-900">{transaction.currency}</dd>
                </div>
                {transaction.gateway_transaction_id && (
                  <div>
                    <dt className="text-sm text-gray-500">Gateway Transaction ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{transaction.gateway_transaction_id}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Customer Information</h2>
        </div>
        <div className="px-6 py-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <dt className="text-sm text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">
                {transaction.customer_info?.full_name || `Customer #${transaction.customer}`}
              </dd>
            </div>
            {transaction.customer_info?.email && (
              <div>
                <dt className="text-sm text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{transaction.customer_info.email}</dd>
              </div>
            )}
            {transaction.customer_info?.phone && (
              <div>
                <dt className="text-sm text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{transaction.customer_info.phone}</dd>
              </div>
            )}
            {transaction.customer_info?.company && (
              <div>
                <dt className="text-sm text-gray-500">Company</dt>
                <dd className="text-sm text-gray-900">{transaction.customer_info.company}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Related Order */}
      {transaction.order_info && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Related Order</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3">
              <div>
                <dt className="text-sm text-gray-500">Order Number</dt>
                <dd className="text-sm text-gray-900 font-mono">{transaction.order_info.order_number}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Order Status</dt>
                <dd className="text-sm text-gray-900">{transaction.order_info.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Order Total</dt>
                <dd className="text-sm text-gray-900">
                  {formatCurrency(transaction.order_info.total, transaction.currency)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Description and Notes */}
      {(transaction.description || transaction.notes) && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Additional Information</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {transaction.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
                <div className="text-sm text-gray-600">{transaction.description}</div>
              </div>
            )}
            {transaction.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Notes</h3>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">{transaction.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gateway Response */}
      {transaction.gateway_response && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Gateway Response</h2>
          </div>
          <div className="px-6 py-4">
            <div className="bg-gray-50 rounded-md p-4">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                {transaction.gateway_response}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetail;