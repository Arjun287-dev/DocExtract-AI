
import { HotelJSONConfig, SQLLog, TableSchema, ExtractedData } from '../types';
import { inferSqlType } from './utils';

export class SQLEngine {
  private config: HotelJSONConfig['database_config'];
  private logs: SQLLog[] = [];
  private currentSchema: TableSchema;
  private virtualData: any[] = [];
  private tableName = 'HotelCheckIns'; 

  constructor(config: HotelJSONConfig['database_config']) {
    this.config = config;
    this.currentSchema = {
      name: this.tableName,
      columns: [
        { name: 'id', sqlType: 'INT IDENTITY(1,1) PRIMARY KEY' },
        { name: 'created_at', sqlType: 'DATETIME DEFAULT GETDATE()' }
      ]
    };
  }

  getLogs() { return this.logs; }
  getSchema() { return this.currentSchema; }
  getData() { return this.virtualData; }

  private log(query: string, type: 'DDL' | 'DML' | 'INFO' | 'ERROR') {
    this.logs.unshift({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
      query,
      type
    });
  }

  public async initialize(): Promise<void> {
    this.log(`Reading Config: Host=${this.config.host}, DB=${this.config.database}...`, 'INFO');
    
    const connStr = `Server=${this.config.host};Database=${this.config.database};User Id=${this.config.user};Password=******;`;
    this.log(`[Connecting]: ${connStr}`, 'INFO');
    
    this.log(`IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = '${this.config.database}')
      CREATE DATABASE [${this.config.database}]`, 'DDL');
    
    this.log(`USE [${this.config.database}]`, 'INFO');

    const columnDefinitions = this.currentSchema.columns
      .map(c => `[${c.name}] ${c.sqlType}`)
      .join(', ');

    this.log(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '${this.tableName}')
      BEGIN
        CREATE TABLE [dbo].[${this.tableName}] (
          ${columnDefinitions}
        );
      END`, 'DDL');
  }

  public async processIngestion(data: ExtractedData): Promise<void> {
    
    // 1. Schema Evolution
    const existingColumnNames = new Set(this.currentSchema.columns.map(c => c.name));
    
    for (const [key, value] of Object.entries(data)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      // Skip system keys
      if (normalizedKey.startsWith('_')) continue;

      if (!existingColumnNames.has(normalizedKey)) {
        let newSqlType = 'NVARCHAR(MAX)'; // Default safe type

        // Check if it's the specific "missing" object structure
        const isMissingField = value && typeof value === 'object' && value.status === 'missing' && value.field;
        
        if (!isMissingField) {
           newSqlType = inferSqlType(value);
        } else {
           // If missing, we default to NVARCHAR(MAX) to be safe for future data
           // or we could skip creation, but requirements imply we should handle it.
           newSqlType = 'NVARCHAR(MAX)';
        }

        this.currentSchema.columns.push({ name: normalizedKey, sqlType: newSqlType });
        existingColumnNames.add(normalizedKey);
        
        this.log(`
          IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = '${this.tableName}' AND COLUMN_NAME = '${normalizedKey}')
          BEGIN
            ALTER TABLE [dbo].[${this.tableName}] 
            ADD [${normalizedKey}] ${newSqlType};
          END`, 'DDL');
      }
    }

    // 2. Insert Data
    const columnsToInsert = ['created_at'];
    const valuesToInsert = ['GETDATE()'];
    
    const virtualRow: any = { id: this.virtualData.length + 1, created_at: new Date().toISOString() };

    for (const [key, value] of Object.entries(data)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      if (normalizedKey.startsWith('_')) continue;

      columnsToInsert.push(`[${normalizedKey}]`);

      // Check if value is the "missing" object
      const isMissingField = value && typeof value === 'object' && value.status === 'missing' && value.field;
      
      if (isMissingField || value === null) {
        valuesToInsert.push('NULL');
        virtualRow[normalizedKey] = null;
      } else {
        virtualRow[normalizedKey] = value;
        if (typeof value === 'string') {
          valuesToInsert.push(`'${value.replace(/'/g, "''")}'`);
        } else if (typeof value === 'object') {
          valuesToInsert.push(`'${JSON.stringify(value)}'`);
        } else {
          valuesToInsert.push(String(value));
        }
      }
    }

    const query = `
      INSERT INTO [dbo].[${this.tableName}] 
      (${columnsToInsert.join(', ')}) 
      VALUES (${valuesToInsert.join(', ')})`;

    this.log(query, 'DML');
    
    this.virtualData.push(virtualRow);
  }
}
