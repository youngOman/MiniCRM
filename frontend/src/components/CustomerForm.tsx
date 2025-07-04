import React, { useState, useEffect } from 'react';
import { Customer } from '../types/customer';
import { CatchError, ApiError } from '../types/error';
import api from '../services/api';

interface CustomerFormProps {
  customer?: Customer;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
    source: 'other',
    tags: '',
    notes: '',
    // 新增的個人資訊欄位
    age: '',
    gender: '',
    // 產品偏好欄位
    product_categories_interest: [] as string[],
    seasonal_purchase_pattern: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sourceOptions = [
    { value: 'website', label: '官方網站' },
    { value: 'social_media', label: '社群媒體' },
    { value: 'referral', label: '推薦介紹' },
    { value: 'advertisement', label: '廣告宣傳' },
    { value: 'other', label: '其他' },
  ];

  const genderOptions = [
    { value: '', label: '請選擇' },
    { value: 'male', label: '男性' },
    { value: 'female', label: '女性' },
    { value: 'other', label: '其他' },
    { value: 'prefer_not_to_say', label: '不願透露' },
  ];

  const seasonalOptions = [
    { value: '', label: '請選擇' },
    { value: 'spring', label: '春季購買' },
    { value: 'summer', label: '夏季購買' },
    { value: 'autumn', label: '秋季購買' },
    { value: 'winter', label: '冬季購買' },
    { value: 'year_round', label: '全年均勻' },
  ];

  const productCategories = [
    '電子產品', '服飾配件', '居家用品', '美妝保養', '運動健身',
    '書籍文具', '食品飲料', '旅遊票券', '汽車用品', '寵物用品'
  ];

  useEffect(() => {
    if (customer) {
      console.log('Loading customer data for edit:', customer);
      setFormData({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        company: customer.company || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        country: customer.country || 'USA',
        source: customer.source || 'other',
        tags: customer.tags || '',
        notes: customer.notes || '',
        // 新增的個人資訊欄位
        age: customer.age?.toString() || '',
        gender: customer.gender || '',
        // 產品偏好欄位
        product_categories_interest: customer.product_categories_interest || [],
        seasonal_purchase_pattern: customer.seasonal_purchase_pattern || '',
        is_active: customer.is_active ?? true,
      });
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = '姓氏為必填項目';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = '名字為必填項目';
    }
    if (!formData.email.trim()) {
      newErrors.email = '電子信箱為必填項目';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '請輸入有效的電子信箱地址';
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
      // 準備提交數據，處理年齡的數字轉換
      const submitData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null,
      };
      
      let response;
      if (customer) {
        console.log('Updating customer:', customer.id, submitData);
        response = await api.put(`/customers/${customer.id}/`, submitData);
      } else {
        console.log('Creating new customer:', submitData);
        response = await api.post('/customers/', submitData);
      }
      onSave(response.data);
    } catch (error: CatchError) {
      console.error('Error saving customer:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.data) {
          setErrors(apiError.response.data as Record<string, string>);
        } else {
          setErrors({ general: '儲存客戶資料時發生錯誤' });
        }
      } else {
        setErrors({ general: '儲存客戶資料時發生錯誤' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
            {customer ? '編輯客戶' : '新增客戶'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {customer ? '在下方更新客戶資訊。' : '填寫詳細資料以建立新客戶。'}
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

          {/* Personal Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">個人資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700">
                    姓氏 *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={inputClass('first_name')}
                    placeholder="請輸入姓氏"
                  />
                  {errors.first_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700">
                    名字 *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={inputClass('last_name')}
                    placeholder="請輸入名字"
                  />
                  {errors.last_name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">聯絡資訊</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                    電子信箱 *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass('email')}
                    placeholder="請輸入電子信箱"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                    電話號碼
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass('phone')}
                    placeholder="請輸入電話號碼"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700">
                  公司名稱
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={inputClass('company')}
                  placeholder="請輸入公司名稱"
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">地址資訊</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                    街道地址
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className={textareaClass('address')}
                    placeholder="請輸入街道地址"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700">
                      城市
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={inputClass('city')}
                      placeholder="請輸入城市"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-gray-700">
                      州/省
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={inputClass('state')}
                      placeholder="請輸入州/省"
                    />
                  </div>

                  <div>
                    <label htmlFor="zip_code" className="block text-sm font-semibold text-gray-700">
                      郵遞區號
                    </label>
                    <input
                      type="text"
                      id="zip_code"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className={inputClass('zip_code')}
                      placeholder="請輸入郵遞區號"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-gray-700">
                      國家
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={inputClass('country')}
                      placeholder="請輸入國家"
                    />
                  </div>

                  <div>
                    <label htmlFor="source" className="block text-sm font-semibold text-gray-700">
                      客戶來源
                    </label>
                    <select
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className={selectClass('source')}
                    >
                      {sourceOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Preferences Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">個人偏好</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
                    年齡
                  </label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className={inputClass('age')}
                    placeholder="請輸入年齡"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
                    性別
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={inputClass('gender')}
                  >
                    {genderOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="seasonal_purchase_pattern" className="block text-sm font-semibold text-gray-700">
                    購買季節偏好
                  </label>
                  <select
                    id="seasonal_purchase_pattern"
                    name="seasonal_purchase_pattern"
                    value={formData.seasonal_purchase_pattern}
                    onChange={handleChange}
                    className={inputClass('seasonal_purchase_pattern')}
                  >
                    {seasonalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    產品類別興趣
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {productCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`interest_${category}`}
                          type="checkbox"
                          checked={formData.product_categories_interest.includes(category)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            const currentInterests = formData.product_categories_interest;
                            let newInterests;
                            
                            if (isChecked) {
                              newInterests = [...currentInterests, category];
                            } else {
                              newInterests = currentInterests.filter(item => item !== category);
                            }
                            
                            setFormData(prev => ({
                              ...prev,
                              product_categories_interest: newInterests
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                        />
                        <label htmlFor={`interest_${category}`} className="ml-2 block text-sm text-gray-700">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">選擇客戶感興趣的產品類別，有助於精準推薦</p>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">其他資訊</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
                    標籤
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className={inputClass('tags')}
                    placeholder="例如：VIP、高價值客戶、推薦客戶 (用逗號分隔)"
                  />
                  <p className="mt-1 text-xs text-gray-500">多個標籤請用逗號分隔</p>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                    備註
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    className={textareaClass('notes')}
                    placeholder="請輸入關於此客戶的其他備註"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="is_active"
                    name="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <label htmlFor="is_active" className="ml-3 block text-sm font-medium text-gray-700">
                    啟用客戶
                  </label>
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
              取消
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
              {loading ? '儲存中...' : customer ? '更新客戶' : '建立客戶'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;