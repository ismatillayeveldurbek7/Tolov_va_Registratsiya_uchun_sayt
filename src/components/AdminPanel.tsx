import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  Key, 
  LogOut, 
  FolderDown, 
  LayoutDashboard, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  UserCheck,
  FileText,
  ChevronDown
} from 'lucide-react';
import { Application, AdminStats } from '../types';

interface AdminPanelProps {
  applications: Application[];
  onUpdateStatus: (id: string, status: Application['status'], reason?: string) => void;
  onDeleteApplication: (id: string) => void;
  onLogout: () => void;
  onAddToast: (text: string, type: 'success' | 'error' | 'info') => void;
  currentPasswordHash: string;
  onUpdatePassword: (newPass: string) => void;
}

export function AdminPanel({
  applications,
  onUpdateStatus,
  onDeleteApplication,
  onLogout,
  onAddToast,
  currentPasswordHash,
  onUpdatePassword
}: AdminPanelProps) {
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // Dashboard view toggle ('list' | 'settings')
  const [activeTab, setActiveTab3] = useState<'list' | 'settings'>('list');

  // Preview receipt lightbox
  const [previewReceipt, setPreviewReceipt] = useState<Application | null>(null);

  // Rejection modal
  const [rejectApp, setRejectApp] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Delete confirmation modal
  const [deleteApp, setDeleteApp] = useState<Application | null>(null);

  // Password Settings Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Statistics calculation
  const stats = useMemo<AdminStats>(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'Kutilmoqda').length,
      approved: applications.filter(a => a.status === 'Qabul qilindi').length,
      rejected: applications.filter(a => a.status === 'Rad etildi').length,
    };
  }, [applications]);

  // Filtering logic
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      // Status Match
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      
      // Search Match (First name, Last Name, Phone, Address)
      const keyword = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        app.firstName.toLowerCase().includes(keyword) ||
        app.lastName.toLowerCase().includes(keyword) ||
        app.phone.includes(keyword) ||
        app.address.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchTerm, statusFilter]);

  // Handle password change
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      onAddToast('Iltimos, barcha parollarni to‘ldiring', 'error');
      return;
    }
    if (oldPassword !== currentPasswordHash) {
      onAddToast('Eski parol noto‘g‘ri', 'error');
      return;
    }
    if (newPassword.length < 4) {
      onAddToast('Yangi parol kamida 4 ta belgidan iborat bo‘lsin', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      onAddToast('Yangi parol tasdig‘i mos kelmadi', 'error');
      return;
    }

    onUpdatePassword(newPassword);
    onAddToast('Admin paroli muvaffaqiyatli almashtirildi!', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Reject submission
  const submitRejection = () => {
    if (!rejectApp) return;
    if (!rejectReason.trim()) {
      onAddToast('Rad etish sababini kiritishingiz zarur', 'error');
      return;
    }
    onUpdateStatus(rejectApp.id, 'Rad etildi', rejectReason.trim());
    onAddToast('Ariza rad etildi', 'info');
    setRejectApp(null);
    setRejectReason('');
  };

  // Native CSV/Excel Exporter with UTF-8 BOM
  const handleExportExcel = () => {
    if (applications.length === 0) {
      onAddToast('Eksport qilish uchun arizalar mavjud emas', 'error');
      return;
    }

    // Header array
    const headers = ['ID', 'Ism', 'Familiya', 'Telefon Raqami', 'Yashash Manzili', 'Sana', 'Holat', 'Rad Sababi'];
    
    // Construct rows
    const rows = applications.map(app => [
      app.id,
      app.firstName,
      app.lastName,
      app.phone,
      app.address.replace(/,/g, ' '), // escape commas inside address
      app.createdAt.split('T')[0] + ' ' + app.createdAt.split('T')[1].substring(0, 5),
      app.status,
      app.rejectionReason || '-'
    ]);

    // Comma-separated formation
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    // UTF-8 BOM byte sequence so Excel loads Uzbekistan letters correctly
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Ariza_Ruyxatlari.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onAddToast('Excel formatidagi fayl yuklandi (CSV)', 'success');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 space-y-8">
      
      {/* Admin Dashboard Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl shadow-slate-100/40 dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Admin Panel Dashboard
            </h2>
            <p className="text-xs text-slate-500 font-semibold tracking-wide dark:text-slate-400">
              Arizalar ro‘yxati va statistik ko‘rsatkichlar
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab3('list')}
            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'list'
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
          >
            <UserCheck className="w-4 h-4" />
            Arizalar
          </button>
          
          <button
            onClick={() => setActiveTab3('settings')}
            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5
              ${activeTab === 'settings'
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
          >
            <Key className="w-4 h-4" />
            Parolni o‘zgartirish
          </button>

          <button
            onClick={handleExportExcel}
            className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-750 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/30 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel Export
          </button>

          <button
            onClick={onLogout}
            className="cursor-pointer px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100/70 dark:hover:bg-rose-900/30 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Chiqish
          </button>
        </div>
      </div>

      {/* Bento Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl shadow-slate-100/20 dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Jami Arizalar
            </span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-450 rounded-xl">
              <FolderDown className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 mt-3 font-sans">
            {stats.total}
          </p>
        </div>

        {/* Pending stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl shadow-slate-100/20 dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Kutilayotganlar
            </span>
            <span className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-650 dark:text-amber-450 rounded-xl">
              <Clock className="w-4.5 h-4.5 animate-pulse" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 mt-3 font-sans">
            {stats.pending}
          </p>
        </div>

        {/* Approved stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl shadow-slate-100/20 dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Qabul Qilinganlar
            </span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-450 rounded-xl">
              <CheckCircle className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 mt-3 font-sans">
            {stats.approved}
          </p>
        </div>

        {/* Rejected stats */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xl shadow-slate-100/20 dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Rad Etilganlar
            </span>
            <span className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-650 dark:text-rose-455 rounded-xl">
              <XCircle className="w-4.5 h-4.5" />
            </span>
          </div>
          <p className="text-3xl font-extrabold text-slate-850 dark:text-slate-50 mt-3 font-sans">
            {stats.rejected}
          </p>
        </div>
      </div>

      {/* Main Tabs Container */}
      <AnimatePresence mode="wait">
        {activeTab === 'list' ? (
          <motion.div
            key="list-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Search and Filters Strip */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              {/* Search */}
              <div className="relative w-full md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ism, familiya yoki telefon bo‘yicha qidirish..."
                  className="block w-full pl-10 pr-4 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400 font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 w-full md:w-auto relative">
                <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-500 font-bold tracking-wide uppercase dark:text-slate-400 hidden sm:inline">
                  Holat:
                </span>
                
                <div className="relative w-full md:w-52 z-20">
                  <button
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className="flex items-center justify-between w-full py-2.5 px-3.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-bold transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        statusFilter === 'all' ? 'bg-indigo-500 animate-pulse' :
                        statusFilter === 'Kutilmoqda' ? 'bg-amber-500' :
                        statusFilter === 'Qabul qilindi' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                      <span>
                        {statusFilter === 'all' && `Barchasi (${applications.length})`}
                        {statusFilter === 'Kutilmoqda' && `Kutilmoqda (${stats.pending})`}
                        {statusFilter === 'Qabul qilindi' && `Qabul qilindi (${stats.approved})`}
                        {statusFilter === 'Rad etildi' && `Rad etildi (${stats.rejected})`}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isFilterDropdownOpen && (
                      <>
                        {/* Invisible Backdrop to close click-away */}
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setIsFilterDropdownOpen(false)} 
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-full min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1 z-40 outline-none overflow-hidden"
                        >
                          {[
                            { value: 'all', label: 'Barchasi', count: applications.length, dotColor: 'bg-indigo-500' },
                            { value: 'Kutilmoqda', label: 'Kutilmoqda', count: stats.pending, dotColor: 'bg-amber-500' },
                            { value: 'Qabul qilindi', label: 'Qabul qilindi', count: stats.approved, dotColor: 'bg-emerald-500' },
                            { value: 'Rad etildi', label: 'Rad etildi', count: stats.rejected, dotColor: 'bg-rose-500' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setStatusFilter(opt.value);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-4 py-2.5 text-xs text-left transition-colors font-bold cursor-pointer
                                ${statusFilter === opt.value 
                                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-extrabold' 
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/50'
                                }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                                <span>{opt.label}</span>
                              </div>
                              <span className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-805 px-1.5 py-0.5 rounded font-mono font-bold">
                                  {opt.count}
                                </span>
                                {statusFilter === opt.value && (
                                  <Check className="w-3.5 h-3.5 text-indigo-605 dark:text-indigo-400" />
                                )}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Application List Container */}
            {filteredApps.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xs">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Mos keladigan arizalar topilmadi
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Qidiruv kalitini o‘zgartiring yoki filterni tekshiring.
                </p>
              </div>
            ) : (
              /* Responsive Responsive Matrix Grid and Table */
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-100/30 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest font-bold border-b border-slate-200/80 dark:border-slate-900">
                        <th className="px-6 py-4 font-bold">F.I.SH & Manzil</th>
                        <th className="px-6 py-4 font-bold">Aloqa raqami</th>
                        <th className="px-6 py-4 font-bold">Chek fayli</th>
                        <th className="px-6 py-4 font-bold">Ariza sanasi</th>
                        <th className="px-6 py-4 font-bold">Arizachi holati</th>
                        <th className="px-6 py-4 font-bold text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/45 text-slate-700 dark:text-slate-300">
                      {filteredApps.map((app) => {
                        // Badge color mapping
                        const badgeClasses = {
                          Kutilmoqda: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
                          'Qabul qilindi': 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-950/80',
                          'Rad etildi': 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-350 dark:border-rose-950/80',
                        };

                        return (
                          <motion.tr 
                            key={app.id}
                            layoutId={app.id}
                            className="hover:bg-slate-50/55 dark:hover:bg-slate-950/30 transition-colors"
                          >
                            {/* Personal Info & Address */}
                            <td className="px-6 py-4.5">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {app.lastName} {app.firstName}
                                </span>
                                <span className="text-xs text-slate-450 dark:text-slate-450 flex items-center gap-1 mt-1 font-medium">
                                  Manzili: {app.address}
                                </span>
                              </div>
                            </td>

                            {/* Phone number */}
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-250">
                                {app.phone}
                              </span>
                            </td>

                            {/* Ticket base64 file preview link */}
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <button
                                onClick={() => setPreviewReceipt(app)}
                                className="cursor-pointer group inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-750 text-xs text-indigo-700 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-slate-700 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="max-w-[120px] truncate underline font-semibold group-hover:no-underline">
                                  Chekni ko‘rish
                                </span>
                              </button>
                            </td>

                            {/* Submission date & time */}
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                <p className="font-semibold">{app.createdAt.split('T')[0]}</p>
                                <p className="text-[10px] mt-0.5 opacity-80">{app.createdAt.split('T')[1].substring(0, 5)}</p>
                              </div>
                            </td>

                            {/* Status badge */}
                            <td className="px-6 py-4.5 whitespace-nowrap">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border-1 ${badgeClasses[app.status]}`}>
                                  {app.status}
                                </span>
                                {app.status === 'Rad etildi' && app.rejectionReason && (
                                  <span className="text-[10px] text-rose-500 font-semibold bg-rose-50/70 dark:bg-rose-950/20 px-1.5 py-0.5 rounded italic max-w-[150px] truncate" title={app.rejectionReason}>
                                    Sabab: {app.rejectionReason}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Action Operations */}
                            <td className="px-6 py-4.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                {app.status === 'Kutilmoqda' && (
                                  <>
                                    {/* Approve */}
                                    <button
                                      onClick={() => {
                                        onUpdateStatus(app.id, 'Qabul qilindi');
                                        onAddToast('Ariza muvaffaqiyatli tasdiqlandi', 'success');
                                      }}
                                      className="cursor-pointer p-1.5 rounded-lg bg-emerald-55 hover:bg-emerald-600 border border-emerald-450 text-white transition-all hover:scale-105"
                                      title="Tasdiqlash (Qabul qilish)"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>

                                    {/* Reject prompt */}
                                    <button
                                      onClick={() => setRejectApp(app)}
                                      className="cursor-pointer p-1.5 rounded-lg bg-rose-55 hover:bg-rose-600 border border-rose-450 text-white transition-all hover:scale-105"
                                      title="Rad etish"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </>
                                )}

                                {/* Delete absolute */}
                                <button
                                  onClick={() => setDeleteApp(app)}
                                  className="cursor-pointer p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-400 dark:text-slate-500 transition-all border border-transparent"
                                  title="O‘chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Password Change Settings Screen Tab */
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Admin Parolini Almashtirish
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Yashirin admin paneliga kirish kodingizni yangilang.
                </p>
              </div>

              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                {/* Old password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Eski parol
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Eski parolni kiriting"
                    className="block w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Yangi parol
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Yangi parol (kamida 4 xona)"
                    className="block w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">
                    Yangi parolni tasdiqlash
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yangi parolni qayta kiriting"
                    className="block w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-650 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Submit settings button */}
                <button
                  type="submit"
                  className="w-full cursor-pointer py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 rounded-xl transition-all shadow-md mt-2"
                >
                  O‘zgarishlarni Saqlash
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Receipt Preview Dialog */}
      <AnimatePresence>
        {previewReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewReceipt(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Lightbox content box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-850 bg-slate-50 dark:bg-slate-950">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-50">
                    To‘lov cheki: {previewReceipt.lastName} {previewReceipt.firstName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wide dark:text-slate-500 mt-1 italic">
                    Fayl nomi: {previewReceipt.receiptName}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewReceipt(null)}
                  className="p-1 cursor-pointer rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Media Body */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100 dark:bg-slate-950 min-h-[350px]">
                {previewReceipt.receiptType.includes('pdf') ? (
                  <div className="text-center p-12 space-y-4">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto text-rose-500">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-850 dark:text-slate-100">
                        PDF formatsiz hujjat
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Ushbu chek PDF formatida yuklangan. Quyidagi yuklab olish tugmasi orqali chek hujjatini kompyuterda ko‘rishingiz mumkin.
                      </p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewReceipt.receiptData}
                    alt="Chek asnad"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md bg-white dark:bg-slate-900 border border-slate-200/40"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Actions footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-850 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono font-semibold dark:text-slate-500">
                  Sana: {previewReceipt.createdAt.replace('T', ' ').substring(0, 16)}
                </span>
                
                <div className="flex gap-2">
                  <a
                    href={previewReceipt.receiptData}
                    download={previewReceipt.receiptName}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-65 hover:bg-indigo-500 dark:bg-indigo-550 dark:hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Yuklab olish
                  </a>
                  <button
                    onClick={() => setPreviewReceipt(null)}
                    className="px-3 py-2 cursor-pointer text-xs font-bold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-transparent"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reject Dialogue Overlay Box */}
      <AnimatePresence>
        {rejectApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectApp(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4"
            >
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h4 className="text-base font-bold tracking-tight">
                  Ariza rad etilmoqda
                </h4>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Siz hozirda <span className="font-bold text-slate-900 dark:text-slate-100">{rejectApp.lastName} {rejectApp.firstName}</span> arizasini rad etmoqdasiz. Iltimos, rad etish sababini foydalanuvchi bilishi tushuntirib bering (Xizmat to‘lovi kelib tushmadi, chek sifatsiz va h.k).
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-widest mb-1.5 dark:text-slate-400">
                  Rad etish sababi
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Masalan, To‘lov cheki noto‘g‘ri, qayta to‘lang..."
                  className="block w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-405 focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium resize-none shadow-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setRejectApp(null);
                    setRejectReason('');
                  }}
                  className="px-3.5 py-1.5 cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-150/60 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={submitRejection}
                  className="px-4 py-1.5 cursor-pointer text-xs font-bold text-white bg-rose-600 hover:bg-rose-550 rounded-xl transition-all"
                >
                  Rad etishni tasdiqlash
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Delete Confirmation Overlay Box */}
      <AnimatePresence>
        {deleteApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteApp(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Arizani o‘chirish
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
                  Siz haqiqatan ham <span className="font-bold text-slate-900 dark:text-slate-100">{deleteApp.lastName} {deleteApp.firstName}</span> arizasini tizimdan butunlay o‘chirib tashlamoqchimisiz? Ushbu amal qaytarilmaydi!
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteApp(null)}
                  className="flex-1 px-3.5 py-2.5 cursor-pointer text-xs font-semibold text-slate-550 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-805 rounded-xl transition-all border border-slate-200 dark:border-slate-850"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => {
                    const idToDelete = deleteApp.id;
                    setDeleteApp(null);
                    onDeleteApplication(idToDelete);
                  }}
                  className="flex-1 px-4 py-2.5 cursor-pointer text-xs font-bold text-white bg-rose-600 hover:bg-rose-550 rounded-xl transition-all shadow-md shadow-rose-100 dark:shadow-none"
                >
                  O‘chirish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
