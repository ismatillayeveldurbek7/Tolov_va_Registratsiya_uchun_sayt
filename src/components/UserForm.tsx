import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Phone, 
  ChevronRight, 
  Copy, 
  Check, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Clock, 
  Send 
} from 'lucide-react';
import { Application } from '../types';

interface UserFormProps {
  onAddToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onSubmitApplication: (app: Omit<Application, 'id' | 'createdAt' | 'status'>) => void;
}

export function UserForm({ onAddToast, onSubmitApplication }: UserFormProps) {
  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [phoneFormatted, setPhoneFormatted] = useState('+998 ');
  const [address, setAddress] = useState('');
  
  // State variables for UI flow
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // File upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    type: string;
    data: string; // Base64
    size: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Phone number formatter
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;
    
    // Ensure we start with prefix +998
    if (!inputVal.startsWith('+998')) {
      inputVal = '+998 ' + inputVal.replace(/\D/g, '');
    }

    // Extract raw digits after 998
    let digits = inputVal.substring(4).replace(/\D/g, '');
    digits = digits.slice(0, 9); // limit to 9 digits for phone
    
    // Build formatted representation
    let formatted = '+998 ';
    if (digits.length > 0) {
      formatted += '(' + digits.slice(0, 2);
    }
    if (digits.length > 2) {
      formatted += ') ' + digits.slice(2, 5);
    }
    if (digits.length > 5) {
      formatted += '-' + digits.slice(5, 7);
    }
    if (digits.length > 7) {
      formatted += '-' + digits.slice(7, 9);
    }

    setPhoneRaw('998' + digits);
    setPhoneFormatted(formatted);
  };

  // Click continue
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim()) {
      onAddToast('Iltimos, ismingizni kiriting', 'error');
      return;
    }
    if (!lastName.trim()) {
      onAddToast('Iltimos, familiyangizni kiriting', 'error');
      return;
    }
    
    // Clean phone validation (must be 9 digits after +998)
    const phoneNoSpaces = phoneRaw.replace(/\D/g, '');
    if (phoneNoSpaces.length !== 12) {
      onAddToast('Telefon raqamini to‘liq va +998 formatida kiriting', 'error');
      return;
    }
    
    if (!address.trim()) {
      onAddToast('Iltimos, yashash manzilingizni kiriting', 'error');
      return;
    }

    // If valid, open the payment modal
    setIsModalOpen(true);
  };

  // Clipboard copy
  const handleCopyCard = () => {
    navigator.clipboard.writeText('8600000000000000');
    setCopied(true);
    onAddToast('Karta raqami nusxalandi!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Convert uploaded file to base64
  const processFile = (file: File) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      onAddToast('Faqat rasm yoki PDF fayl yuklash mumkin!', 'error');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      onAddToast('Fayl hajmi 5MB dan oshmasligi kerak', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
      
      setUploadedFile({
        name: file.name,
        type: file.type,
        data: base64Data,
        size: sizeStr,
      });
      onAddToast('To‘lov cheki yuklandi!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Drag handles
  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  // Final submission
  const handleSubmitReceipt = () => {
    if (!uploadedFile) {
      onAddToast('Davom etishdan avval to‘lov chekini yuklang!', 'error');
      return;
    }

    // Submit up to parent state
    onSubmitApplication({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phoneFormatted,
      address: address.trim(),
      receiptName: uploadedFile.name,
      receiptType: uploadedFile.type,
      receiptData: uploadedFile.data,
    });

    // Clear form
    setFirstName('');
    setLastName('');
    setPhoneRaw('');
    setPhoneFormatted('+998 ');
    setAddress('');
    setUploadedFile(null);
    setIsModalOpen(false);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="registration-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none p-8 md:p-10"
          >
            <header className="mb-8 pl-1">
              <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-[#4f46e5] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 uppercase rounded-full mb-3">
                Ariza topshirish
              </span>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                Ariza Yuborish
              </h1>
              <p className="text-slate-500 dark:text-slate-450 mt-2 text-sm">
                Iltimos, ma'lumotlaringizni to'g'ri kiriting.
              </p>
            </header>

            <form onSubmit={handleContinue} className="space-y-5">
              {/* Responsive Name Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ism */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                    Ism <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Masalan: Alisher"
                      className="w-full pl-10.5 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400/95"
                    />
                  </div>
                </div>

                {/* Familiya */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                    Familiya <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Masalan: Qodirov"
                      className="w-full pl-10.5 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400/95"
                    />
                  </div>
                </div>
              </div>

              {/* Telefon Raqami */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                  Telefon Raqami <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phoneFormatted}
                    onChange={handlePhoneChange}
                    placeholder="+998 (90) 123-45-67"
                    className="w-full pl-10.5 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-mono font-medium text-slate-800 dark:text-slate-100"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-550 ml-1">
                  Format: +998 (XX) XXX-XX-XX
                </p>
              </div>

              {/* Yashash Manzili */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide ml-1">
                  Yashash Manzili <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-start pt-3.5 pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shahar, tuman, ko'cha, uy..."
                    className="w-full pl-10.5 pr-4 py-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400/95 resize-none"
                  />
                </div>
              </div>

              {/* Davom etish Button */}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer mt-2"
              >
                Davom etish
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-950 shadow-xl shadow-emerald-50 dark:shadow-none p-8 text-center"
          >
            <div className="w-18 h-18 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center mx-auto mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
                className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20"
              >
                <Check className="w-5 h-5 text-white stroke-[3px]" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-50">
              Muvaffaqiyatli topshirildi!
            </h2>
            
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-sm mx-auto font-medium">
              Ma’lumotlaringiz qabul qilindi. <br />
              <span className="text-slate-900 dark:text-slate-100 font-bold">Admin tekshiruvini kuting.</span>
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center justify-center">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto cursor-pointer inline-flex items-center justify-center gap-2 py-2.5 px-6 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                Yangi Ariza Topshirish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment / Modal popup */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-lg bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4.5 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-900">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-200">
                    To‘lov qilish va tasdiqlash
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Uzcard/Humo Credit Card Render */}
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden aspect-[1.6/1] flex flex-col justify-between border border-slate-700/20">
                  <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex justify-between items-start z-10">
                    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" rx="8" fill="#2563EB"/>
                      <circle cx="16" cy="24" r="10" fill="white" fillOpacity="0.2"/>
                      <circle cx="32" cy="24" r="10" fill="white" fillOpacity="0.2"/>
                    </svg>
                    <span className="text-xs font-bold tracking-widest opacity-60 uppercase font-sans">HUMO / UZCARD</span>
                  </div>
                  <div className="z-10">
                    <p className="text-[10px] opacity-60 mb-1 uppercase tracking-wide">Karta raqami</p>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl md:text-2xl font-mono tracking-wider font-bold text-white">8600 0000 0000 0000</h2>
                      <button
                        onClick={handleCopyCard}
                        className="bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1.5 border border-white/10"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>NUSXALANDI</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>NUSXALASH</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-end z-10 mt-1">
                    <div>
                      <span className="text-[9px] opacity-60 uppercase tracking-tighter block">Karta egasi</span>
                      <span className="text-sm font-medium tracking-wide uppercase font-mono">ISM FAMILIYA</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] opacity-60 uppercase tracking-tighter block font-mono">Muddati</span>
                      <span className="text-sm font-medium tracking-wide font-mono">12/30</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100/60 dark:border-indigo-900/40 space-y-2">
                  <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <Clock className="w-4 h-4" />
                    To‘lov talablari:
                  </h4>
                  <ul className="text-xs text-slate-650 dark:text-slate-400 space-y-1.5 leading-relaxed font-semibold">
                    <li>• Ushbu ko‘rsatilgan Uzcard/Humo kartasiga kerakli miqdorda to‘lov qiling.</li>
                    <li>• To‘lov izohiga o‘zingizning telefon raqamingizni yozing: <span className="underline font-bold text-slate-900 dark:text-slate-100">{phoneFormatted}</span></li>
                    <li>• To‘lovni amalga oshirganingizdan so‘ng PDF yoki rasm chekini yuklang (max 5MB).</li>
                  </ul>
                </div>

                {/* File Uploader */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    To‘lov Chekini Yuklash <span className="text-rose-500">*</span>
                  </label>

                  {!uploadedFile ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={triggerFileInput}
                      className={`relative cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all duration-200 min-h-[160px] group
                        ${dragActive 
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-indigo-400 dark:hover:border-indigo-500'
                        }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-900 dark:group-hover:bg-indigo-950/60 transition-colors mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">To'lov chekini yuklang</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PNG, JPG yoki PDF (Max. 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {uploadedFile.type.includes('pdf') ? (
                          <FileText className="w-6 h-6 text-rose-500" />
                        ) : (
                          uploadedFile.data ? (
                            <img 
                              src={uploadedFile.data} 
                              alt="Receipt thumb" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-indigo-500" />
                          )
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-850 dark:text-slate-100 truncate pr-2">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-450 mt-0.5 font-semibold">
                          {uploadedFile.size} • {uploadedFile.type.includes('pdf') ? 'PDF Hujjat' : 'Rasm'}
                        </p>
                      </div>

                      <button
                        onClick={removeFile}
                        className="p-1.5 cursor-pointer hover:bg-slate-150 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-500 rounded-lg transition-all"
                        title="Chekni o‘chirish"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-900 flex justify-end gap-3 flex-shrink-0">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 cursor-pointer text-xs font-bold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Bekor qilish
                </button>
                
                {/* Send Application button is displayed only after the file is uploaded */}
                <AnimatePresence>
                  {uploadedFile && (
                    <motion.button
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={handleSubmitReceipt}
                      className="cursor-pointer flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 rounded-xl transition-all shadow-md active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Ariza yuborish
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
