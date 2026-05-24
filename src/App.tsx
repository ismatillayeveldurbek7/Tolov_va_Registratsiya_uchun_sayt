import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Lock, 
  X, 
  XSquare, 
  CheckSquare, 
  HelpCircle,
  Undo2
} from 'lucide-react';
import { Application, Theme } from './types';
import { Logo } from './components/Logo';
import { UserForm } from './components/UserForm';
import { AdminPanel } from './components/AdminPanel';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Theme locked to dark mode
  const theme: Theme = 'dark';

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Application list memory, saved locally
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('safepay_apps');
    return saved ? JSON.parse(saved) : [];
  });

  const saveAppsToLocal = (newApps: Application[]) => {
    setApplications(newApps);
    localStorage.setItem('safepay_apps', JSON.stringify(newApps));
  };

  // Admin states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('safepay_admin_pin') || '1111';
  });

  // Always force dark mode on mount
  useEffect(() => {
    localStorage.setItem('safepay_theme', 'dark');
    document.documentElement.classList.add('dark');
  }, []);

  // Toast adder helper
  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      type
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Admin Trigger callback (after 5 logo clicks)
  const handleAdminTrigger = () => {
    if (isAdminMode) return;
    setIsPasswordModalOpen(true);
    setEnteredPassword('');
    addToast('Admin maxfiy PIN kodini kiriting', 'info');
  };

  // Verify PIN Password
  const handleVerifyPassword = (enteredPin: string = enteredPassword) => {
    if (enteredPin === adminPassword) {
      addToast('Xush kelibsiz! Admin huquqlari tasdiqlandi', 'success');
      setIsAdminMode(true);
      setIsPasswordModalOpen(false);
      setEnteredPassword('');
    } else {
      addToast('PIN kod noto‘g‘ri! Qayta urinib ko‘ring', 'error');
      setEnteredPassword('');
    }
  };

  // Submit new application to local state
  const handleAddNewApplication = (newApp: Omit<Application, 'id' | 'createdAt' | 'status'>) => {
    const generatedId = `SP-${Math.floor(100000 + Math.random() * 900000)}`;
    const freshApplication: Application = {
      ...newApp,
      id: generatedId,
      status: 'Kutilmoqda',
      createdAt: new Date().toISOString()
    };
    
    const updated = [freshApplication, ...applications];
    saveAppsToLocal(updated);
    addToast('Ariza muvaffaqiyatli topshirildi', 'success');
  };

  // Update application status (Approve, Reject) in local state
  const handleUpdateApplicationStatus = (id: string, status: Application['status'], reason?: string) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status,
          rejectionReason: reason || undefined
        };
      }
      return app;
    });
    saveAppsToLocal(updated);
    addToast(status === 'Qabul qilindi' ? 'Ariza qabul qilindi' : 'Ariza rad etildi', 'info');
  };

  // Delete an application from local state
  const handleDeleteApplication = (id: string) => {
    const remaining = applications.filter((app) => app.id !== id);
    saveAppsToLocal(remaining);
    addToast('Ariza muvaffaqiyatli o‘chirib tashlandi', 'info');
  };

  // Update admin password in local state
  const handleUpdatePassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('safepay_admin_pin', newPass);
    addToast('Admin maxfiy PIN kodi o‘zgartirildi', 'success');
  };

  // Admin Logout
  const handleAdminLogout = () => {
    setIsAdminMode(false);
    addToast('Admin panelidan chiqildi', 'info');
  };

  // Keypad click handler for PIN entry
  const handleKeypadPress = (num: string) => {
    setEnteredPassword((prev) => {
      if (prev.length < adminPassword.length) {
        const nextPin = prev + num;
        if (nextPin.length === adminPassword.length) {
          setTimeout(() => {
            handleVerifyPassword(nextPin);
          }, 150);
        }
        return nextPin;
      }
      return prev;
    });
  };

  const handleKeypadBackspace = () => {
    setEnteredPassword((prev) => prev.slice(0, -1));
  };

  // Keyboard layout support for physical typing of PIN
  useEffect(() => {
    if (!isPasswordModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsPasswordModalOpen(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleVerifyPassword();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPasswordModalOpen, adminPassword]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Dynamic Background Mesh Effect */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-linear-to-b from-indigo-55/40 via-transparent to-transparent dark:from-indigo-950/10 pointer-events-none z-0" />
      <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 dark:from-indigo-900/5 dark:to-transparent rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute top-[50%] left-[5%] w-80 h-80 bg-gradient-to-tr from-sky-500/5 to-indigo-500/5 dark:from-slate-900/5 dark:to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Global Toast Notifier */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Main Header navigation */}
      <header className="sticky top-0 z-40 w-full bg-white/75 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-900 transition-colors">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Active site identifier and Easter-Egg clicking triggers */}
          <Logo onAdminTrigger={handleAdminTrigger} isAdmin={isAdminMode} />

          {/* Subtitle / Status area */}
          <div className="hidden md:flex items-center gap-2">
            {!isAdminMode ? (
              <span className="text-xs font-semibold py-1 px-3 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400">
                O‘zbekiston Bo‘yicha To‘lovlarni Qabul Qilish Xizmati
              </span>
            ) : (
              <span className="text-xs font-bold py-1 px-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Admin Rejimi Faol
              </span>
            )}
          </div>

          {/* Right Header: Theme and Admin quick exit */}
          <div className="flex items-center gap-3">
            {isAdminMode && (
              <button
                onClick={() => {
                  setIsAdminMode(false);
                  addToast('Foydalanuvchi qismiga qaytildi', 'info');
                }}
                className="cursor-pointer text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 py-1.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                title="Foydalanuvchi sahifasiga o‘tish"
              >
                <Undo2 className="w-3.5 h-3.5" />
                Saytga qaytish
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Active Screen switcher with AnimatePresence */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          {!isAdminMode ? (
            <motion.div
              key="user-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <UserForm 
                onAddToast={addToast} 
                onSubmitApplication={handleAddNewApplication} 
              />
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminPanel 
                applications={applications}
                onUpdateStatus={handleUpdateApplicationStatus}
                onDeleteApplication={handleDeleteApplication}
                onLogout={handleAdminLogout}
                onAddToast={addToast}
                currentPasswordHash={adminPassword}
                onUpdatePassword={handleUpdatePassword}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Highly Polished Floating Admin Password input code keypad modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            {/* Glassmorphism Credentials Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl shadow-2xl p-6 z-10 flex flex-col items-center space-y-6 overflow-hidden"
            >
              {/* Pattern Header Accent */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              {/* Close Button */}
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="absolute top-4 right-4 p-1 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center w-full mt-2">
                <div className="w-12 h-12 bg-indigo-55/75 dark:bg-indigo-950/55 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-50">
                  Tizim Nazorati
                </h3>
                 <p className="text-xs text-slate-400 dark:text-slate-550 mt-1 max-w-[250px] mx-auto font-medium">
                  Administrator huquqini tasdiqlash uchun {adminPassword.length} xonali parolni kiriting:
                </p>
              </div>

              {/* Secret display bubbles */}
              <div className="flex items-center gap-3.5 py-2">
                {Array.from({ length: adminPassword.length }).map((_, idx) => {
                  const hasChar = enteredPassword.length > idx;
                  return (
                    <motion.div
                      key={idx}
                      animate={{ scale: hasChar ? [1, 1.15, 1] : 1 }}
                      transition={{ duration: 0.15 }}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-150
                        ${hasChar 
                          ? 'bg-indigo-600 border-indigo-650 scale-100 dark:bg-indigo-500 dark:border-indigo-400' 
                          : 'bg-transparent border-slate-300 dark:border-slate-700'
                        }`}
                    />
                  );
                })}
              </div>

              {/* Clean numerical keypad layout for both touch of mobile and click click screen */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="cursor-pointer py-3 text-sm font-bold text-slate-800 dark:text-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 transition-all border border-slate-150 dark:border-slate-850 active:scale-95 flex items-center justify-center font-mono"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear All button */}
                <button
                  onClick={() => setEnteredPassword('')}
                  className="cursor-pointer py-3 text-xs font-bold text-rose-500 hover:text-rose-650 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-950 dark:hover:bg-rose-950/20 transition-all border border-slate-150 dark:border-slate-850 active:scale-95 flex items-center justify-center"
                  title="Tozalash"
                >
                  C
                </button>

                {/* Number 0 */}
                <button
                  onClick={() => handleKeypadPress('0')}
                  className="cursor-pointer py-3 text-sm font-bold text-slate-800 dark:text-slate-250 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 transition-all border border-slate-150 dark:border-slate-850 active:scale-95 flex items-center justify-center font-mono"
                >
                  0
                </button>

                {/* Backspace */}
                <button
                  onClick={handleKeypadBackspace}
                  className="cursor-pointer py-3 text-xs font-bold text-slate-500 hover:text-slate-755 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 transition-all border border-slate-150 dark:border-slate-850 active:scale-95 flex items-center justify-center"
                  title="Orqaga o‘chirish"
                >
                  ←
                </button>
              </div>

              {/* Enter Button */}
              <button
                onClick={() => handleVerifyPassword()}
                disabled={enteredPassword.length === 0}
                className={`w-full max-w-[280px] cursor-pointer py-3 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5
                  ${enteredPassword.length > 0
                    ? 'bg-gradient-to-r from-indigo-650 to-indigo-550 text-white hover:from-indigo-600 hover:to-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-955 text-slate-400 dark:text-slate-650 border border-transparent cursor-not-allowed shadow-none'
                  }`}
              >
                <Lock className="w-3.5 h-3.5" />
                PIN Kodni Tekshirish
              </button>
              


            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
