import { Customer } from './customer';

// 欄位映射型別
export interface FieldMapping {
  sourceField: string;
  targetField: keyof Customer;
  required: boolean;
}

// 匯入原始資料型別
export interface ImportData {
  [key: string]: string | number | boolean;
}

// 客戶欄位定義型別
export interface CustomerFieldDefinition {
  key: keyof Customer;
  label: string;
  required: boolean;
}