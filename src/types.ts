export interface IncomeSource {
  id: string;
  name: string;
  label: string;
  amount: number;
}

export interface SubCategory {
  id: string;
  name: string;
  label: string;
  amount: number;
}

export interface SpendingCategory {
  id: string;
  name: string;
  label: string;
  amount: number;
  subCategories: SubCategory[];
}

export interface FinanceData {
  incomeSources: IncomeSource[];
  spendingCategories: SpendingCategory[];
}
