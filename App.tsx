import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Language, MedicationAnalysis, ProcessingState } from './types';
import { analyzeMedicationImage } from './services/geminiService';
import { ResultCard } from './components/ResultCard';
import { AdUnit } from './components/AdUnit';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.KINYARWANDA);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  const [analysis, setAnalysis] = useState<MedicationAnalysis | null>(null);
  const [history, setHistory] = useState<MedicationAnalysis[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('rafiki_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const saveToHistory = (newItem: MedicationAnalysis) => {
    const updated = [newItem, ...history].slice(0, 10); // Keep last 10
    setHistory(updated);
    localStorage.setItem('rafiki_history', JSON.stringify(updated));
  };

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing({ status: 'analyzing', message: 'Analyzing instructions...' });
    setAnalysis(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];

      try {
        // Add temporary analysis object with ID and Timestamp
        const rawResult = await analyzeMedicationImage(base64Data, language);
        const resultWithMeta: MedicationAnalysis = {
            ...rawResult,
            id: Date.now().toString(),
            timestamp: Date.now()
        };

        setAnalysis(resultWithMeta);
        saveToHistory(resultWithMeta);
        setProcessing({ status: 'complete' });
      } catch (error) {
        console.error(error);
        setProcessing({ status: 'error', message: 'Could not read image. Please try again with good lighting.' });
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  const openPharmacyMap = () => {
    window.open('https://www.google.com/maps/search/pharmacy+near+me', '_blank');
  };

  const loadFromHistory = (item: MedicationAnalysis) => {
    setAnalysis(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-12 bg-[#f0fdf4]">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-green-100 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2" onClick={() => setAnalysis(null)} role="button">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              R
            </div>
            <span className="text-xl font-bold text-gray-800">RafikiMeds</span>
          </div>
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2"
          >
            {Object.values(Language).map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        
        {/* Top Ad Banner */}
        <AdUnit type="banner" />

        {/* Hero / Intro */}
        {processing.status === 'idle' && !analysis && (
          <div className="text-center space-y-4 mt-4">
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Understand your medicine <span className="text-green-600">instantly</span>.
            </h1>
            <p className="text-gray-500 text-sm">
              Scan any medicine box or prescription. Get clear instructions in {language}.
            </p>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                onClick={triggerCamera}
                className="py-4 bg-green-600 hover:bg-green-700 text-white text-md font-bold rounded-xl shadow-lg shadow-green-200 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-1"
              >
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Scan Medicine
              </button>
              
              <button 
                onClick={openPharmacyMap}
                className="py-4 bg-blue-600 hover:bg-blue-700 text-white text-md font-bold rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95 flex flex-col items-center justify-center gap-1"
              >
                 <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Find Pharmacy
              </button>
            </div>
          </div>
        )}

        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden" 
        />

        {/* Loading State */}
        {processing.status === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative w-20 h-20">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-green-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-green-800 font-medium animate-pulse">{processing.message}</p>
          </div>
        )}

        {/* Error State */}
        {processing.status === 'error' && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl w-full text-center border border-red-100">
            <p className="font-semibold mb-2">Oops! Something went wrong.</p>
            <p className="text-sm mb-4">{processing.message}</p>
            <button 
              onClick={triggerCamera}
              className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-semibold text-sm shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {analysis && (
           <div className="animate-fade-in-up space-y-6">
             <ResultCard analysis={analysis} language={language} />
             
             {/* Inline Ad (High Value) */}
             <AdUnit type="box" label="Sponsored" />

             <button 
               onClick={triggerCamera}
               className="w-full py-3 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
             >
               Scan Another Medicine
             </button>
           </div>
        )}

        {/* History Section (Only on home) */}
        {processing.status === 'idle' && !analysis && history.length > 0 && (
          <div className="mt-8">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Recent Scans</h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer active:bg-gray-50"
                >
                  <div>
                    <p className="font-bold text-gray-800">{item.medicineName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.purpose}</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pb-4 border-t border-green-100 pt-6 text-center text-gray-400 text-xs">
          <p>© 2024 RafikiMeds Rwanda.</p>
          <p className="mt-2 max-w-xs mx-auto">AI can make mistakes. Always consult a doctor or pharmacist for critical medical advice.</p>
        </div>

      </main>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;