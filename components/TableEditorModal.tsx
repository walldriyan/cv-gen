import React, { useState, useEffect } from 'react';
import { DynamicTableData, TRANSLATIONS, AppConfig } from '../types';
import { X, Plus, Trash2, GripVertical } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  table: DynamicTableData | null;
  onSave: (table: DynamicTableData) => void;
  lang: 'en' | 'si';
}

export const TableEditorModal: React.FC<Props> = ({ isOpen, onClose, table, onSave, lang }) => {
  const [editingTable, setEditingTable] = useState<DynamicTableData | null>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (table) {
      setEditingTable(JSON.parse(JSON.stringify(table))); // Deep copy
    }
  }, [table]);

  if (!isOpen || !editingTable) return null;

  const addColumn = () => {
    const newHeaders = [...editingTable.headers, `Col ${editingTable.headers.length + 1}`];
    const newRows = editingTable.rows.map(row => [...row, '-']);
    setEditingTable({ ...editingTable, headers: newHeaders, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(editingTable.headers.length).fill('-');
    setEditingTable({ ...editingTable, rows: [...editingTable.rows, newRow] });
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...editingTable.headers];
    newHeaders[index] = value;
    setEditingTable({ ...editingTable, headers: newHeaders });
  };

  const updateCell = (rIndex: number, cIndex: number, value: string) => {
    const newRows = [...editingTable.rows];
    newRows[rIndex][cIndex] = value;
    setEditingTable({ ...editingTable, rows: newRows });
  };

  const removeColumn = (index: number) => {
    if (editingTable.headers.length <= 1) return;
    const newHeaders = editingTable.headers.filter((_, i) => i !== index);
    const newRows = editingTable.rows.map(row => row.filter((_, i) => i !== index));
    setEditingTable({ ...editingTable, headers: newHeaders, rows: newRows });
  };

  const removeRow = (index: number) => {
    const newRows = editingTable.rows.filter((_, i) => i !== index);
    setEditingTable({ ...editingTable, rows: newRows });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-enter">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{t.tableEdit}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X /></button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">{t.tableTitle}</label>
            <input 
              value={editingTable.title}
              onChange={(e) => setEditingTable({...editingTable, title: e.target.value})}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {editingTable.headers.map((h, i) => (
                    <th key={i} className="p-2 border relative min-w-[100px]">
                       <div className="flex items-center gap-1">
                          <input 
                            value={h}
                            onChange={(e) => updateHeader(i, e.target.value)}
                            className="w-full bg-transparent font-bold outline-none border-b border-transparent focus:border-blue-500"
                          />
                          <button onClick={() => removeColumn(i)} className="text-red-400 hover:text-red-600"><X size={12}/></button>
                       </div>
                    </th>
                  ))}
                  <th className="p-2 w-10 text-center bg-gray-200">
                    <button onClick={addColumn} className="text-blue-600 hover:bg-blue-100 p-1 rounded" title={t.addColumn}><Plus size={16}/></button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {editingTable.rows.map((row, r) => (
                   <tr key={r} className="border-t hover:bg-gray-50">
                     {row.map((cell, c) => (
                       <td key={c} className="p-2 border-r relative">
                          <input 
                            value={cell}
                            onChange={(e) => updateCell(r, c, e.target.value)}
                            className="w-full outline-none bg-transparent"
                          />
                       </td>
                     ))}
                     <td className="p-2 text-center bg-gray-50">
                        <button onClick={() => removeRow(r)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button>
                     </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <button onClick={addRow} className="mt-2 text-sm flex items-center gap-2 text-green-600 hover:bg-green-50 px-3 py-1 rounded border border-green-200">
             <Plus size={14}/> {t.addRow}
          </button>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">{t.cancel}</button>
          <button onClick={() => onSave(editingTable)} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-bold">{t.save}</button>
        </div>
      </div>
    </div>
  );
};