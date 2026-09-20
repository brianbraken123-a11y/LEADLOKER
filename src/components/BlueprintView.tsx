import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Lead, Contact, JobApplication } from '../types';

interface BlueprintViewProps {
  leads: Lead[];
  contacts: Contact[];
  applications: JobApplication[];
  googleSheetUrl: string | null;
  onDeployToSheet: () => void;
  isDeploying: boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({
  leads,
  contacts,
  applications,
  googleSheetUrl,
  onDeployToSheet,
  isDeploying,
  isAuthenticated,
  onLogin,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Exporters
  const downloadCSV = (type: 'leads' | 'contacts' | 'applications') => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (type === 'leads') {
      filename = 'JobHunting_LEADS.csv';
      headers = [
        'Lead ID', 'Nama Perusahaan', 'Industri', 'Kota', 'Website', 'LinkedIn', 'Instagram',
        'Nama Contact Person', 'Jabatan Contact Person', 'Email HR', 'Sumber Email',
        'Posisi Ditarget', 'Link Lowongan', 'Status Lowongan', 'Alasan Cocok', 'Skill Relevan',
        'Fit Score', 'Prioritas', 'Tanggal Ditemukan', 'Status Lead', 'Tanggal Lamaran',
        'Follow-up 1', 'Follow-up 2', 'Status Lamaran', 'Hasil', 'Catatan'
      ];
      rows = leads.map((l) => [
        l.id, `"${l.companyName}"`, `"${l.industry}"`, `"${l.city}"`, l.website, l.linkedin, l.instagram,
        `"${l.contactPersonName}"`, `"${l.contactPersonRole}"`, l.hrEmail, `"${l.emailSource}"`,
        `"${l.targetPosition}"`, l.jobLink, l.vacancyStatus, `"${l.fitReason.replace(/"/g, '""')}"`,
        `"${l.relevantSkills.join(', ')}"`, String(l.fitScore), l.priority, l.dateFound, l.leadStatus,
        l.dateApplied || '', l.followUp1Date || '', l.followUp2Date || '', l.applicationStatus, l.result,
        `"${(l.notes || '').replace(/"/g, '""')}"`
      ]);
    } else if (type === 'contacts') {
      filename = 'JobHunting_CONTACTS.csv';
      headers = [
        'Company', 'Contact Name', 'Position', 'Email', 'LinkedIn', 'Source',
        'Verification Status', 'Last Verified', 'Notes'
      ];
      rows = contacts.map((c) => [
        `"${c.company}"`, `"${c.contactName}"`, `"${c.position}"`, c.email, c.linkedin,
        `"${c.source}"`, c.verificationStatus, c.lastVerified, `"${(c.notes || '').replace(/"/g, '""')}"`
      ]);
    } else {
      filename = 'JobHunting_APPLICATIONS.csv';
      headers = [
        'Application ID', 'Company', 'Position', 'Contact Email', 'Date Sent',
        'Email Version', 'CV Version', 'Portfolio Link', 'Days Since Application',
        'Follow-up 1 Date', 'Follow-up 2 Date', 'Follow-up Status', 'Current Status',
        'Response Date', 'Interview Date', 'Result', 'Notes'
      ];
      rows = applications.map((a) => [
        a.id, `"${a.company}"`, `"${a.position}"`, a.contactEmail, a.dateSent,
        `"${a.emailVersion}"`, `"${a.cvVersion}"`, a.portfolioLink, String(a.daysSinceApplication),
        a.followUp1Date, a.followUp2Date, a.followUpStatus, a.currentStatus,
        a.responseDate || '', a.interviewDate || '', a.result, `"${(a.notes || '').replace(/"/g, '""')}"`
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero: 1-Click Google Sheets Deployment */}
      <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
              <span>Google Sheets API Automation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Deploy Otomatis ke Google Sheets Anda
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Buat spreadsheet 4 tab lengkap (<strong>DASHBOARD, LEADS, CONTACTS, APPLICATIONS</strong>) secara instan di Google Drive Anda lengkap dengan formula, nama kolom, dan data awal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={onDeployToSheet}
                disabled={isDeploying}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isDeploying ? 'Sedang Memproses...' : googleSheetUrl ? 'Update Google Sheets' : 'Buat Google Sheets Sekarang'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all cursor-pointer"
              >
                <span>Sign in dengan Google untuk Ekspor</span>
              </button>
            )}

            {googleSheetUrl && (
              <a
                href={googleSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors"
              >
                <span>Buka Spreadsheet</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* CSV Backup Downloads */}
        <div className="mt-6 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Atau Download CSV Cadangan:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadCSV('leads')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Download LEADS (26 Kolom)</span>
            </button>
            <button
              onClick={() => downloadCSV('contacts')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Download CONTACTS</span>
            </button>
            <button
              onClick={() => downloadCSV('applications')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Download APPLICATIONS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blueprint Reference Sections */}
      <div className="space-y-6">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" />
          <span>Kamus Formula Google Sheets Siap Salin</span>
        </h2>

        {/* Formula 1: Days Since Application */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">
                1. Days Since Application (Jumlah Hari Sejak Lamaran Dikirim)
              </span>
              <p className="text-[11px] text-slate-500">
                Tempatkan di Sheet <code>APPLICATIONS</code>, Kolom <code>I2</code>:
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  '=IF(ISBLANK(E2), "", TODAY() - E2)',
                  'days-since'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {copiedId === 'days-since' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedId === 'days-since' ? 'Tersalin!' : 'Salin Formula'}</span>
            </button>
          </div>
          <pre className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
            {'=IF(ISBLANK(E2), "", TODAY() - E2)'}
          </pre>
        </div>

        {/* Formula 2: Follow-up Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">
                2. Follow-up Status (Otomatis: Belum dikirim / Belum waktunya / Perlu follow-up / Selesai)
              </span>
              <p className="text-[11px] text-slate-500">
                Tempatkan di Sheet <code>APPLICATIONS</code>, Kolom <code>L2</code>:
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  '=IFS(ISBLANK(E2), "Belum dikirim", OR(M2="Interview", M2="Accepted", M2="Rejected"), "Selesai", AND(TODAY()>=J2, ISBLANK(N2), M2="Sent"), "Follow-up diperlukan", AND(TODAY()<J2, M2="Sent"), "Belum waktunya follow-up", AND(M2="Follow-up 1", TODAY()>=K2, ISBLANK(N2)), "Follow-up diperlukan", AND(M2="Follow-up 1", TODAY()<K2), "Belum waktunya follow-up", M2="Follow-up 2", "Follow-up sudah dilakukan", TRUE, "Selesai")',
                  'fu-status'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {copiedId === 'fu-status' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedId === 'fu-status' ? 'Tersalin!' : 'Salin Formula'}</span>
            </button>
          </div>
          <pre className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
            {'=IFS(ISBLANK(E2), "Belum dikirim", OR(M2="Interview", M2="Accepted", M2="Rejected"), "Selesai", AND(TODAY()>=J2, ISBLANK(N2), M2="Sent"), "Follow-up diperlukan", AND(TODAY()<J2, M2="Sent"), "Belum waktunya follow-up", AND(M2="Follow-up 1", TODAY()>=K2, ISBLANK(N2)), "Follow-up diperlukan", AND(M2="Follow-up 1", TODAY()<K2), "Belum waktunya follow-up", M2="Follow-up 2", "Follow-up sudah dilakukan", TRUE, "Selesai")'}
          </pre>
        </div>

        {/* Formula 3: Fit Score Generator */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900">
                3. Fit Score Otomatis (0-100: Skill Match + Accessibility + Company Fit)
              </span>
              <p className="text-[11px] text-slate-500">
                Tempatkan di Sheet <code>LEADS</code>, Kolom <code>Q2</code>:
              </p>
            </div>
            <button
              onClick={() =>
                copyToClipboard(
                  '=MIN(100, IF(REGEXMATCH(L2, "(?i)sales|b2b|business dev|bd|account exec"), 25, 0) + IF(REGEXMATCH(L2, "(?i)marketing|content|storytelling|copywriter|marcom|social media"), 20, 0) + IF(REGEXMATCH(O2, "(?i)portfolio|pengalaman|komunikasi|klien|customer"), 15, 0) + IF(REGEXMATCH(L2, "(?i)junior|associate|mid|specialist|officer|staff"), 20, 10) + IF(REGEXMATCH(C2, "(?i)startup|agency|b2b|f&b|retail|technology|media|creative|sme|umkm"), 20, 10))',
                  'fit-score'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {copiedId === 'fit-score' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedId === 'fit-score' ? 'Tersalin!' : 'Salin Formula'}</span>
            </button>
          </div>
          <pre className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
            {'=MIN(100, IF(REGEXMATCH(L2, "(?i)sales|b2b|business dev|bd|account exec"), 25, 0) + IF(REGEXMATCH(L2, "(?i)marketing|content|storytelling|copywriter|marcom|social media"), 20, 0) + IF(REGEXMATCH(O2, "(?i)portfolio|pengalaman|komunikasi|klien|customer"), 15, 0) + IF(REGEXMATCH(L2, "(?i)junior|associate|mid|specialist|officer|staff"), 20, 10) + IF(REGEXMATCH(C2, "(?i)startup|agency|b2b|f&b|retail|technology|media|creative|sme|umkm"), 20, 10))'}
          </pre>
        </div>

        {/* Formula 4: Metrik Konversi Dashboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-slate-900 block">
            4. Metrik Dashboard &amp; Konversi Tingkat Respon
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">Response Rate:</span>
              <code className="block rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {'=IFERROR(COUNTIF(APPLICATIONS!N2:N, "<>") / COUNTIF(APPLICATIONS!M2:M, "<>Not Sent"), 0)'}
              </code>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">Interview Rate:</span>
              <code className="block rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {'=IFERROR(COUNTIF(APPLICATIONS!P2:P, "Interview") / COUNTIF(APPLICATIONS!M2:M, "<>Not Sent"), 0)'}
              </code>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">Offer Rate:</span>
              <code className="block rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                {'=IFERROR((COUNTIF(APPLICATIONS!P2:P, "Offer") + COUNTIF(APPLICATIONS!P2:P, "Accepted")) / COUNTIF(APPLICATIONS!M2:M, "<>Not Sent"), 0)'}
              </code>
            </div>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Instruksi Step-by-Step Pembuatan Manual di Google Sheets
          </h3>
          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-[11px]">
                1
              </div>
              <div>
                <strong className="text-slate-900">Buat 4 Tab Sheet:</strong> Beri nama tab di bagian bawah: <code>DASHBOARD</code>, <code>LEADS</code>, <code>CONTACTS</code>, dan <code>APPLICATIONS</code>.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-[11px]">
                2
              </div>
              <div>
                <strong className="text-slate-900">Freeze Header Row &amp; Pasang Filter:</strong> Pada baris 1 di setiap sheet, masukkan nama-nama kolom, lalu klik <strong>View &gt; Freeze &gt; 1 row</strong>, dan aktifkan <strong>Data &gt; Create a filter</strong>.
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-[11px]">
                3
              </div>
              <div>
                <strong className="text-slate-900">Terapkan Dropdown (Data Validation):</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li><strong>Status Lowongan:</strong> <code>Active, Open Application, Unknown, Closed</code></li>
                  <li><strong>Prioritas:</strong> <code>A, B, C</code></li>
                  <li><strong>Status Lead:</strong> <code>Researching, Ready, Contacted, Follow-up, Interview, Rejected, No Response, Closed</code></li>
                  <li><strong>Status Lamaran:</strong> <code>Not Sent, Sent, Follow-up 1, Follow-up 2, Interview, Rejected, Accepted, No Response</code></li>
                  <li><strong>Hasil:</strong> <code>Pending, Rejected, Interview, Offer, Accepted, No Response</code></li>
                  <li><strong>Verification Status:</strong> <code>Verified Official Website, Verified LinkedIn, Job Portal, Unverified</code></li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-[11px]">
                4
              </div>
              <div>
                <strong className="text-slate-900">Atur Conditional Formatting:</strong> Masuk ke <strong>Format &gt; Conditional formatting</strong>:
                <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                  <li>Prioritas A &rarr; Background Kuning Emas Lembut (<code>#FDE68A</code>), Teks Gelap</li>
                  <li>Follow-up diperlukan &rarr; Background Merah Muda (<code>#FEE2E2</code>), Teks Merah Pekat (<code>#991B1B</code>)</li>
                  <li>Interview &rarr; Background Hijau Lembut (<code>#DCFCE7</code>), Teks Hijau Pekat (<code>#166534</code>)</li>
                  <li>Rejected &rarr; Background Abu-abu (<code>#F3F4F6</code>)</li>
                  <li>No Response &rarr; Background Kuning (<code>#FEF3C7</code>)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
