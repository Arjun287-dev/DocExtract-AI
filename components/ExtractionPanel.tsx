import React from 'react';
import { ProcessingStatus } from '../types';

interface ExtractionPanelProps {
  fields: string;
  setFields: (fields: string) => void;
  onExtract: () => void;
  status: ProcessingStatus;
  disabled: boolean;
}

export const ExtractionPanel: React.FC<ExtractionPanelProps> = ({ 
  fields, 
  setFields, 
  onExtract, 
  status, 
  disabled 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Configuration
        </h2>
        <p className="text-slate-500 text-sm mt-1">Define what you want to extract from the document.</p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Target Fields <span className="text-xs font-normal text-slate-500">(Comma separated)</span>
          </label>
          <textarea
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            placeholder="e.g. Invoice Number, Date, Total Amount, Vendor Name, Survey Number, SR Number"
            className="w-full h-40 p-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm leading-relaxed resize-none"
            disabled={status === ProcessingStatus.PROCESSING}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {['Survey No', 'SR No', 'Owner Name', 'Date', 'Address'].map(tag => (
              <button
                key={tag}
                onClick={() => {
                   const newFields = fields ? `${fields}, ${tag}` : tag;
                   setFields(newFields);
                }}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md transition-colors"
                disabled={status === ProcessingStatus.PROCESSING}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <button
          onClick={onExtract}
          disabled={disabled || status === ProcessingStatus.PROCESSING}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95
            ${disabled || status === ProcessingStatus.PROCESSING
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg'
            }
          `}
        >
          {status === ProcessingStatus.PROCESSING ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Extracting Data...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Start Extraction
            </>
          )}
        </button>
      </div>
    </div>
  );
};