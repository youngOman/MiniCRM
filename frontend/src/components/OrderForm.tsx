import React, { useState, useEffect } from 'react';
import { Order, OrderItem } from '../types/order';
import { Customer } from '../types/customer';
import api from '../services/api';

interface OrderFormProps {
  order?: Order;
  onSave: (order: Order) => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ order, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    customer: 0,
    status: 'pending',
    subtotal: 0,
    tax_amount: 0,
    shipping_amount: 0,
    discount_amount: 0,
    shipping_address: '',
    billing_address: '',
    notes: '',
    items: [] as Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>[],
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  useEffect(() => {
    fetchCustomers();
    if (order) {
      console.log('Loading order data for edit:', order);
      setFormData({
        customer: order.customer,
        status: order.status,
        subtotal: typeof order.subtotal === 'number' ? order.subtotal : parseFloat(order.subtotal || '0'),
        tax_amount: typeof order.tax_amount === 'number' ? order.tax_amount : parseFloat(order.tax_amount || '0'),
        shipping_amount: typeof order.shipping_amount === 'number' ? order.shipping_amount : parseFloat(order.shipping_amount || '0'),
        discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : parseFloat(order.discount_amount || '0'),
        shipping_address: order.shipping_address || '',
        billing_address: order.billing_address || '',
        notes: order.notes || '',
        items: order.items?.map(item => ({
          product_name: item.product_name,
          product_sku: item.product_sku || '',
          quantity: item.quantity,
          unit_price: typeof item.unit_price === 'number' ? item.unit_price : parseFloat(item.unit_price || '0'),
          total_price: typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price || '0'),
        })) || [],
      });
    }
  }, [order]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer) {
      newErrors.customer = 'Customer is required';
    }
    if (formData.subtotal < 0) {
      newErrors.subtotal = 'Subtotal cannot be negative';
    }
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.product_name.trim()) {
        newErrors[`item_${index}_product_name`] = 'Product name is required';
      }
      if (Number(item.quantity) <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (Number(item.unit_price) <= 0) {
        newErrors[`item_${index}_unit_price`] = 'Unit price must be greater than 0';
      }
    });

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
      let response;
      if (order) {
        console.log('Updating order:', order.id, formData);
        response = await api.put(`/orders/${order.id}/`, formData);
      } else {
        console.log('Creating new order:', formData);
        response = await api.post('/orders/', formData);
      }
      onSave(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'An error occurred while saving the order' });
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

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...formData.items];
    const currentItem = updatedItems[index];
    updatedItems[index] = {
      ...currentItem,
      [field]: value,
      total_price: field === 'quantity' || field === 'unit_price' 
        ? (field === 'quantity' ? Number(value) : Number(currentItem.quantity)) * 
          (field === 'unit_price' ? Number(value) : Number(currentItem.unit_price))
        : Number(currentItem.total_price)
    };
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
    
    // Clear item-specific errors
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product_name: '',
        product_sku: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.subtotal + formData.tax_amount + formData.shipping_amount - formData.discount_amount;
  };

  useEffect(() => {
    // Auto-calculate subtotal from items
    const subtotal = formData.items.reduce((sum, item) => {
      const totalPrice = typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price.toString() || '0');
      return sum + totalPrice;
    }, 0);
    setFormData(prev => ({ ...prev, subtotal }));
  }, [formData.items]);

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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {order ? 'Edit Order' : 'Create New Order'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {order ? 'Update order information below.' : 'Fill in the details to create a new order.'}
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

        {/* Order Information Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
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
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                  Order Status
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

        {/* Order Items Section */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            {errors.items && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errors.items}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="text-base font-semibold text-gray-900">Item {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                        className={inputClass(`item_${index}_product_name`)}
                        placeholder="Enter product name"
                      />
                      {errors[`item_${index}_product_name`] && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors[`item_${index}_product_name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={item.product_sku}
                        onChange={(e) => handleItemChange(index, 'product_sku', e.target.value)}
                        className={inputClass(`item_${index}_product_sku`)}
                        placeholder="Enter SKU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={inputClass(`item_${index}_quantity`)}
                        placeholder="1"
                      />
                      {errors[`item_${index}_quantity`] && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors[`item_${index}_quantity`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className={inputClass(`item_${index}_unit_price`)}
                        placeholder="0.00"
                      />
                      {errors[`item_${index}_unit_price`] && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors[`item_${index}_unit_price`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Total Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={(typeof item.total_price === 'number' ? item.total_price : parseFloat(item.total_price.toString() || '0')).toFixed(2)}
                        readOnly
                        className="mt-2 block w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Financial Details Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="subtotal" className="block text-sm font-semibold text-gray-700">
                  Subtotal
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="subtotal"
                  name="subtotal"
                  value={formData.subtotal.toFixed(2)}
                  readOnly
                  className="mt-2 block w-full px-4 py-3 text-base border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Calculated from items</p>
              </div>

              <div>
                <label htmlFor="tax_amount" className="block text-sm font-semibold text-gray-700">
                  Tax Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="tax_amount"
                  name="tax_amount"
                  value={formData.tax_amount}
                  onChange={handleChange}
                  className={inputClass('tax_amount')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="shipping_amount" className="block text-sm font-semibold text-gray-700">
                  Shipping Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="shipping_amount"
                  name="shipping_amount"
                  value={formData.shipping_amount}
                  onChange={handleChange}
                  className={inputClass('shipping_amount')}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="discount_amount" className="block text-sm font-semibold text-gray-700">
                  Discount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="discount_amount"
                  name="discount_amount"
                  value={formData.discount_amount}
                  onChange={handleChange}
                  className={inputClass('discount_amount')}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Order Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shipping_address" className="block text-sm font-semibold text-gray-700">
                  Shipping Address
                </label>
                <textarea
                  id="shipping_address"
                  name="shipping_address"
                  rows={4}
                  value={formData.shipping_address}
                  onChange={handleChange}
                  className={textareaClass('shipping_address')}
                  placeholder="Enter shipping address"
                />
              </div>

              <div>
                <label htmlFor="billing_address" className="block text-sm font-semibold text-gray-700">
                  Billing Address
                </label>
                <textarea
                  id="billing_address"
                  name="billing_address"
                  rows={4}
                  value={formData.billing_address}
                  onChange={handleChange}
                  className={textareaClass('billing_address')}
                  placeholder="Enter billing address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h3>
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                Order Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                className={textareaClass('notes')}
                placeholder="Enter any additional notes about this order"
              />
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
            {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};


export default OrderForm;