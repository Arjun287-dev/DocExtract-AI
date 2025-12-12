
import React, { useState } from 'react';
import { ExtractedData } from '../types';

interface ResultsDisplayProps {
  results: ExtractedData[];
  isProcessing: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isProcessing }) => {
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  const allKeys: string[] = Array.from(new Set(results.flatMap(r => Object.keys(r))));
  const columns = allKeys.filter(k => !k.startsWith('_')); 

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Data Grid
          </button>
          <button
            onClick={() => setViewMode('json')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'json' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            JSON
          </button>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-xs font-medium text-slate-400">
             {results.length} Documents Processed
           </span>
           <button 
             onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + [columns.join(","), ...results.map(row => columns.map(c => row[c] ?? "").join(","))].join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "extracted_data.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
             }}
             disabled={results.length === 0}
             className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Download CSV
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-white relative">
        {results.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
            {isProcessing ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
                 </div>
                 <div className="text-center">
                    <h4 className="text-sm font-semibold text-slate-700">Processing Documents</h4>
                    <p className="text-xs text-slate-400 mt-1">AI is analyzing your files...</p>
                 </div>
               </div>
            ) : (
              <div className="flex flex-col items-center gap-3 opacity-60">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-2">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="font-medium text-slate-500">No data extracted yet</p>
                <p className="text-xs">Upload a folder to begin extraction</p>
              </div>
            )}
          </div>
        ) : (
          viewMode === 'table' ? (
            <div className="h-full overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-50/90 backdrop-blur sticky top-0 z-10 shadow-sm ring-1 ring-slate-100">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 min-w-[50px]">#</th>
                    <th className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 min-w-[200px]">Source File</th>
                    {columns.map(col => (
                      <th key={col} className="py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 whitespace-nowrap min-w-[150px]">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-3 px-4 text-xs font-mono text-slate-400 border-r border-transparent group-hover:border-indigo-100/50">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 truncate max-w-[200px] border-r border-transparent group-hover:border-indigo-100/50" title={row._source_file}>
                        <div className="flex items-center gap-2">
                           <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           {row._source_file}
                        </div>
                      </td>
                      {columns.map(col => {
                        const cellValue = row[col];
                        let displayValue = cellValue;
                        
                        if (typeof cellValue === 'object' && cellValue !== null) {
                           if (cellValue.status === 'missing') {
                             displayValue = <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600">Missing</span>;
                           } else {
                             displayValue = <span className="text-xs font-mono text-slate-500">{JSON.stringify(cellValue).slice(0, 30)}...</span>;
                           }
                        } else if (cellValue === null || cellValue === undefined) {
                           displayValue = <span className="text-slate-300 text-xs">-</span>;
                        }

                        return (
                          <td key={`${idx}-${col}`} className="py-3 px-4 max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap border-r border-transparent group-hover:border-indigo-100/50">
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-full overflow-auto custom-scrollbar bg-[#1a1b26] text-slate-300 p-6">
               <pre className="font-mono text-xs leading-relaxed text-blue-100">
                 {JSON.stringify(results, null, 2)}
               </pre>
            </div>
          )
        )}
      </div>
    </div>
  );
};
