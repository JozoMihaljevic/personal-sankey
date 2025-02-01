import React, { useState, useEffect } from 'react';
import { FinanceForm } from './components/FinanceForm';
import { SankeyChart } from './components/SankeyChart';
import { FinanceData } from './types';
import { BarChart, Download, Upload, Database } from 'lucide-react';
import FinancialPlan from "./components/FinancialPlan.tsx";
import { db } from './firebaseConfig';
import { doc, setDoc, getDoc } from "firebase/firestore";

const FIRESTORE_DOC_ID = "BucCe7Nx9zTYbcnIR7Uf"; // 🔹 Your specific Firestore document ID
const COLLECTION_NAME = "financeData"; // 🔹 Your Firestore collection

function App() {
  const [data, setData] = useState<FinanceData | null>(null);

  // Load data from Firestore on app start
  useEffect(() => {
    const loadDataFromFirestore = async () => {
      try {
        const docRef = doc(db, COLLECTION_NAME, FIRESTORE_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as FinanceData);
          console.log(docSnap.data());
        } else {
          console.warn("Document not found");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadDataFromFirestore();
  }, []);

  const handleExport = () => {
    if (!data) return;
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
          saveDataToFirestore(importedData);
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

  const saveDataToFirestore = async (updatedData: FinanceData) => {
    try {
      await setDoc(doc(db, COLLECTION_NAME, FIRESTORE_DOC_ID), updatedData, { merge: false });
      console.log("Data successfully updated in Firestore.");
      console.log(updatedData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  if (!data) return <p className="text-center mt-10">Loading data...</p>;

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
              <button
                onClick={() => saveDataToFirestore(data)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm sm:text-base"
              >
                <Database size={20} />
                <span>Save to Firestore</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col gap-8">
          <div>
            <FinanceForm data={data} onUpdate={setData} />
          </div>
          <div>
            <SankeyChart data={data} />
          </div>
          <div>
            <FinancialPlan data={data} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
