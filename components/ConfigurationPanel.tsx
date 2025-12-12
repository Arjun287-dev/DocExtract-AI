
import React from 'react';
import { AppConfig } from '../types';

interface ConfigurationPanelProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  disabled: boolean;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ config, setConfig, disabled }) => {
  
  const handleFieldsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfig(prev => ({ ...prev, fieldsInput: e.target.value }));
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center gap-2 mb-1 shrink-0">
        <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </div>
        <h3 className="font-bold text-slate-800 text-sm">Extraction Rules</h3>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
          Fields to Extract
        </label>
        <div className="relative flex-1">
          <textarea 
            value={config.fieldsInput}
            onChange={handleFieldsChange}
            disabled={disabled}
            placeholder="e.g. Guest Name, Check-in Date, Total Amount..."
            className="w-full h-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs p-3 leading-relaxed resize-none transition-all placeholder:text-slate-400"
            spellCheck={false}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 shrink-0">
          Separate multiple fields with commas. The AI will strictly search for these attributes.
        </p>
      </div>
    </div>
  );
};
