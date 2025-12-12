import React from 'react';
import { FileData, ProcessingStatus } from '../types';

interface ProcessingQueueProps {
  files: FileData[];
}

export const ProcessingQueue: React.FC<ProcessingQueueProps> = ({ files }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No files in queue
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-semibold text-slate-700">Processing Queue</h3>
        <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">
          {files.filter(f => f.status === ProcessingStatus.SUCCESS).length} / {files.length} Done
        </span>
      </div>
      <div className="overflow-y-auto flex-1 p-2 space-y-2">
        {files.map((file) => (
          <div 
            key={file.id} 
            className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors
              ${file.status === ProcessingStatus.PROCESSING ? 'bg-indigo-50 border-indigo-200' : ''}
              ${file.status === ProcessingStatus.SUCCESS ? 'bg-green-50 border-green-200' : ''}
              ${file.status === ProcessingStatus.SKIPPED ? 'bg-gray-50 border-gray-200 opacity-70' : ''}
              ${file.status === ProcessingStatus.ERROR ? 'bg-red-50 border-red-200' : ''}
              ${file.status === ProcessingStatus.PENDING ? 'bg-white border-slate-100' : ''}
            `}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className={`
                w-2 h-2 rounded-full flex-shrink-0
                ${file.status === ProcessingStatus.PROCESSING ? 'bg-indigo-500 animate-pulse' : ''}
                ${file.status === ProcessingStatus.SUCCESS ? 'bg-green-500' : ''}
                ${file.status === ProcessingStatus.SKIPPED ? 'bg-gray-400' : ''}
                ${file.status === ProcessingStatus.ERROR ? 'bg-red-500' : ''}
                ${file.status === ProcessingStatus.PENDING ? 'bg-slate-300' : ''}
              `} />
              <span className="truncate font-medium text-slate-700 max-w-[180px]" title={file.name}>{file.name}</span>
            </div>
            
            <span className={`text-xs font-semibold
               ${file.status === ProcessingStatus.PROCESSING ? 'text-indigo-600' : ''}
               ${file.status === ProcessingStatus.SUCCESS ? 'text-green-600' : ''}
               ${file.status === ProcessingStatus.ERROR ? 'text-red-600' : ''}
               ${file.status === ProcessingStatus.SKIPPED ? 'text-gray-500' : ''}
               ${file.status === ProcessingStatus.PENDING ? 'text-slate-400' : ''}
            `}>
              {file.status === ProcessingStatus.PROCESSING && 'Extracting...'}
              {file.status === ProcessingStatus.SUCCESS && 'Inserted'}
              {file.status === ProcessingStatus.SKIPPED && 'Exists'}
              {file.status === ProcessingStatus.ERROR && 'Failed'}
              {file.status === ProcessingStatus.PENDING && 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
