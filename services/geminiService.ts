
import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const improveText = async (text: string, type: 'summary' | 'experience'): Promise<string> => {
  const ai = getAiClient();
  if (!ai) throw new Error("API Key not found");

  const prompt = `Rewrite and improve the following resume ${type} to be more professional, concise, and impactful. Keep it under 50 words if possible. Text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return text;
  }
};

interface TemplateSuggestion {
    templateId: 'modern' | 'classic' | 'creative';
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    headingColor: string;
    headingFont: string;
}

export const suggestTemplateFromImage = async (base64Image: string): Promise<TemplateSuggestion> => {
   const ai = getAiClient();
   // Default fallback
   const fallback: TemplateSuggestion = { 
       templateId: 'modern', 
       primaryColor: '#3b82f6', 
       secondaryColor: '#6b7280', 
       backgroundColor: '#ffffff',
       headingColor: '#1e3a8a',
       headingFont: 'Inter, sans-serif'
   };

   if (!ai) return fallback;

   // Detect mime type or default to png
   const mimeMatch = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
   const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
   const cleanBase64 = base64Image.split(',')[1];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { text: "Analyze this CV image. 1. Identify the style (Modern, Classic, or Creative). 2. Extract the dominant primary color (hex). 3. Extract the text/heading color (hex). 4. Extract the background color (hex). 5. Suggest a font style (Sans-serif or Serif). Return JSON." },
                { inlineData: { mimeType: mimeType, data: cleanBase64 } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        style: { type: Type.STRING, enum: ["Modern", "Classic", "Creative"] },
                        primaryColor: { type: Type.STRING },
                        secondaryColor: { type: Type.STRING },
                        backgroundColor: { type: Type.STRING },
                        fontType: { type: Type.STRING, enum: ["Sans-serif", "Serif"] }
                    }
                }
            }
        });
        
        let text = response.text || "{}";
        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const data = JSON.parse(text);
        
        return {
            templateId: (data.style?.toLowerCase() as any) || 'modern',
            primaryColor: data.primaryColor || '#3b82f6',
            secondaryColor: data.secondaryColor || '#6b7280',
            backgroundColor: data.backgroundColor || '#ffffff',
            headingColor: data.primaryColor || '#1e3a8a', // Use primary as fallback for heading
            headingFont: data.fontType === 'Serif' ? 'Playfair Display, serif' : 'Inter, sans-serif'
        };

    } catch (e) {
        console.error("AI Scan Error:", e);
        return fallback;
    }
}
