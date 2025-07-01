import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Customer } from '../types/customer';
import api from '../services/api';

interface CustomerImportProps {
  onImportComplete: () => void;
  onCancel: () => void;
}

interface ImportData {
  [key: string]: string | number | boolean;
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
}

const CustomerImport: React.FC<CustomerImportProps> = ({ onImportComplete, onCancel }) => {
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<ImportData[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [previewData, setPreviewData] = useState<Partial<Customer>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customer field definitions
  const customerFields = [
    { key: 'first_name', label: '姓氏', required: true },
    { key: 'last_name', label: '名字', required: true },
    { key: 'email', label: '電子信箱', required: true },
    { key: 'phone', label: '電話號碼', required: false },
    { key: 'company', label: '公司名稱', required: false },
    { key: 'address', label: '街道地址', required: false },
    { key: 'city', label: '城市', required: false },
    { key: 'state', label: '州/省', required: false },
    { key: 'zip_code', label: '郵遞區號', required: false },
    { key: 'country', label: '國家', required: false },
    { key: 'source', label: '客戶來源', required: false },
    { key: 'tags', label: '標籤', required: false },
    { key: 'notes', label: '備註', required: false },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      setErrors(['請選擇CSV或Excel檔案']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        complete: (results) => {
          handleParsedData(results.data as string[][]);
        },
        header: false,
        skipEmptyLines: true,
        error: (error) => {
          setErrors([`CSV解析錯誤：${error.message}`]);
        }
      });
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
          handleParsedData(jsonData);
        } catch (error) {
          setErrors([`Excel解析錯誤：${error}`]);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleParsedData = (data: string[][]) => {
    if (data.length === 0) {
      setErrors(['檔案為空或無法讀取']);
      return;
    }

    const [headerRow, ...dataRows] = data;
    const cleanHeaders = headerRow.map(h => h?.toString().trim()).filter(h => h);
    
    if (cleanHeaders.length === 0) {
      setErrors(['找不到有效的標題行']);
      return;
    }

    // Convert data rows to objects
    const parsedData: ImportData[] = dataRows
      .filter(row => row.some(cell => cell?.toString().trim()))
      .map(row => {
        const obj: ImportData = {};
        cleanHeaders.forEach((header, index) => {
          obj[header] = row[index]?.toString().trim() || '';
        });
        return obj;
      });

    setHeaders(cleanHeaders);
    setRawData(parsedData);
    
    // Initialize mappings
    const initialMappings: FieldMapping[] = customerFields.map(field => ({
      sourceField: findBestMatch(field.key, field.label, cleanHeaders),
      targetField: field.key,
      required: field.required
    }));
    
    setMappings(initialMappings);
    setStep('mapping');
  };

  // Simple field matching logic
  const findBestMatch = (key: string, label: string, headers: string[]): string => {
    const keyMatches = headers.find(h => 
      h.toLowerCase().includes(key.toLowerCase()) || 
      key.toLowerCase().includes(h.toLowerCase())
    );
    if (keyMatches) return keyMatches;

    const labelMatches = headers.find(h => 
      h.includes(label) || label.includes(h)
    );
    if (labelMatches) return labelMatches;

    return '';
  };

  const handleMappingChange = (targetField: string, sourceField: string) => {
    setMappings(prev => prev.map(m => 
      m.targetField === targetField 
        ? { ...m, sourceField }
        : m
    ));
  };

  const validateMappings = (): string[] => {
    const errors: string[] = [];
    const requiredMappings = mappings.filter(m => m.required);
    
    requiredMappings.forEach(mapping => {
      if (!mapping.sourceField) {
        const field = customerFields.find(f => f.key === mapping.targetField);
        errors.push(`必填欄位「${field?.label}」未映射`);
      }
    });

    return errors;
  };

  const generatePreview = () => {
    const validationErrors = validateMappings();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const preview: Partial<Customer>[] = rawData.slice(0, 10).map(row => {
      const customer: Partial<Customer> = {};
      
      mappings.forEach(mapping => {
        if (mapping.sourceField && row[mapping.sourceField] !== undefined) {
          const value = row[mapping.sourceField];
          if (mapping.targetField === 'is_active') {
            customer[mapping.targetField as keyof Customer] = 
              ['true', '1', 'yes', '是', 'active', '啟用'].includes(value.toStrinfg().toLowerCase()) as any;
          } else {
            customer[mapping.targetField as keyof Customer] = value as any;
          }
        }
      });

      // Set default values
      if (!customer.country) customer.country = 'USA';
      if (!customer.source) customer.source = 'import';
      if (customer.is_active === undefined) customer.is_active = true;

      return customer;
    });

    setPreviewData(preview);
    setErrors([]);
    setStep('preview');
  };

  const startImport = async () => {
    setStep('importing');
    setImportProgress({ current: 0, total: rawData.length });
    
    const results = { success: 0, failed: 0, errors: [] as string[] };
    
    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        const customerData: any = {};
        
        mappings.forEach(mapping => {
          if (mapping.sourceField && row[mapping.sourceField] !== undefined) {
            const value = row[mapping.sourceField];
            if (mapping.targetField === 'is_active') {
              customerData[mapping.targetField] = 
                ['true', '1', 'yes', '是', 'active', '啟用'].includes(value.toString().toLowerCase());
            } else {
              customerData[mapping.targetField] = value;
            }
          }
        });

        // Set default values
        if (!customerData.country) customerData.country = 'USA';
        if (!customerData.source) customerData.source = 'import';
        if (customerData.is_active === undefined) customerData.is_active = true;

        await api.post('/customers/', customerData);
        results.success++;
      } catch (error: any) {
        results.failed++;
        const errorMsg = error.response?.data?.email?.[0] || 
                        error.response?.data?.message || 
                        error.message || 
                        '未知錯誤';
        results.errors.push(`第 ${i + 1} 行：${errorMsg}`);
      }
      
      setImportProgress({ current: i + 1, total: rawData.length });
    }
    
    setImportResults(results);
  };

  const resetImport = () => {
    setStep('upload');
    setFile(null);
    setRawData([]);
    setHeaders([]);
    setMappings([]);
    setPreviewData([]);
    setErrors([]);
    setImportProgress({ current: 0, total: 0 });
    setImportResults({ success: 0, failed: 0, errors: [] });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
        <div className="px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">客戶資料匯入</h2>
          <p className="mt-2 text-sm text-gray-600">
            支援CSV和Excel檔案格式，批量匯入客戶資料
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {[
            { key: 'upload', label: '檔案上傳' },
            { key: 'mapping', label: '欄位映射' },
            { key: 'preview', label: '資料預覽' },
            { key: 'importing', label: '匯入處理' }
          ].map((s, index) => (
            <div key={s.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s.key
                  ? 'bg-blue-600 text-white'
                  : ['upload', 'mapping', 'preview'].indexOf(step) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {['upload', 'mapping', 'preview'].indexOf(step) > index ? '✓' : index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                step === s.key ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {s.label}
              </span>
              {index < 3 && <div className="ml-8 w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">發現以下問題：</h3>
              <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-8">
          {/* Step 1: File Upload */}
          {step === 'upload' && (
            <div className="text-center">
              <div className="border-2 border-gray-300 border-dashed rounded-lg p-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      點擊選擇檔案或拖拽到此處
                    </span>
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    支援 CSV, XLSX, XLS 格式
                  </p>
                </div>
              </div>

              {file && (
                <div className="mt-4 text-sm text-gray-600">
                  已選擇檔案：{file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {step === 'mapping' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">欄位映射設定</h3>
              <p className="text-sm text-gray-600 mb-6">
                將匯入檔案的欄位映射到系統中的客戶欄位。帶 * 號的為必填欄位。
              </p>
              
              <div className="space-y-4">
                {mappings.map((mapping) => {
                  const field = customerFields.find(f => f.key === mapping.targetField);
                  return (
                    <div key={mapping.targetField} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          {field?.label} {field?.required && <span className="text-red-500">*</span>}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">系統欄位</p>
                      </div>
                      <div>
                        <select
                          value={mapping.sourceField}
                          onChange={(e) => handleMappingChange(mapping.targetField, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">-- 請選擇檔案欄位 --</option>
                          {headers.map(header => (
                            <option key={header} value={header}>{header}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  上一步
                </button>
                <button
                  onClick={generatePreview}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  下一步：預覽資料
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Data Preview */}
          {step === 'preview' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">資料預覽</h3>
              <p className="text-sm text-gray-600 mb-6">
                以下是前10筆資料的預覽，確認無誤後即可開始匯入。
              </p>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電子信箱</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">公司</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">來源</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((customer, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.company || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.source || 'import'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep('mapping')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  上一步
                </button>
                <div className="space-x-3">
                  <span className="text-sm text-gray-600">共 {rawData.length} 筆資料準備匯入</span>
                  <button
                    onClick={startImport}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    開始匯入
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Import Progress */}
          {step === 'importing' && (
            <div className="text-center">
              <div className="mb-6">
                <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">正在匯入客戶資料...</h3>
              <p className="text-sm text-gray-600 mb-6">
                進度：{importProgress.current} / {importProgress.total}
              </p>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>

              {importProgress.current === importProgress.total && (
                <div className="mt-8">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">匯入完成</h4>
                  <div className="bg-gray-50 rounded-lg p-6 text-left">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-green-600">成功匯入：</span>
                        <span className="ml-2">{importResults.success} 筆</span>
                      </div>
                      <div>
                        <span className="font-medium text-red-600">匯入失敗：</span>
                        <span className="ml-2">{importResults.failed} 筆</span>
                      </div>
                    </div>

                    {importResults.errors.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium text-red-600 mb-2">錯誤詳情：</h5>
                        <div className="max-h-32 overflow-y-auto text-xs text-red-600 space-y-1">
                          {importResults.errors.slice(0, 10).map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                          {importResults.errors.length > 10 && (
                            <div>... 還有 {importResults.errors.length - 10} 個錯誤</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-x-3">
                    <button
                      onClick={resetImport}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      重新匯入
                    </button>
                    <button
                      onClick={onImportComplete}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      返回客戶列表
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      {step !== 'importing' && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerImport;