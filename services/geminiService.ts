import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, MedicationAnalysis } from "../types";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a medication image and returns structured data.
 */
export const analyzeMedicationImage = async (
  base64Image: string,
  targetLanguage: Language
): Promise<MedicationAnalysis> => {
  const prompt = `
    Analyze this image of a medicine packaging or prescription. 
    Extract the key information and translate it into ${targetLanguage}.
    
    Crucial rules:
    1. Simplify the language for a non-medical person (e.g., instead of "QD", say "Once a day").
    2. If the text is not in ${targetLanguage}, translate the extracted information into ${targetLanguage}.
    3. Keep it culturaly relevant for East Africa.
    4. Return the data in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medicineName: { type: Type.STRING, description: "Name of the medicine" },
          purpose: { type: Type.STRING, description: "What does it treat? Keep it simple." },
          dosage: { type: Type.STRING, description: "How many pills/spoons to take." },
          frequency: { type: Type.STRING, description: "When to take it (e.g., Morning and Night)." },
          warnings: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "Important warnings (e.g., Take with food, Do not drive)." 
          },
          storage: { type: Type.STRING, description: "How to store it." },
          isAntibiotic: { type: Type.BOOLEAN, description: "Is this an antibiotic?" },
        },
        required: ["medicineName", "purpose", "dosage", "frequency", "warnings", "storage"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Failed to analyze image");
  }

  return JSON.parse(response.text) as MedicationAnalysis;
};

/**
 * Generates audio speech from text using Gemini TTS.
 */
export const generateSpeech = async (text: string, language: Language): Promise<string> => {
  // Mapping language to suitable voice hints (Gemini voice config handles accents mostly via model training, 
  // but we select a clear voice).
  const voiceName = 'Kore'; 

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("Failed to generate speech");
  }

  return base64Audio;
};

/**
 * Helper to decode and play audio
 */
export const playAudioFromBase64 = async (base64String: string) => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass({ sampleRate: 24000 });
  
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini TTS returns raw PCM (16-bit signed, 24kHz, Mono)
  const dataInt16 = new Int16Array(bytes.buffer);
  const audioBuffer = audioContext.createBuffer(1, dataInt16.length, 24000);
  const channelData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < dataInt16.length; i++) {
    // Convert Int16 to Float32
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
};