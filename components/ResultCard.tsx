import React, { useState } from 'react';
import { MedicationAnalysis, Language } from '../types';
import { generateSpeech, playAudioFromBase64 } from '../services/geminiService';

interface ResultCardProps {
  analysis: MedicationAnalysis;
  language: Language;
}

export const ResultCard: React.FC<ResultCardProps> = ({ analysis, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const handlePlayAudio = async () => {
    if (isPlaying || isLoadingAudio) return;

    try {
      setIsLoadingAudio(true);
      // Construct a natural reading script based on the analysis
      const textToRead = `
        ${analysis.medicineName}. 
        ${analysis.purpose}.
        Take ${analysis.dosage}, ${analysis.frequency}.
        ${analysis.warnings.join('. ')}.
      `;
      
      const base64Audio = await generateSpeech(textToRead, language);
      await playAudioFromBase64(base64Audio);
      setIsPlaying(false); // Resetting strictly for button state (actual audio plays via context)
    } catch (error) {
      console.error("Audio error:", error);
      alert("Could not generate audio.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleShare = () => {
    const text = `*RafikiMeds Instructions*\n\n💊 *Medicine:* ${analysis.medicineName}\n📝 *Purpose:* ${analysis.purpose}\n🔢 *Dose:* ${analysis.dosage}\n⏰ *When:* ${analysis.frequency}\n⚠️ *Warnings:* ${analysis.warnings.join(', ')}\n\n_Translated to ${language}_`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
      {/* Header Section */}
      <div className="bg-green-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{analysis.medicineName}</h2>
            <p className="text-green-100 mt-1 text-sm uppercase tracking-wide opacity-90">{analysis.purpose}</p>
          </div>
          {analysis.isAntibiotic && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Antibiotic
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 border-b border-green-100">
        <button 
          onClick={handlePlayAudio}
          disabled={isLoadingAudio}
          className="bg-green-50 hover:bg-green-100 text-green-800 font-semibold py-3 px-4 flex items-center justify-center gap-2 transition-colors border-r border-green-100"
        >
          {isLoadingAudio ? (
            <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          {isLoadingAudio ? "Loading..." : "Listen"}
        </button>

        <button 
          onClick={handleShare}
          className="bg-white hover:bg-gray-50 text-green-700 font-semibold py-3 px-4 flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-8.683-2.031-9.667-.272-.984-.472-1.486-.447-.866.025.619.124.074.372 1.287.248 1.213 1.412 2.291 2.898 2.291 1.486.025 1.486.124 2.291.372 3.528.248 1.237.693 1.237 1.14 1.136.445.099 2.698-1.114 3.069-2.129.371-1.015.371-1.015.271-1.164z"/>
          </svg>
          Share
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-6">
        
        {/* Dosage & Frequency */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-blue-500 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <span className="block text-xs font-semibold text-blue-400 uppercase tracking-wide">Dose</span>
            <span className="text-lg font-bold text-gray-800">{analysis.dosage}</span>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div className="text-purple-500 mb-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="block text-xs font-semibold text-purple-400 uppercase tracking-wide">When</span>
            <span className="text-lg font-bold text-gray-800">{analysis.frequency}</span>
          </div>
        </div>

        {/* Warnings */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Important Warnings</h3>
          <ul className="space-y-2">
            {analysis.warnings.map((warning, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium leading-snug">{warning}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Storage */}
        <div className="pt-4 border-t border-gray-100">
           <p className="text-sm text-gray-600 flex items-center gap-2">
             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
             Storage: <span className="font-semibold">{analysis.storage}</span>
           </p>
        </div>
      </div>
    </div>
  );
};