import { FinanceData } from './types';

export const sampleData: FinanceData = {
  incomeSources: [
    { id: '1', label: 'Salary', name: 'Placa', amount: 3500 },
    { id: '2', label: 'Investments', name: 'Djecji',amount: 500 },
    { id: '3', label: 'Freelance', name: 'Placa2',amount: 1000 }
  ],
  spendingCategories: [
    {
      id: '1',
      label: 'Housing',
      amount: 2000,
      name: 'test1',
      subCategories: [
        { id: '1-1', label: 'Rent', name: 'test1',amount: 1500 },
        { id: '1-2', label: 'Utilities', name: 'test1',amount: 500 }
      ]
    },
    {
      id: '2',
      label: 'Transportation',
      amount: 500,
      name: 'test1',
      subCategories: [
        { id: '2-1', label: 'Public Transport', name: 'test1',amount: 200 },
        { id: '2-2', label: 'Car Maintenance',name: 'test1', amount: 300 }
      ]
    },
    {
      id: '3',
      label: 'Food',
      name: 'test1',
      amount: 800,
      subCategories: [
        { id: '3-1', label: 'Groceries', name: 'test1',amount: 500 },
        { id: '3-2', label: 'Dining Out', name: 'test1',amount: 300 }
      ]
    },
    {
      id: '4',
      label: 'Entertainment',
      name: 'test1',
      amount: 700,
      subCategories: [
        { id: '4-1', label: 'Movies & Shows', name: 'test1',amount: 200 },
        { id: '4-2', label: 'Hobbies', name: 'test1',amount: 300 },
        { id: '4-3', label: 'Social Activities', name: 'test1',amount: 200 }
      ]
    },
    {
      id: '5',
      label: 'Savings',
      name: 'test1',
      amount: 1000,
      subCategories: [
        { id: '5-1', label: 'Emergency Fund', name: 'test1',amount: 600 },
        { id: '5-2', label: 'Investment', name: 'test1',amount: 400 }
      ]
    }
  ]
};