import { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';

interface LogoProps {
  onAdminTrigger: () => void;
  isAdmin: boolean;
}

export function Logo({ onAdminTrigger, isAdmin }: LogoProps) {
  const [clickCount, setClickCount] = useState(0);

  // Reset click count after 3 seconds of inactivity to avoid accidental triggers
  useEffect(() => {
    if (clickCount === 0) return;
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 4000);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const handleLogoClick = () => {
    if (isAdmin) return; // No need when already admin
    const nextCount = clickCount + 1;
    if (nextCount >= 5) {
      setClickCount(0);
      onAdminTrigger();
    } else {
      setClickCount(nextCount);
    }
  };

  return (
    <div 
      onClick={handleLogoClick}
      className="flex items-center gap-3 select-none cursor-pointer group p-1.5 rounded-xl transition-all hover:bg-slate-55/65 dark:hover:bg-slate-900"
    >
      <div className="relative flex items-center justify-center w-10.5 h-10.5 rounded-xl bg-indigo-600 text-white shadow-indigo-200 shadow-lg dark:shadow-none transition-transform duration-300 group-hover:scale-105 active:scale-95">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-4.5 h-4.5 bg-emerald-500 rounded-full border-1.5 border-slate-50 dark:border-slate-950">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </div>
      
      <div className="flex flex-col">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
          PAY-SYSTEM<span className="text-indigo-600 dark:text-indigo-400">.UZ</span>
        </h1>
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase leading-none mt-0.5">
          TIZIM ONLINE
        </p>
      </div>

      {clickCount > 0 && clickCount < 5 && (
        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full">
          {clickCount}/5
        </span>
      )}
    </div>
  );
}
