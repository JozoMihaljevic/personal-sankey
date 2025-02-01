import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FinanceData, SpendingCategory } from "../types";

interface FinancialPlanProps {
  data: FinanceData;
  onUpdate: (data: FinanceData) => void;
}

export const FinancialPlan: React.FC<FinancialPlanProps> = ({ data }) => {
  const totalIncome = data.incomeSources.reduce((sum, source) => sum + source.amount, 0);

  const columnLimits = {
    "75%": totalIncome * 0.75,
    "15%": totalIncome * 0.15,
    "10%": totalIncome * 0.10,
  };

  const [columns, setColumns] = useState<{
    "75%": SpendingCategory[];
    "15%": SpendingCategory[];
    "10%": SpendingCategory[];
    Unallocated: SpendingCategory[];
  }>({
    "75%": [],
    "15%": [],
    "10%": [],
    Unallocated: data.spendingCategories.sort((a, b) => b.amount - a.amount),
  });

  const columnTotals = {
    "75%": columns["75%"].reduce((sum, cat) => sum + cat.amount, 0),
    "15%": columns["15%"].reduce((sum, cat) => sum + cat.amount, 0),
    "10%": columns["10%"].reduce((sum, cat) => sum + cat.amount, 0),
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceColumn = result.source.droppableId as keyof typeof columns;
    const destColumn = result.destination.droppableId as keyof typeof columns;

    if (sourceColumn === destColumn) return;

    const sourceItems = [...columns[sourceColumn]];
    const destItems = [...columns[destColumn]];
    const [movedItem] = sourceItems.splice(result.source.index, 1);

    destItems.splice(result.destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [sourceColumn]: sourceItems,
      [destColumn]: destItems,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Financial Plan</h2>

      <div className="mb-6 text-center">
        <p className="text-lg text-gray-700">Total Income: <strong className="text-green-600">${totalIncome.toFixed(2)}</strong></p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["75%", "15%", "10%", "Unallocated"].map((columnId) => {
            const isPercentageColumn = columnId !== "Unallocated";
            const total = columnTotals[columnId as keyof typeof columnTotals] || 0;
            const maxLimit = columnLimits[columnId as keyof typeof columnLimits] || 0;
            const difference = maxLimit - total;
            const isOver = difference < 0;

            return (
              <div
                key={columnId}
                className={`p-4 border rounded-lg shadow-md bg-white transition-all 
                ${isOver ? "border-red-500 bg-red-50" : "border-gray-200 hover:shadow-lg"}`
                }>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 text-center">
                  {columnId === "Unallocated" ? "Unallocated Categories" : `${columnId} of Expenses`}
                </h3>

                {isPercentageColumn && (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      Max Allowed: <strong className="text-gray-800">${maxLimit.toFixed(2)}</strong>
                    </p>
                    <p className={`text-sm font-bold mb-2 ${isOver ? "text-red-600" : "text-green-600"}`}>
                      Current Total: <strong>${total.toFixed(2)}</strong>
                    </p>
                    <p className={`text-sm font-semibold ${isOver ? "text-red-600" : "text-green-600"}`}>
                      {isOver ? `Over by $${Math.abs(difference).toFixed(2)}` : `Under by $${difference.toFixed(2)}`}
                    </p>
                  </>
                )}

                <Droppable droppableId={columnId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[120px] bg-gray-50 p-3 rounded-lg shadow-inner"
                    >
                      {columns[columnId as keyof typeof columns].map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 border rounded-md shadow-sm flex justify-between items-center mb-2 transition hover:shadow-md"
                            >
                              <span className="text-gray-800 font-medium">{category.name}</span>
                              <span className="text-gray-700">${category.amount.toFixed(2)}</span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default FinancialPlan;
