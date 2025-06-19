import React, { useState, useEffect } from 'react';
import { Transaction } from '../types/transaction';
import { Customer } from '../types/customer';
import { Order } from '../types/order';
import api from '../services/api';

interface TransactionFormProps {
  transaction?: Transaction;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: 0,
    order: 0,
    transaction_type: 'sale',
    payment_method: 'credit_card',
    status: 'pending',
    amount: 0,
    fee_amount: 0,
    currency: 'USD',
    gateway_transaction_id: '',
    gateway_response: '',
    description: '',
    notes: '',
    processed_at: '',
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const transactionTypeOptions = [
    { value: 'sale', label: 'Sale' },
    { value: 'refund', label: 'Refund' },
    { value: 'payment', label: 'Payment' },
    { value: 'chargeback', label: 'Chargeback' },
  ];

  const paymentMethodOptions = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  useEffect(() => {
    fetchCustomers();
    fetchOrders();
    if (transaction) {
      console.log('Loading transaction data for edit:', transaction);
      setFormData({
        customer: transaction.customer,
        order: transaction.order || 0,
        transaction_type: transaction.transaction_type,
        payment_method: transaction.payment_method,
        status: transaction.status,
        amount: typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount || '0'),
        fee_amount: typeof transaction.fee_amount === 'number' ? transaction.fee_amount : parseFloat(transaction.fee_amount || '0'),
        currency: transaction.currency,
        gateway_transaction_id: transaction.gateway_transaction_id || '',
        gateway_response: transaction.gateway_response || '',
        description: transaction.description || '',
        notes: transaction.notes || '',
        processed_at: transaction.processed_at || '',
      });
    }
  }, [transaction]);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get<{ results: Customer[] }>('/customers/');
      setCustomers(response.data.results);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await api.get<{ results: Order[] }>('/orders/');
      setOrders(response.data.results);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (formData.fee_amount < 0) {
      newErrors.fee_amount = 'Fee amount cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        order: formData.order || null, // Convert 0 to null for optional field
        processed_at: formData.processed_at || null,
      };

      let response;
      if (transaction) {
        console.log('Updating transaction:', transaction.id, submitData);
        response = await api.put(`/transactions/${transaction.id}/`, submitData);
      } else {
        console.log('Creating new transaction:', submitData);
        response = await api.post('/transactions/', submitData);
      }
      onSave(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred while saving the transaction' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const calculateNetAmount = () => {
    return formData.amount - formData.fee_amount;
  };

  const getFilteredOrders = () => {
    if (!formData.customer) return orders;
    return orders.filter(order => order.customer === formData.customer);
  };

  // Enhanced input field styling
  const inputClass = (fieldName: string) => 
    `mt-2 block w-full px-4 py-3 text-base border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[fieldName] 
        ? 'border-red-300 bg-red-50 focus:ring-red-500' 
        : 'border-gray-300 bg-white hover:border-gray-400 focus:bg-white'
    }`;

  const selectClass = (fieldName: string) => 
    `mt-2 block w-full px-4 py-3 text-base border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
      errors[fieldName] 
        ? 'border-red-300 focus:ring-red-500' 
        : 'border-gray-300 hover:border-gray-400'
    }`;

  const textareaClass = (fieldName: string) => 
    `mt-2 block w-full px-4 py-3 text-base border rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
      errors[fieldName] 
        ? 'border-red-300 bg-red-50 focus:ring-red-500' 
        : 'border-gray-300 bg-white hover:border-gray-400 focus:bg-white'
    }`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Create New Transaction'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {transaction ? 'Update transaction information below.' : 'Fill in the details to create a new transaction.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
          {errors.general && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customer" className="block text-sm font-semibold text-gray-700">
                    Customer *
                  </label>
                  <select
                    id="customer"
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    disabled={loadingCustomers}
                    className={selectClass('customer')}
                  >
                    <option value={0}>Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name} ({customer.email})
                      </option>
                    ))}
                  </select>
                  {errors.customer && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.customer}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-semibold text-gray-700">
                    Related Order (Optional)
                  </label>
                  <select
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    disabled={loadingOrders}
                    className={selectClass('order')}
                  >
                    <option value={0}>No related order</option>
                    {getFilteredOrders().map(order => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - ${typeof order.total === 'number' ? order.total.toFixed(2) : parseFloat(order.total || '0').toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="transaction_type" className="block text-sm font-semibold text-gray-700">
                    Transaction Type
                  </label>
                  <select
                    id="transaction_type"
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleChange}
                    className={selectClass('transaction_type')}
                  >
                    {transactionTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="payment_method" className="block text-sm font-semibold text-gray-700">
                    Payment Method
                  </label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className={selectClass('payment_method')}
                  >
                    {paymentMethodOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectClass('status')}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={inputClass('amount')}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="fee_amount" className="block text-sm font-semibold text-gray-700">
                    Fee Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    id="fee_amount"
                    name="fee_amount"
                    value={formData.fee_amount}
                    onChange={handleChange}
                    className={inputClass('fee_amount')}
                    placeholder="0.00"
                  />
                  {errors.fee_amount && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.fee_amount}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-semibold text-gray-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    maxLength={3}
                    placeholder="USD"
                    className={inputClass('currency')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    Net Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calculateNetAmount().toFixed(2)}
                    readOnly
                    className="mt-2 block w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Amount minus fees</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gateway Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gateway_transaction_id" className="block text-sm font-semibold text-gray-700">
                    Gateway Transaction ID
                  </label>
                  <input
                    type="text"
                    id="gateway_transaction_id"
                    name="gateway_transaction_id"
                    value={formData.gateway_transaction_id}
                    onChange={handleChange}
                    className={inputClass('gateway_transaction_id')}
                    placeholder="Enter gateway transaction ID"
                  />
                </div>

                <div>
                  <label htmlFor="processed_at" className="block text-sm font-semibold text-gray-700">
                    Processed At
                  </label>
                  <input
                    type="datetime-local"
                    id="processed_at"
                    name="processed_at"
                    value={formData.processed_at}
                    onChange={handleChange}
                    className={inputClass('processed_at')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gateway_response" className="block text-sm font-semibold text-gray-700">
                  Gateway Response
                </label>
                <textarea
                  id="gateway_response"
                  name="gateway_response"
                  rows={3}
                  value={formData.gateway_response}
                  onChange={handleChange}
                  placeholder="Raw response from payment gateway"
                  className={textareaClass('gateway_response')}
                />
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the transaction"
                    className={inputClass('description')}
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                    Internal Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Internal notes and comments"
                    className={textareaClass('notes')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Saving...' : transaction ? 'Update Transaction' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;