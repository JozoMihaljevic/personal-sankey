import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { FinanceData, IncomeSource, SpendingCategory, SubCategory } from '../types';

interface FinanceFormProps {
  data: FinanceData;
  onUpdate: (data: FinanceData) => void;
}

export const FinanceForm: React.FC<FinanceFormProps> = ({ data, onUpdate }) => {
  const totalIncome = data.incomeSources.reduce((sum, source) => sum + source.amount, 0);
  const totalSpending = data.spendingCategories.reduce((sum, category) =>
    sum + category.subCategories.reduce((subSum, sub) => subSum + sub.amount, 0), 0);

  const addIncomeSource = () => {
    const newSource: IncomeSource = {
      id: Date.now().toString(),
      label: '',
      name: '',
      amount: 0
    };
    onUpdate({
      ...data,
      incomeSources: [...data.incomeSources, newSource]
    });
  };

  const addSpendingCategory = () => {
    const newCategory: SpendingCategory = {
      id: Date.now().toString(),
      label: '',
      amount: 0,
      name: '',
      subCategories: []
    };
    onUpdate({
      ...data,
      spendingCategories: [...data.spendingCategories, newCategory]
    });
  };

  const addSubCategory = (categoryId: string) => {
    const newSubCategory: SubCategory = {
      id: Date.now().toString(),
      label: '',
      name: '',
      amount: 0
    };
    onUpdate({
      ...data,
      spendingCategories: data.spendingCategories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: [...category.subCategories, newSubCategory]
            }
          : category
      )
    });
  };

  const updateIncomeSource = (id: string, field: keyof IncomeSource, value: string | number) => {
    onUpdate({
      ...data,
      incomeSources: data.incomeSources.map(source =>
        source.id === id ? { ...source, [field]: value } : source
      )
    });
  };

  const updateSpendingCategory = (id: string, field: keyof SpendingCategory, value: string | number) => {
    const updatedSpendingCategories = data.spendingCategories.map(category =>
      category.id === id
        ? {
          ...category,
          [field]: value,
          // Update both label and name when the field is either label or name
          ...(field === 'name' || field === 'label' ? { label: String(value), name: String(value) } : {})
        }
        : category
    );

    onUpdate({
      ...data,
      spendingCategories: updatedSpendingCategories
    });
  };

  const updateSubCategory = (categoryId: string, subCategoryId: string, field: keyof SubCategory, value: string | number) => {
    const category = data.spendingCategories.find(c => c.id === categoryId);
    if (!category) return;

    // Calculate the new total spending if this update is applied
    const currentSubTotal = category.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
    const targetSubCategory = category.subCategories.find(sub => sub.id === subCategoryId);
    if (!targetSubCategory) return;

    // Determine the new amount and label/name value
    const newAmount = field === 'amount' ? Number(value) : targetSubCategory.amount;
    const newLabelAndName = field === 'name' || field === 'label' ? String(value) : targetSubCategory.name; // Set label and name together

    const newSubTotal = currentSubTotal - targetSubCategory.amount + newAmount;
    const otherCategoriesTotal = totalSpending - currentSubTotal;

    // Check if the new amount would exceed total income
    if (field === 'amount' && (otherCategoriesTotal + newSubTotal > totalIncome)) {
      return; // Don't update if it would exceed total income
    }

    const updatedSpendingCategories = data.spendingCategories.map(category =>
      category.id === categoryId
        ? {
          ...category,
          subCategories: category.subCategories.map(sub =>
            sub.id === subCategoryId
              ? { ...sub, [field]: value, label: newLabelAndName, name: newLabelAndName } // Update both label and name
              : sub
          )
        }
        : category
    );

    onUpdate({
      ...data,
      spendingCategories: updatedSpendingCategories
    });
  };

  const removeIncomeSource = (id: string) => {
    onUpdate({
      ...data,
      incomeSources: data.incomeSources.filter(source => source.id !== id)
    });
  };

  const removeSpendingCategory = (id: string) => {
    onUpdate({
      ...data,
      spendingCategories: data.spendingCategories.filter(category => category.id !== id)
    });
  };

  const removeSubCategory = (categoryId: string, subCategoryId: string) => {
    onUpdate({
      ...data,
      spendingCategories: data.spendingCategories.map(category =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: category.subCategories.filter(sub => sub.id !== subCategoryId)
            }
          : category
      )
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Income Sources</h2>
          <button
            onClick={addIncomeSource}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <PlusCircle size={16} /> Add Source
          </button>
        </div>
        {data.incomeSources.map(source => (
          <div key={source.id} className="flex gap-4 mb-3">
            <input
              type="text"
              value={source.label}
              onChange={e => updateIncomeSource(source.id, 'label', e.target.value)}
              placeholder="Source name"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <input
              type="number"
              value={source.amount}
              onChange={e => updateIncomeSource(source.id, 'amount', Number(e.target.value))}
              placeholder="Amount (€)"
              className="w-32 px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => removeIncomeSource(source.id)}
              className="p-2 text-red-500 hover:text-red-700"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Spending Categories</h2>
          <button
            onClick={addSpendingCategory}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <PlusCircle size={16} /> Add Category
          </button>
        </div>
        {data.spendingCategories.map(category => {
          const categoryTotal = category.subCategories.reduce((sum, sub) => sum + sub.amount, 0);
          return (
            <div key={category.id} className="mb-6 p-4 border rounded-lg">
              <div className="flex gap-4 mb-3">
                <input
                  type="text"
                  value={category.label}
                  onChange={e => updateSpendingCategory(category.id, 'label', e.target.value)}
                  placeholder="Category name"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <div className="w-32 px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-right">
                  €{categoryTotal}
                </div>
                <button
                  onClick={() => removeSpendingCategory(category.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="ml-8">
                {category.subCategories.map(sub => (
                  <div key={sub.id} className="flex gap-4 mb-3">
                    <input
                      type="text"
                      value={sub.label}
                      onChange={e => updateSubCategory(category.id, sub.id, 'label', e.target.value)}
                      placeholder="Subcategory name"
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <input
                      type="number"
                      value={sub.amount}
                      onChange={e => updateSubCategory(category.id, sub.id, 'amount', Number(e.target.value))}
                      placeholder="Amount (€)"
                      className="w-32 px-3 py-2 border rounded-md"
                    />
                    <button
                      onClick={() => removeSubCategory(category.id, sub.id)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSubCategory(category.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-500 hover:text-blue-700"
                >
                  <PlusCircle size={16} /> Add Subcategory
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total Income: €{totalIncome}</span>
          <span>Total Spending: €{totalSpending}</span>
        </div>
        {totalIncome > totalSpending && (
          <p className="mt-2 text-green-600 flex items-center gap-2">
            Leftover money: €{totalIncome - totalSpending}
          </p>
        )}
      </div>
    </div>
  );
};