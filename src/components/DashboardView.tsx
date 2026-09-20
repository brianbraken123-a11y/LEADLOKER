import React from 'react';
import { Lead, JobApplication } from '../types';
import {
  TrendingUp,
  AlertCircle,
  Clock,
  Calendar,
  Send,
  Building,
  Target,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Globe
} from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
  applications: JobApplication[];
  onOpenEmailModal: (params: { to: string; companyName: string; contactName?: string; position: string }) => void;
  onOpenScheduleModal: (params: { companyName: string; position: string; contactEmail?: string }) => void;
  onNavigateToLeads: (filterStatus?: string) => void;
  onNavigateToApplications: () => void;
  onNavigateToHarvester?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  applications,
  onOpenEmailModal,
  onOpenScheduleModal,
  onNavigateToLeads,
  onNavigateToApplications,
  onNavigateToHarvester,
}) => {
  // Calculations
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.leadStatus !== 'Closed').length;
  const priorityALeads = leads.filter((l) => l.priority === 'A').length;

  const totalSent = applications.filter((a) => a.currentStatus !== 'Not Sent').length;
  const totalFollowUps = applications.filter(
    (a) => a.currentStatus === 'Follow-up 1' || a.currentStatus === 'Follow-up 2'
  ).length;
  const totalInterviews = applications.filter((a) => a.result === 'Interview' || a.currentStatus === 'Interview').length;
  const totalRejections = applications.filter((a) => a.result === 'Rejected' || a.currentStatus === 'Rejected').length;
  const totalNoResponse = applications.filter((a) => a.result === 'No Response' || a.currentStatus === 'No Response').length;
  const totalOffers = applications.filter((a) => a.result === 'Offer' || a.result === 'Accepted').length;

  const responsesCount = applications.filter((a) => a.responseDate || a.result === 'Interview' || a.result === 'Rejected' || a.result === 'Offer').length;
  const responseRate = totalSent > 0 ? Math.round((responsesCount / totalSent) * 100) : 0;
  const interviewRate = totalSent > 0 ? Math.round((totalInterviews / totalSent) * 100) : 0;
  const offerRate = totalSent > 0 ? Math.round((totalOffers / totalSent) * 100) : 0;

  // Daily Workflow Items
  const leadsToResearch = leads.filter((l) => l.leadStatus === 'Researching');
  const readyToApply = leads.filter((l) => l.leadStatus === 'Ready' || (l.applicationStatus === 'Not Sent' && l.leadStatus !== 'Researching'));
  const followUpsDue = applications.filter((a) => a.followUpStatus === 'Follow-up diperlukan');
  const upcomingInterviews = applications.filter(
    (a) => a.result === 'Interview' || a.currentStatus === 'Interview'
  );
  const ghostedSevenDays = applications.filter(
    (a) => a.daysSinceApplication > 7 && (a.currentStatus === 'Sent' || a.currentStatus === 'Follow-up 1') && !a.responseDate
  );

  // Industry distribution
  const industryCounts: Record<string, number> = {};
  leads.forEach((l) => {
    industryCounts[l.industry] = (industryCounts[l.industry] || 0) + 1;
  });

  // Status distribution
  const statusCounts: Record<string, number> = {
    'Sent': applications.filter(a => a.currentStatus === 'Sent').length,
    'Follow-up 1': applications.filter(a => a.currentStatus === 'Follow-up 1').length,
    'Follow-up 2': applications.filter(a => a.currentStatus === 'Follow-up 2').length,
    'Interview': totalInterviews,
    'Offer / Accepted': totalOffers,
    'Rejected': totalRejections,
    'No Response': totalNoResponse,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-indigo-500/30">
              <Target className="h-3.5 w-3.5" /> Outbound Direct Application Strategy
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Personal Job Hunting CRM &amp; Workflow
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Fokus pada outreach proaktif perusahaan berpotensi tinggi untuk skill <strong>B2B Sales, BD, Storytelling, &amp; Marcom</strong> di Indonesia.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onNavigateToHarvester && (
              <button
                onClick={onNavigateToHarvester}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-blue-600 transition-all cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Tarik Data Google (Dorks)</span>
              </button>
            )}
            <button
              onClick={() => onNavigateToLeads('Ready')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{readyToApply.length} Siap Dikirim Lamaran</span>
            </button>
            <button
              onClick={() => onNavigateToApplications()}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-colors"
            >
              <span>Lihat Pipeline Lamaran</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. KPI SUMMARY CARDS */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            <span>Metrik Performa &amp; Konversi</span>
          </h2>
          <span className="text-xs text-slate-500">Dihitung otomatis realtime</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
            <span className="text-xs font-medium text-slate-500">Total Ditemukan</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalLeads}</span>
              <span className="text-[11px] text-slate-400">perusahaan</span>
            </div>
            <div className="mt-2 text-[11px] font-semibold text-indigo-600">
              {activeLeads} lead aktif
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
            <span className="text-xs font-medium text-amber-800">Prioritas A</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900">{priorityALeads}</span>
              <span className="text-[11px] text-amber-700">target emas</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-700">
              Fit Score &ge; 85
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-2xs">
            <span className="text-xs font-medium text-blue-800">Lamaran Terkirim</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-900">{totalSent}</span>
              <span className="text-[11px] text-blue-700">direct pitch</span>
            </div>
            <div className="mt-2 text-[11px] text-blue-700">
              {totalFollowUps} tindak lanjut
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs">
            <span className="text-xs font-medium text-emerald-800">Response Rate</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900">{responseRate}%</span>
              <span className="text-[11px] text-emerald-700">dibalas</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-medium">
              {responsesCount} respon masuk
            </div>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 shadow-2xs">
            <span className="text-xs font-medium text-purple-800">Interview Rate</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-900">{interviewRate}%</span>
              <span className="text-[11px] text-purple-700">({totalInterviews})</span>
            </div>
            <div className="mt-2 text-[11px] text-purple-700 font-medium">
              Sesi wawancara
            </div>
          </div>

          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 shadow-2xs">
            <span className="text-xs font-medium text-teal-800">Offer Rate</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-900">{offerRate}%</span>
              <span className="text-[11px] text-teal-700">({totalOffers})</span>
            </div>
            <div className="mt-2 text-[11px] text-teal-700 font-bold">
              Penawaran kerja
            </div>
          </div>
        </div>
      </section>

      {/* 2. DAILY WORKFLOW / PEKERJAAN HARI INI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Workflow / Pekerjaan Hari Ini</h2>
              <p className="text-xs text-slate-500">Tindakan prioritas yang memerlukan eksekusi Anda hari ini</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Card 1: Follow-up Jatuh Tempo (CRITICAL RED) */}
          <div className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
            followUpsDue.length > 0
              ? 'border-rose-300 bg-rose-50/70 shadow-sm ring-1 ring-rose-300'
              : 'border-slate-200 bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  Follow-up Jatuh Tempo
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${
                  followUpsDue.length > 0 ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {followUpsDue.length}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {followUpsDue.length > 0
                  ? 'Email follow-up harus dikirim agar lamaran tidak tenggelam.'
                  : 'Semua jadwal follow-up saat ini masih aman.'}
              </p>

              {followUpsDue.length > 0 && (
                <div className="mt-3 space-y-2">
                  {followUpsDue.slice(0, 2).map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-2.5 border border-rose-200 text-xs shadow-2xs">
                      <div className="font-bold text-slate-900">{item.company}</div>
                      <div className="text-[11px] text-slate-500">{item.position}</div>
                      <button
                        onClick={() =>
                          onOpenEmailModal({
                            to: item.contactEmail,
                            companyName: item.company,
                            position: item.position,
                          })
                        }
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-rose-600 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-700 transition-colors"
                      >
                        <Send className="h-3 w-3" />
                        <span>Kirim Follow-up Sekarang</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {followUpsDue.length > 2 && (
              <button
                onClick={onNavigateToApplications}
                className="mt-3 text-[11px] font-semibold text-rose-700 hover:underline"
              >
                Lihat {followUpsDue.length - 2} lainnya &rarr;
              </button>
            )}
          </div>

          {/* Card 2: Interview yang Akan Datang (GREEN) */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Interview Mendatang
                </span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-extrabold text-white">
                  {upcomingInterviews.length}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Sesi wawancara yang sudah terjadwal atau dalam tahap proses.
              </p>

              {upcomingInterviews.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {upcomingInterviews.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-2.5 border border-emerald-200 text-xs shadow-2xs">
                      <div className="font-bold text-slate-900">{item.company}</div>
                      <div className="text-[11px] text-slate-500">{item.position}</div>
                      {item.interviewDate && (
                        <div className="mt-1 text-[11px] font-medium text-emerald-700">
                          {item.interviewDate}
                        </div>
                      )}
                      <button
                        onClick={() =>
                          onOpenScheduleModal({
                            companyName: item.company,
                            position: item.position,
                            contactEmail: item.contactEmail,
                          })
                        }
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-800 transition-colors"
                      >
                        <Calendar className="h-3 w-3" />
                        <span>Sinkron ke Calendar</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs italic text-slate-400">Belum ada jadwal interview hari ini.</p>
              )}
            </div>
          </div>

          {/* Card 3: Perusahaan Siap Dikirim Lamaran (READY) */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Send className="h-4 w-4 text-indigo-600" />
                  Siap Kirim Lamaran
                </span>
                <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-extrabold text-white">
                  {readyToApply.length}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Data PIC &amp; email sudah lengkap, siap dieksekusi kirim direct pitch.
              </p>

              {readyToApply.length > 0 && (
                <div className="mt-3 space-y-2">
                  {readyToApply.slice(0, 2).map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-2.5 border border-indigo-200 text-xs shadow-2xs">
                      <div className="font-bold text-slate-900">{item.companyName}</div>
                      <div className="text-[11px] text-slate-500">{item.targetPosition}</div>
                      <button
                        onClick={() =>
                          onOpenEmailModal({
                            to: item.hrEmail,
                            companyName: item.companyName,
                            contactName: item.contactPersonName,
                            position: item.targetPosition,
                          })
                        }
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700 transition-colors"
                      >
                        <Send className="h-3 w-3" />
                        <span>Kirim Pitch Email</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {readyToApply.length > 2 && (
              <button
                onClick={() => onNavigateToLeads('Ready')}
                className="mt-3 text-[11px] font-semibold text-indigo-700 hover:underline"
              >
                Lihat {readyToApply.length - 2} lainnya &rarr;
              </button>
            )}
          </div>

          {/* Card 4: Leads Baru Perlu Diteliti */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-slate-500" />
                  Perlu Riset Kontak
                </span>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-extrabold text-slate-700">
                  {leadsToResearch.length}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Perusahaan prospek yang belum ditemukan email recruiter/decision maker-nya.
              </p>

              {leadsToResearch.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {leadsToResearch.slice(0, 2).map((item) => (
                    <div key={item.id} className="rounded-xl bg-slate-50 p-2.5 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{item.companyName}</div>
                      <div className="text-[11px] text-slate-500">{item.targetPosition}</div>
                      <span className="mt-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                        Prioritas {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs italic text-slate-400">Semua target riset telah selesai.</p>
              )}
            </div>
            <button
              onClick={() => onNavigateToLeads('Researching')}
              className="mt-3 text-[11px] font-semibold text-indigo-600 hover:underline"
            >
              Buka daftar riset &rarr;
            </button>
          </div>

          {/* Card 5: Lamaran Tanpa Respons > 7 Hari (YELLOW) */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-amber-600" />
                  Hening &gt; 7 Hari
                </span>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-extrabold text-amber-900">
                  {ghostedSevenDays.length}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Terkirim lebih dari seminggu tanpa balasan. Layak dikirim Follow-up 2.
              </p>

              {ghostedSevenDays.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {ghostedSevenDays.map((item) => (
                    <div key={item.id} className="rounded-xl bg-white p-2.5 border border-amber-200 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{item.company}</span>
                        <span className="text-[10px] font-bold text-amber-700">{item.daysSinceApplication} hari</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{item.position}</div>
                      <button
                        onClick={() =>
                          onOpenEmailModal({
                            to: item.contactEmail,
                            companyName: item.company,
                            position: item.position,
                          })
                        }
                        className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-amber-600 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
                      >
                        <Send className="h-3 w-3" />
                        <span>Kirim Follow-up 2</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs italic text-slate-400">Tidak ada lamaran menggantung &gt; 7 hari.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHARTS & DISTRIBUTIONS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1: Status Pipeline Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              <span>Distribusi Status Lamaran</span>
            </h3>
            <span className="text-xs text-slate-400">{applications.length} Total Dilacak</span>
          </div>

          <div className="space-y-3">
            {Object.entries(statusCounts).map(([statusName, count]) => {
              const pct = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
              let barColor = 'bg-indigo-600';
              if (statusName === 'Interview') barColor = 'bg-emerald-600';
              if (statusName === 'Offer / Accepted') barColor = 'bg-teal-500';
              if (statusName === 'Rejected') barColor = 'bg-slate-400';
              if (statusName === 'No Response') barColor = 'bg-amber-400';
              if (statusName.includes('Follow-up')) barColor = 'bg-rose-500';

              return (
                <div key={statusName}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{statusName}</span>
                    <span className="text-slate-500 font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Industri Target */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-600" />
              <span>Distribusi Industri Perusahaan Target</span>
            </h3>
            <span className="text-xs text-slate-400">{leads.length} Leads</span>
          </div>

          <div className="space-y-3">
            {Object.entries(industryCounts).map(([indName, count]) => {
              const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
              return (
                <div key={indName}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{indName}</span>
                    <span className="text-slate-500 font-semibold">{count} perusahaan</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-800 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
