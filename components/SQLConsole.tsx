
import React, { useState, useEffect, useRef } from 'react';
import { SQLLog, TableSchema } from '../types';

interface SQLConsoleProps {
  logs: SQLLog[];
  schema: TableSchema;
  data: any[];
}

export const SQLConsole: React.FC<SQLConsoleProps> = ({ logs, schema, data }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'data'>('logs');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'logs') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  return (
    <div className="bg-[#1e1e1e] rounded-2xl shadow-lg border border-slate-700 flex flex-col h-full overflow-hidden">
      <div className="flex border-b border-white/5 bg-[#252526]">
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'logs' ? 'border-indigo-500 text-white bg-[#1e1e1e]' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          SQL Terminal
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'data' ? 'border-indigo-500 text-white bg-[#1e1e1e]' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          Live Database
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-[#1e1e1e]">
        {activeTab === 'logs' ? (
          <div className="p-5 font-mono text-xs space-y-2">
            {logs.length === 0 && <div className="text-slate-600 italic mt-10 text-center opacity-50">System Idle. Waiting for jobs...</div>}
            {logs.map((log) => (
              <div key={log.id} className="group flex gap-3 hover:bg-white/5 p-1.5 rounded -mx-1.5 transition-colors">
                <span className="text-slate-500 shrink-0 select-none w-16 text-right opacity-70">{log.timestamp}</span>
                <span className={`shrink-0 font-bold w-12 text-center select-none rounded px-1 text-[9px] py-0.5 h-fit mt-0.5 tracking-wider
                  ${log.type === 'DDL' ? 'bg-amber-900/50 text-amber-200 border border-amber-800' : ''}
                  ${log.type === 'DML' ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-800' : ''}
                  ${log.type === 'INFO' ? 'bg-blue-900/50 text-blue-200 border border-blue-800' : ''}
                  ${log.type === 'ERROR' ? 'bg-rose-900/50 text-rose-200 border border-rose-800' : ''}
                `}>{log.type}</span>
                <span className={`break-all whitespace-pre-wrap leading-relaxed ${
                  log.type === 'DDL' ? 'text-amber-100' : 
                  log.type === 'DML' ? 'text-emerald-100' :
                  log.type === 'ERROR' ? 'text-rose-300' : 'text-slate-300'
                }`}>
                  {log.query}
                </span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        ) : (
          <div className="w-full h-full overflow-auto">
             <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#252526] text-slate-300 sticky top-0 shadow-md z-10">
                  <tr>
                    {schema.columns.map(col => (
                      <th key={col.name} className="p-4 border-b border-white/10 font-mono whitespace-nowrap bg-[#252526]">
                        <div className="flex flex-col gap-1">
                           <span className="text-indigo-300 font-bold">{col.name}</span>
                           <span className="text-[9px] text-slate-500 uppercase tracking-widest">{col.sqlType}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-slate-400 font-mono divide-y divide-white/5">
                  {data.length === 0 && (
                     <tr><td colSpan={schema.columns.length} className="p-20 text-center text-slate-600 italic">No records found in {schema.name}</td></tr>
                  )}
                  {data.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      {schema.columns.map(col => (
                        <td key={col.name} className="p-4 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                          {row[col.name] !== undefined && row[col.name] !== null ? (
                             <span className="text-slate-300">{typeof row[col.name] === 'object' ? JSON.stringify(row[col.name]) : String(row[col.name])}</span>
                          ) : <span className="text-slate-600 italic">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="bg-[#252526] px-4 py-2 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center">
         <span>Target: {schema.name}</span>
         <div className="flex items-center gap-3">
            <span>{data.length} Rows</span>
            <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
            <span>{schema.columns.length} Cols</span>
         </div>
      </div>
    </div>
  );
};
