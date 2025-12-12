import React from 'react';
import { FileData, ProcessingStatus } from '../types';

interface UploaderProps {
  onFilesSelected: (files: FileData[]) => void;
  isProcessing: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({ onFilesSelected, isProcessing }) => {
  
  const processFiles = (fileList: FileList) => {
    const newFiles: FileData[] = [];
    
    Array.from(fileList).forEach((file: File) => {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64Content = result.split(',')[1];
        
        onFilesSelected([{
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64Content,
          status: ProcessingStatus.PENDING
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFolderInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  return (
    <div className="w-full mb-6">
      <div className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center
          ${isProcessing ? 'opacity-50 pointer-events-none border-slate-200' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer bg-white'}
        `}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFolderInput}
          {...({ webkitdirectory: "", directory: "" } as any)}
          multiple
        />
        
        <div className="z-10 pointer-events-none">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Upload Guest Folder</h3>
          <p className="text-slate-500 mt-1 text-sm">Select a folder containing ID, Passport, or Booking Docs</p>
        </div>
      </div>
    </div>
  );
};