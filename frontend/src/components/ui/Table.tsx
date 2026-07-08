import { ReactNode } from 'react';

interface Column {
  header: string;
  accessor: string;
  render?: (value: any, row: any) => ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  keyField?: string;
}

export default function Table({ columns, data, keyField = 'id' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800">
            {columns.map((col, idx) => (
              <th key={idx} className="pb-3 text-sm font-medium text-slate-400 font-body px-4">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row[keyField] || rowIndex} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="py-4 px-4 text-sm text-slate-300">
                  {col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
