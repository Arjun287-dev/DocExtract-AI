
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface OCRPayload {
  fileBase64: string;
  mimeType: string;
}

/**
 * Hotel Check-in Microservice
 * Extracts specific fields based on configuration.
 */
export const callOCRMicroservice = async (payload: OCRPayload, fieldsToExtract?: string[]): Promise<any> => {
  const { fileBase64, mimeType } = payload;
  
  try {
    let fieldInstructions = "";
    
    if (fieldsToExtract && fieldsToExtract.length > 0) {
      fieldInstructions = `
      EXTRACT ONLY THE FOLLOWING FIELDS:
      ${fieldsToExtract.map(f => `- ${f}`).join('\n')}

      IMPORTANT RULES FOR MISSING FIELDS:
      If a field from the list above is NOT found in the document, you MUST return it with this specific structure:
      {
        "field": "field_name_here",
        "status": "missing"
      }
      Do NOT return null for missing fields. Use the object structure above.
      `;
    } else {
      // Fallback if no fields provided (Legacy behavior)
      fieldInstructions = `
      REQUIRED FIELDS:
      - guest_name
      - check_in_date
      - check_out_date
      - room_number
      - id_document_number
      - nationality
      `;
    }

    const systemInstruction = `
      You are an automated Hotel Check-in AI Agent.
      
      YOUR TASK:
      Analyze the provided document (Passport, ID Card, Booking Confirmation, or Registration Form) and extract data into strictly valid JSON.

      ${fieldInstructions}

      GENERAL RULES:
      1. Return JSON ONLY. No markdown, no code blocks.
      2. Normalize all dates to YYYY-MM-DD.
      3. Do not extract fields that are not listed.
      4. Do not invent data.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: "Extract data strictly according to instructions." }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        systemInstruction: systemInstruction
      }
    });

    if (!response.text) throw new Error("Empty response from model");
    
    return JSON.parse(response.text);

  } catch (error) {
    console.error("Microservice Error:", error);
    throw new Error("OCR Service Failed");
  }
};
