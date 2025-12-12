
/**
 * Generates a SHA-256 hash for file content to detect duplicates.
 */
export const generateFileHash = async (base64String: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(base64String);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Infers the SQL Data Type based on the value content.
 */
export const inferSqlType = (value: any): string => {
  if (value === null || value === undefined) return 'NVARCHAR(MAX)';
  
  if (typeof value === 'boolean') return 'BIT';
  
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'INT' : 'FLOAT';
  }

  if (typeof value === 'string') {
    // Check for Date (ISO format YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;
    if (dateRegex.test(value) && !isNaN(Date.parse(value))) {
      return 'DATE';
    }
    
    // Length check
    return value.length > 255 ? 'NVARCHAR(MAX)' : 'NVARCHAR(255)';
  }

  if (typeof value === 'object') {
    return 'NVARCHAR(MAX)'; // Store JSON objects as text
  }

  return 'NVARCHAR(MAX)';
};
