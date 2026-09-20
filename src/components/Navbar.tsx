import React from 'react';
import { Briefcase, LayoutDashboard, Building2, Users, Send, FileSpreadsheet, CheckCircle, ExternalLink, LogOut, RefreshCw, Globe } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: 'dashboard' | 'leads' | 'contacts' | 'applications' | 'blueprint' | 'harvester';
  setActiveTab: (tab: 'dashboard' | 'leads' | 'contacts' | 'applications' | 'blueprint' | 'harvester') => void;
  user: User | null;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  leadsCount: number;
  contactsCount: number;
  applicationsCount: number;
  dueTasksCount: number;
  googleSheetUrl: string | null;
  onExportToSheet: () => void;
  isExportingToSheet: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isLoggingIn,
  onLogin,
  onLogout,
  leadsCount,
  contactsCount,
  applicationsCount,
  dueTasksCount,
  googleSheetUrl,
  onExportToSheet,
  isExportingToSheet,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900">
                  Job Hunting CRM
                </span>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Outbound Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Direct Application &amp; B2B Career Tracker
              </p>
            </div>
          </div>

          {/* Right Action: Google Workspace Connection & Sheet Sync */}
          <div className="flex items-center gap-2.5">
            {googleSheetUrl && (
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Buka Spreadsheet di Google Drive"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Buka Google Sheets</span>
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onExportToSheet}
                  disabled={isExportingToSheet}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                  title="Buat atau perbarui spreadsheet di Google Drive"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-indigo-600 ${isExportingToSheet ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">
                    {googleSheetUrl ? 'Update Google Sheets' : 'Export ke Google Sheets'}
                  </span>
                </button>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1 pr-2.5 border border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold leading-none text-slate-900 truncate max-w-[120px]">
                      {user.displayName || 'Connected'}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                      <CheckCircle className="h-2.5 w-2.5" /> Workspace Active
                    </p>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Sign out dari akun Google"
                    className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 border-t border-slate-100 py-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard &amp; Workflow</span>
            {dueTasksCount > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'dashboard' ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white'
              }`}>
                {dueTasksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('harvester')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'harvester'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 hover:text-indigo-900 border border-indigo-200/60'
            }`}
          >
            <Globe className="h-4 w-4 text-indigo-600 group-hover:text-indigo-700" />
            <span>Tarik Data Google</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeTab === 'harvester' ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'
            }`}>
              Dorks
            </span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'leads'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Leads Database</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'leads' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {leadsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Contacts &amp; Verifikasi</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'contacts' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {contactsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'applications'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Applications Tracker</span>
            <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === 'applications' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-200 text-slate-700'
            }`}>
              {applicationsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'blueprint'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 group-hover:text-emerald-700" />
            <span>Google Sheets Formulas &amp; Blueprint</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
