import React from 'react';

interface AdUnitProps {
  type?: 'banner' | 'box';
  label?: string;
}

/**
 * This component acts as a container for Google Ads.
 * To monetize:
 * 1. Sign up for Google AdSense.
 * 2. Get your ad code snippets.
 * 3. Replace the placeholder content below with your <ins> tags.
 */
export const AdUnit: React.FC<AdUnitProps> = ({ type = 'banner', label = "Advertisement" }) => {
  const heightClass = type === 'banner' ? 'h-24' : 'h-64';
  
  return (
    <div className={`w-full my-4 overflow-hidden bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-center relative ${heightClass}`}>
      <div className="absolute top-1 right-2 text-[10px] text-gray-400 uppercase tracking-widest">
        {label}
      </div>
      
      {/* --- REPLACE THIS SECTION WITH YOUR GOOGLE ADS CODE --- */}
      <div className="text-gray-400 flex flex-col items-center gap-2">
        <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <span className="text-xs font-medium opacity-50">Google Ad Space</span>
      </div>
      {/* ---------------------------------------------------- */}
    </div>
  );
};