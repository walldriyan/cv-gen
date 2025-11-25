import React from 'react';
import { DynamicTableData } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface Props {
  table: DynamicTableData;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  primaryColor: string;
}

export const DynamicTable: React.FC<Props> = ({ table, onEdit, onDelete, isEditing, primaryColor }) => {
  return (
    <div className="mb-6 relative group">
       <div className="flex justify-between items-center mb-2">
         <h3 className="font-bold text-lg" style={{color: primaryColor}}>{table.title}</h3>
         {isEditing && (
            <div className="flex gap-2 no-print opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="bg-blue-100 text-blue-600 p-1.5 rounded hover:bg-blue-200" title="Edit Table">
                    <Edit2 size={16} />
                </button>
                <button onClick={onDelete} className="bg-red-100 text-red-600 p-1.5 rounded hover:bg-red-200" title="Delete Table">
                    <Trash2 size={16} />
                </button>
            </div>
         )}
       </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: primaryColor, color: '#fff' }}>
              {table.headers.map((header, i) => (
                <th key={i} className="p-2 border border-white/20">
                    {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rIndex) => (
              <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                {row.map((cell, cIndex) => (
                  <td key={cIndex} className="p-2 border border-gray-200">
                      {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.rows.length === 0 && <p className="text-xs text-gray-400 italic mt-1 text-center">No data in table</p>}
    </div>
  );
};