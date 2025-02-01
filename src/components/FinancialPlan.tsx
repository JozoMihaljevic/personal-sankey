import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FinanceData, SpendingCategory } from "../types";

interface FinancialPlanProps {
  data: FinanceData;
  onUpdate: (data: FinanceData) => void;
}

export const FinancialPlan: React.FC<FinancialPlanProps> = ({ data, onUpdate }) => {
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

  const onDragStart = (start) => {
    console.log("Dragging ID:", start.draggableId);
  };

  const columnTotals = {
    "75%": columns["75%"].reduce((sum, cat) => sum + cat.amount, 0),
    "15%": columns["15%"].reduce((sum, cat) => sum + cat.amount, 0),
    "10%": columns["10%"].reduce((sum, cat) => sum + cat.amount, 0),
  };

  const handleDragEnd = (result: any) => {
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
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Financial Plan</h2>
      <div className="mb-6">
        <p>Total Income: <strong>${totalIncome.toFixed(2)}</strong></p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {["75%", "15%", "10%", "Unallocated"].map((columnId) => {
            const isPercentageColumn = columnId !== "Unallocated";
            const total = columnTotals[columnId as keyof typeof columnTotals] || 0;
            const maxLimit = columnLimits[columnId as keyof typeof columnLimits] || 0;
            const difference = maxLimit - total;
            const isOver = difference < 0;

            return (
              <div key={columnId} className="bg-gray-50 p-4 border rounded-md">
                <h3 className="text-lg font-semibold mb-2">
                  {columnId === "Unallocated" ? "Unallocated Categories" : `${columnId} of Expenses`}
                </h3>

                {isPercentageColumn && (
                  <>
                    <p className="text-sm mb-2">
                      Max Allowed: <strong>${maxLimit.toFixed(2)}</strong>
                    </p>
                    <p className={`text-sm mb-4 font-bold ${isOver ? "text-red-600" : "text-green-600"}`}>
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
                      className="space-y-2 min-h-[100px] bg-white p-2 rounded shadow-sm"
                    >
                      {columns[columnId as keyof typeof columns].map((category, index) => (
                        <Draggable key={category.id} draggableId={category.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-4 border rounded-md shadow-sm flex justify-between items-center"
                            >
                              <span>{category.name}</span>
                              <span>${category.amount.toFixed(2)}</span>
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
