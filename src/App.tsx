import React, { useState, useEffect } from 'react';
import { FinanceForm } from './components/FinanceForm';
import { SankeyChart } from './components/SankeyChart';
import { FinanceData } from './types';
import { sampleData } from './sampleData';
import { BarChart, Download, Upload } from 'lucide-react';
import FinancialPlan from "./components/FinancialPlan.tsx";

function App() {
  const [data, setData] = useState<FinanceData>(() => {
    const savedData = localStorage.getItem('financeData');
    return savedData ? JSON.parse(savedData) : sampleData;
  });

  useEffect(() => {
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [data]);

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'finance-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (
          importedData &&
          Array.isArray(importedData.incomeSources) &&
          Array.isArray(importedData.spendingCategories)
        ) {
          setData(importedData);
        } else {
          alert('Invalid data format');
        }
      } catch (error) {
        alert('Error reading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart className="h-8 w-8 text-blue-500" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Personal Finance Visualizer</h1>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm sm:text-base"
              >
                <Download size={20} />
                <span>Export Data</span>
              </button>
              <label className="flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer text-sm sm:text-base">
                <Upload size={20} />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-8">
          <div>
            <FinanceForm data={data} onUpdate={setData}/>
          </div>
          <div>
            <SankeyChart data={data}/>
          </div>
          <div>
            <FinancialPlan data={data}/> {/* New Component */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;