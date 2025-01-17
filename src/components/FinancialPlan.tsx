import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FinanceData, SpendingCategory } from "../types";

interface FinancialPlanProps {
  data: FinanceData;
  onUpdate: (data: FinanceData) => void;
}

export const FinancialPlan: React.FC<FinancialPlanProps> = ({ data, onUpdate }) => {
  const totalIncome = data.incomeSources.reduce((sum, source) => sum + source.amount, 0);

  // Column limits based on total income
  const columnLimits = {
    "75%": totalIncome * 0.75,
    "15%": totalIncome * 0.15,
    "10%": totalIncome * 0.10,
  };

  // Filter categories into columns based on percentage or unallocated
  const columns = {
    "75%": data.spendingCategories.filter((cat) => cat.percentage === 75),
    "15%": data.spendingCategories.filter((cat) => cat.percentage === 15),
    "10%": data.spendingCategories.filter((cat) => cat.percentage === 10),
    Unallocated: data.spendingCategories.filter((cat) => !cat.percentage),
  };

  // Calculate current totals for each column
  const columnTotals = {
    "75%": columns["75%"].reduce((sum, cat) => sum + cat.amount, 0),
    "15%": columns["15%"].reduce((sum, cat) => sum + cat.amount, 0),
    "10%": columns["10%"].reduce((sum, cat) => sum + cat.amount, 0),
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceColumn = result.source.droppableId;
    const destColumn = result.destination.droppableId;

    const sourceItems = Array.from(columns[sourceColumn as keyof typeof columns]);
    const destItems = Array.from(columns[destColumn as keyof typeof columns]);

    const [movedItem] = sourceItems.splice(result.source.index, 1);

    // Update the category's percentage if it's moved to a specific column
    movedItem.percentage = destColumn === "Unallocated" ? undefined : parseInt(destColumn.replace("%", ""));

    destItems.splice(result.destination.index, 0, movedItem);

    // Combine all updated categories back into the main list
    const updatedCategories: SpendingCategory[] = [
      ...Object.keys(columns).flatMap((key) => {
        if (key === sourceColumn || key === destColumn) return [];
        return columns[key as keyof typeof columns];
      }),
      ...sourceItems,
      ...destItems,
    ];

    onUpdate({ ...data, spendingCategories: updatedCategories });
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Financial Plan</h2>

      <div className="mb-6">
        <p>Total Income: <strong>${totalIncome.toFixed(2)}</strong></p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(columns).map((columnId) => (
            <div key={columnId} className="bg-gray-50 p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">
                {columnId === "Unallocated" ? "Unallocated Categories" : `${columnId} of Expenses`}
              </h3>

              {columnId !== "Unallocated" && (
                <>
                  <p className="text-sm mb-2">
                    Max Allowed: <strong>${columnLimits[columnId as keyof typeof columnLimits].toFixed(2)}</strong>
                  </p>
                  <p className="text-sm mb-4">
                    Current Total: <strong>${columnTotals[columnId as keyof typeof columnTotals].toFixed(2)}</strong>
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
                      <Draggable
                        key={category.name}
                        draggableId={category.name}
                        index={index}
                      >
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
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default FinancialPlan;
