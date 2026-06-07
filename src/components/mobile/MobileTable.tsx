'use client';

import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = { [key: string]: any };

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: AnyRow) => React.ReactNode;
}

interface MobileTableProps {
  columns: Column[];
  data: AnyRow[];
  onRowClick?: (row: AnyRow) => void;
  keyField?: string;
}

export function MobileTable({ columns, data, onRowClick, keyField = 'id' }: MobileTableProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="space-y-3">
        {data.map((row, idx) => (
          <div
            key={String(row[keyField] || idx)}
            onClick={() => onRowClick?.(row)}
            className={`bg-white rounded-xl p-4 border border-slate-200 ${onRowClick ? 'cursor-pointer active:bg-slate-50' : ''}`}
          >
            {columns.map(col => (
              <div key={col.key} className="flex justify-between items-center mb-2 last:mb-0">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{col.label}</span>
                <span className="text-slate-900 text-sm font-semibold text-right">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-400 text-xs font-semibold">
            {columns.map(col => (
              <th key={col.key} className="py-3 px-3">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={String(row[keyField] || idx)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map(col => (
                <td key={col.key} className="py-3 px-3">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
