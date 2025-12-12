import React from 'react';
import { ExtractionResult, ProcessingStatus } from '../types';

interface ResultViewerProps {
  result: ExtractionResult | null;
  status: ProcessingStatus;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ result, status }) => {
  if (status === ProcessingStatus.IDLE) {
    return (
      <div className="h-full bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center p-8 text-slate-400">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Extracted data will appear here</p>
        </div>
      </div>
    );
  }

  if (status === ProcessingStatus.PROCESSING) {
    return (
      <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse mb-4"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
          <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
          <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (status === ProcessingStatus.ERROR) {
    return (
      <div className="h-full bg-red-50 rounded-xl border border-red-200 p-6 flex items-center justify-center text-red-600">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Extraction Failed</p>
          <p className="text-sm mt-1 text-red-500">Please check your document and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Extraction Result
        </h3>
        <button 
          onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition-colors"
        >
          Copy JSON
        </button>
      </div>
      <div className="flex-1 overflow-auto p-0 bg-[#1e1e1e]">
        <pre className="text-sm font-mono text-green-400 p-6">
          <code>
            {JSON.stringify(result, null, 2)}
          </code>
        </pre>
      </div>
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
        <span>Format: JSON</span>
        <span>{result ? Object.keys(result).length : 0} fields extracted</span>
      </div>
    </div>
  );
};