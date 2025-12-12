
export interface AppConfig {
  fieldsInput: string;
  inputFolderName: string;
}

export interface ExtractedData {
  [key: string]: any;
}

export type ExtractionResult = ExtractedData;

export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED'
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  SKIPPED = 'SKIPPED'
}

export interface VirtualFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
  contentHash: string;
  status: FileStatus;
  extractionResult?: ExtractedData;
  errorLog?: string;
  timestamp: string;
}

export interface FileData {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
  status: ProcessingStatus;
}

export interface HotelJSONConfig {
  database_config: {
    host: string;
    database: string;
    user: string;
  };
}

export interface SQLLog {
  id: string;
  timestamp: string;
  query: string;
  type: 'DDL' | 'DML' | 'INFO' | 'ERROR';
}

export interface TableColumn {
  name: string;
  sqlType: string;
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
}
