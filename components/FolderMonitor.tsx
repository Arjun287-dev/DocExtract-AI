
import React from 'react';
import { VirtualFile, FileStatus } from '../types';

interface FolderMonitorProps {
  files: VirtualFile[];
  folderName: string;
  folderPath: string;
  type: 'INPUT' | 'PROCESSED' | 'FAILED';
}

export const FolderMonitor: React.FC<FolderMonitorProps> = ({ files, folderName, type }) => {
  const filteredFiles = files.filter(f => {
    if (type === 'INPUT') return f.status === FileStatus.PENDING || f.status === FileStatus.PROCESSING;
    if (type === 'PROCESSED') return f.status === FileStatus.PROCESSED || f.status === FileStatus.SKIPPED;
    if (type === 'FAILED') return f.status === FileStatus.FAILED;
    return false;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-2 px-1">
        <h3 className="font-bold text-slate-800 text-sm">{folderName}</h3>
        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{filteredFiles.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className="h-20 flex flex-col items-center justify-center text-slate-400 text-xs gap-1 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <span>Queue Empty</span>
          </div>
        ) : (
          filteredFiles.map(file => (
            <div key={file.id} className="group bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm flex items-center gap-3 transition-all hover:border-indigo-100">
              
              {/* Status Indicator */}
              <div className="shrink-0">
                {file.status === FileStatus.PROCESSING ? (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse ring-2 ring-indigo-100"></div>
                ) : file.status === FileStatus.PROCESSED ? (
                  <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></div>
                ) : file.status === FileStatus.FAILED ? (
                  <div className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-100"></div>
                ) : file.status === FileStatus.SKIPPED ? (
                   <div className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-100"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate leading-tight">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(0)}KB</p>
                   {file.status === FileStatus.PROCESSING && <span className="text-[9px] text-indigo-500 font-bold">Processing...</span>}
                   {file.status === FileStatus.SKIPPED && <span className="text-[9px] text-amber-500 font-bold">Duplicate</span>}
                   {file.status === FileStatus.FAILED && <span className="text-[9px] text-rose-500 font-bold">Failed</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
