import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { FolderMonitor } from './components/FolderMonitor';
import { ResultsDisplay } from './components/ResultsDisplay';
import { AppConfig, VirtualFile, FileStatus, ExtractedData } from './types';
import { generateFileHash } from './services/utils';
import { callOCRMicroservice } from './services/geminiService';

const DEFAULT_CONFIG: AppConfig = {
  fieldsInput: "Guest Name, Check-in Date, Check-out Date, Room Number, Total Amount",
  inputFolderName: ""
};

const App: React.FC = () => {
  // 1. Configuration State
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  
  // 2. Virtual File System State
  const [files, setFiles] = useState<VirtualFile[]>([]);
  const processedHashes = useRef<Set<string>>(new Set());
  
  // 3. Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); 

  // 4. Layout State
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isResizing = useRef(false);

  // Derived Logic
  const inputFolderName = config.inputFolderName;

  // Gather all successfully extracted results for display
  const extractedResults: ExtractedData[] = files
    .filter(f => f.status === FileStatus.PROCESSED && f.extractionResult)
    .map(f => f.extractionResult!);

  // --- Resizing Logic ---
  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing.current) {
      // Clamp width between 300px and 700px
      const newWidth = Math.max(300, Math.min(e.clientX, 700));
      setSidebarWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);
  // ----------------------

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    // Identify uploaded folder path and extract name
    const firstFile = e.target.files[0];
    const pathParts = firstFile.webkitRelativePath.split('/');
    const folderName = pathParts.length > 1 ? pathParts[0] : "Unknown_Folder";
    
    setConfig(prev => ({ ...prev, inputFolderName: folderName }));

    const newFiles: VirtualFile[] = [];
    const fileList = Array.from(e.target.files);

    fileList.forEach((file: File) => {
      // Allow images and PDFs
      if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const hash = await generateFileHash(base64);

        setFiles(prev => {
          if (prev.some(f => f.contentHash === hash)) return prev;
          
          return [...prev, {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64,
            contentHash: hash,
            status: FileStatus.PENDING,
            timestamp: new Date().toLocaleTimeString()
          }];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const startBatchProcessing = async () => {
    setIsProcessing(true);
    setForceUpdate(n => n + 1);

    const pendingFiles = files.filter(f => f.status === FileStatus.PENDING);
    // Parse the comma separated fields from the input
    const fieldsToExtract = config.fieldsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const file of pendingFiles) {
      updateFileStatus(file.id, FileStatus.PROCESSING);
      
      if (processedHashes.current.has(file.contentHash)) {
        updateFileStatus(file.id, FileStatus.SKIPPED);
        await new Promise(r => setTimeout(r, 100)); 
        continue;
      }

      try {
        // Call Gemini Service
        const extractedData = await callOCRMicroservice({
          fileBase64: file.base64,
          mimeType: file.type
        }, fieldsToExtract);

        // Add System Metadata for the table
        const enrichedData = {
           ...extractedData,
           _source_file: file.name,
           _processed_at: new Date().toISOString()
        };
        
        processedHashes.current.add(file.contentHash);
        updateFileStatus(file.id, FileStatus.PROCESSED, enrichedData);
        
      } catch (error) {
        console.error(error);
        updateFileStatus(file.id, FileStatus.FAILED, undefined, "Processing Failed");
      }
      
      setForceUpdate(n => n + 1);
      await new Promise(r => setTimeout(r, 500)); // Small delay for UX
    }

    setIsProcessing(false);
  };

  const updateFileStatus = (id: string, status: FileStatus, result?: any, error?: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status, extractionResult: result, errorLog: error } : f));
  };

  const resetPipeline = () => {
    setFiles([]);
    setConfig(prev => ({ ...prev, inputFolderName: "" }));
    processedHashes.current.clear();
    setForceUpdate(n => n + 1);
  };

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 flex overflow-hidden selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* 1. LEFT SIDEBAR - CONTROL PANEL */}
      <aside 
        style={{ width: sidebarWidth }}
        className="flex flex-col border-r border-slate-200 bg-white z-20 shadow-xl shadow-slate-200/50 shrink-0 relative transition-[width] duration-0 ease-linear"
      >
        
        {/* RESIZE HANDLE */}
        <div 
          onMouseDown={startResizing}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-indigo-500/50 active:bg-indigo-600 z-50 transition-colors group"
        >
          {/* Visual indicator for handle */}
           <div className="absolute right-[2px] top-1/2 -translate-y-1/2 h-8 w-[3px] bg-slate-300 rounded-full group-hover:bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Brand Header */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <div>
               <h1 className="font-bold text-slate-800 text-lg leading-tight">DocuExtract AI</h1>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Enterprise OCR</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 space-y-8 flex flex-col">
          
          {/* Section: Configuration */}
          <section className="flex-1 min-h-[250px] flex flex-col">
            <ConfigurationPanel config={config} setConfig={setConfig} disabled={isProcessing} />
          </section>

          {/* Section: Data Source */}
          <section className="flex flex-col gap-3 shrink-0">
             <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Data Source</h3>
             </div>

             {!inputFolderName ? (
                <div className="relative group">
                  <button className="w-full bg-slate-50 border-2 border-dashed border-slate-200 group-hover:border-indigo-400 group-hover:bg-indigo-50/50 py-8 rounded-xl transition-all flex flex-col items-center gap-2">
                    <div className="bg-white p-2.5 rounded-full shadow-sm text-indigo-500 group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="text-center px-4">
                      <p className="text-xs font-bold text-slate-600">Click to Upload Folder</p>
                      <p className="text-[10px] text-slate-400">PDFs and Images supported</p>
                    </div>
                  </button>
                  <input 
                    type="file" 
                    {...({ webkitdirectory: "", directory: "" } as any)}
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFolderSelect}
                    disabled={isProcessing}
                  />
                </div>
             ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border border-slate-100 text-indigo-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 max-w-[150px] truncate" title={inputFolderName}>{inputFolderName}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Ready to process</p>
                    </div>
                  </div>
                  <button 
                    onClick={resetPipeline}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Change Folder"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
             )}
          </section>

          {/* Section: Queue */}
          <section className="flex flex-col gap-3 min-h-[150px] shrink-0">
             <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Processing Queue</h3>
             </div>
             <FolderMonitor files={files} folderName="" folderPath="" type="INPUT" />
          </section>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button
            onClick={startBatchProcessing}
            disabled={isProcessing || !inputFolderName}
            className={`
              w-full py-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]
              ${isProcessing || !inputFolderName
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-300'
              }
            `}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white/90" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>Processing Files...</span>
              </>
            ) : (
              <>
                <span>Start Extraction</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. RIGHT MAIN AREA - RESULTS */}
      <main className="flex-1 p-6 overflow-hidden relative min-w-0">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
        <div className="relative h-full flex flex-col z-10">
           <ResultsDisplay results={extractedResults} isProcessing={isProcessing} />
        </div>
      </main>

    </div>
  );
};

export default App;