export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string; // Formato YYYY-MM-DD
  tags?: string[];
}

export interface CategoryBudget {
  category: string;
  amount: number;
}

export interface Budget {
  total: number;
  byCategory: CategoryBudget[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
  isQuickAction?: boolean;
}

export interface ParsedExpenseResponse {
  description: string;
  amount: number;
  category: string;
  date?: string;
  success: boolean;
  error?: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  selected: boolean;
}

export interface AnalyzedReceiptResponse {
  establishmentName: string;
  totalAmount: number;
  date: string;
  items: ReceiptItem[];
  isMock?: boolean;
}

export interface User {
  username: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}


