import React, { useState } from 'react';
import { Lead, Priority, LeadStatus, VacancyStatus, ApplicationStatus, ResultStatus } from '../types';
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  Mail,
  Edit2,
  Trash2,
  Award,
  ChevronDown,
  Info,
  Building,
  CheckCircle2,
  X,
  Globe
} from 'lucide-react';
import { calculateFitScore, USER_SKILLS, TARGET_INDUSTRIES } from '../utils/fitScore';

interface LeadsViewProps {
  leads: Lead[];
  onAddLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onOpenEmailModal: (params: { to: string; companyName: string; contactName?: string; position: string }) => void;
  initialFilterStatus?: string;
  onNavigateToHarvester?: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onOpenEmailModal,
  initialFilterStatus,
  onNavigateToHarvester,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilterStatus || 'ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForFitScore, setSelectedLeadForFitScore] = useState<Lead | null>(null);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Partial<Lead>>({
    companyName: '',
    industry: 'Technology / B2B SaaS',
    city: 'Jakarta',
    website: '',
    linkedin: '',
    instagram: '',
    contactPersonName: '',
    contactPersonRole: '',
    hrEmail: '',
    emailSource: 'LinkedIn & Web Karir',
    targetPosition: '',
    jobLink: '',
    vacancyStatus: 'Active',
    fitReason: '',
    relevantSkills: ['B2B Sales', 'Storytelling'],
    priority: 'A',
    dateFound: new Date().toISOString().split('T')[0],
    leadStatus: 'Ready',
    applicationStatus: 'Not Sent',
    result: 'Pending',
    notes: '',
  });

  // Calculate live fit score in form
  const liveFitScore = calculateFitScore({
    targetPosition: formData.targetPosition || '',
    industry: formData.industry || '',
    fitReason: formData.fitReason || '',
    selectedSkills: formData.relevantSkills || [],
    notes: formData.notes || '',
  });

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.targetPosition) {
      alert('Nama Perusahaan dan Posisi yang Ditarget wajib diisi.');
      return;
    }

    const newLead: Lead = {
      id: `LD-${String(leads.length + 1).padStart(3, '0')}`,
      companyName: formData.companyName || '',
      industry: formData.industry || 'Technology',
      city: formData.city || 'Jakarta',
      website: formData.website || '',
      linkedin: formData.linkedin || '',
      instagram: formData.instagram || '',
      contactPersonName: formData.contactPersonName || '',
      contactPersonRole: formData.contactPersonRole || '',
      hrEmail: formData.hrEmail || '',
      emailSource: formData.emailSource || 'Outbound Research',
      targetPosition: formData.targetPosition || '',
      jobLink: formData.jobLink || '',
      vacancyStatus: (formData.vacancyStatus as VacancyStatus) || 'Active',
      fitReason: formData.fitReason || '',
      relevantSkills: formData.relevantSkills || [],
      fitScore: liveFitScore.totalScore,
      priority: (formData.priority as Priority) || (liveFitScore.totalScore >= 85 ? 'A' : liveFitScore.totalScore >= 70 ? 'B' : 'C'),
      dateFound: formData.dateFound || new Date().toISOString().split('T')[0],
      leadStatus: (formData.leadStatus as LeadStatus) || 'Researching',
      applicationStatus: (formData.applicationStatus as ApplicationStatus) || 'Not Sent',
      result: (formData.result as ResultStatus) || 'Pending',
      notes: formData.notes || '',
    };

    onAddLead(newLead);
    setIsAddModalOpen(false);
    // Reset
    setFormData({
      companyName: '',
      industry: 'Technology / B2B SaaS',
      city: 'Jakarta',
      website: '',
      linkedin: '',
      instagram: '',
      contactPersonName: '',
      contactPersonRole: '',
      hrEmail: '',
      emailSource: 'LinkedIn & Web Karir',
      targetPosition: '',
      jobLink: '',
      vacancyStatus: 'Active',
      fitReason: '',
      relevantSkills: ['B2B Sales', 'Storytelling'],
      priority: 'A',
      dateFound: new Date().toISOString().split('T')[0],
      leadStatus: 'Ready',
      applicationStatus: 'Not Sent',
      result: 'Pending',
      notes: '',
    });
  };

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.targetPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPersonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || lead.leadStatus === statusFilter;
    const matchesIndustry = industryFilter === 'ALL' || lead.industry === industryFilter;

    return matchesSearch && matchesPriority && matchesStatus && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sheet 1: Leads Database ({leads.length})
          </h1>
          <p className="text-xs text-slate-500">
            Database 26 kolom untuk riset target perusahaan, profil contact person, dan fit score otomatis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToHarvester && (
            <button
              type="button"
              onClick={onNavigateToHarvester}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
            >
              <Globe className="h-4 w-4 text-indigo-600" />
              <span>Tarik Data Google (Dorks)</span>
            </button>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Target Lead Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari perusahaan, posisi, nama PIC..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Prioritas (A, B, C)</option>
              <option value="A">Prioritas A (Skor Tinggi)</option>
              <option value="B">Prioritas B (Menengah)</option>
              <option value="C">Prioritas C (Eksplorasi)</option>
            </select>
          </div>

          {/* Lead Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Status Lead</option>
              <option value="Researching">Researching</option>
              <option value="Ready">Ready (Siap Kirim)</option>
              <option value="Contacted">Contacted</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
              <option value="No Response">No Response</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Industry Filter */}
          <div>
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Industri</option>
              {TARGET_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 26-Column Full Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-20 bg-slate-100/95 border-b border-slate-200 backdrop-blur-xs text-slate-700 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3.5 sticky left-0 z-30 bg-slate-100 border-r border-slate-200">Aksi</th>
                <th className="py-3 px-3 whitespace-nowrap">Lead ID</th>
                <th className="py-3 px-4 min-w-[180px]">Nama Perusahaan</th>
                <th className="py-3 px-3 whitespace-nowrap">Prioritas</th>
                <th className="py-3 px-3 whitespace-nowrap">Fit Score</th>
                <th className="py-3 px-3 whitespace-nowrap">Status Lead</th>
                <th className="py-3 px-4 min-w-[160px]">Posisi Ditarget</th>
                <th className="py-3 px-3 whitespace-nowrap">Status Loker</th>
                <th className="py-3 px-3.5 min-w-[150px]">Contact Person</th>
                <th className="py-3 px-3.5 min-w-[170px]">Email HR</th>
                <th className="py-3 px-3 whitespace-nowrap">Industri</th>
                <th className="py-3 px-3 whitespace-nowrap">Kota</th>
                <th className="py-3 px-3 whitespace-nowrap">Status Lamaran</th>
                <th className="py-3 px-3 whitespace-nowrap">Tgl Ditemukan</th>
                <th className="py-3 px-3 whitespace-nowrap">Tgl Lamaran</th>
                <th className="py-3 px-3 whitespace-nowrap">Follow-up 1</th>
                <th className="py-3 px-3 whitespace-nowrap">Follow-up 2</th>
                <th className="py-3 px-3 whitespace-nowrap">Hasil</th>
                <th className="py-3 px-4 min-w-[200px]">Alasan Cocok</th>
                <th className="py-3 px-3.5 min-w-[180px]">Skill Relevan</th>
                <th className="py-3 px-3 whitespace-nowrap">Website</th>
                <th className="py-3 px-3 whitespace-nowrap">LinkedIn</th>
                <th className="py-3 px-4 min-w-[200px]">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => {
                const isPriorityA = lead.priority === 'A';
                return (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isPriorityA ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Action Column */}
                    <td className="py-2.5 px-3.5 sticky left-0 z-10 bg-white/95 border-r border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <button
                          title="Kirim Email Outbound via Gmail"
                          onClick={() =>
                            onOpenEmailModal({
                              to: lead.hrEmail,
                              companyName: lead.companyName,
                              contactName: lead.contactPersonName,
                              position: lead.targetPosition,
                            })
                          }
                          className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          title="Detail Fit Score Breakdown"
                          onClick={() => setSelectedLeadForFitScore(lead)}
                          className="rounded-lg p-1.5 text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <Award className="h-4 w-4" />
                        </button>
                        <button
                          title="Hapus Lead"
                          onClick={() => onDeleteLead(lead.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-mono font-medium text-slate-500 whitespace-nowrap">
                      {lead.id}
                    </td>

                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {lead.companyName}
                    </td>

                    {/* Priority A/B/C badge */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          lead.priority === 'A'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : lead.priority === 'B'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Prioritas {lead.priority}
                      </span>
                    </td>

                    {/* Fit Score */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLeadForFitScore(lead)}
                        className={`inline-flex items-center gap-1 font-extrabold text-xs px-2 py-0.5 rounded-md hover:underline ${
                          lead.fitScore >= 90
                            ? 'text-emerald-700 bg-emerald-50'
                            : lead.fitScore >= 80
                            ? 'text-indigo-700 bg-indigo-50'
                            : 'text-slate-700 bg-slate-100'
                        }`}
                      >
                        <span>{lead.fitScore}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </button>
                    </td>

                    {/* Lead Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          lead.leadStatus === 'Ready'
                            ? 'bg-indigo-100 text-indigo-800'
                            : lead.leadStatus === 'Researching'
                            ? 'bg-slate-100 text-slate-700'
                            : lead.leadStatus === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : lead.leadStatus === 'Interview'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.leadStatus === 'Follow-up'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {lead.leadStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {lead.targetPosition}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {lead.vacancyStatus}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-900">{lead.contactPersonName || '-'}</div>
                      <div className="text-[10px] text-slate-500">{lead.contactPersonRole}</div>
                    </td>

                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-indigo-700">
                      {lead.hrEmail || '-'}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {lead.industry}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                      {lead.city}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
                        {lead.applicationStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {lead.dateFound}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {lead.dateApplied || '-'}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {lead.followUp1Date || '-'}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {lead.followUp2Date || '-'}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">{lead.result}</span>
                    </td>

                    <td className="py-2.5 px-4 text-slate-600 max-w-[240px] truncate" title={lead.fitReason}>
                      {lead.fitReason}
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="flex flex-wrap gap-1">
                        {lead.relevantSkills.map((sk) => (
                          <span key={sk} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {lead.website ? (
                        <a href={lead.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                          <span>Kunjungi</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : '-'}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {lead.linkedin ? (
                        <a href={lead.linkedin} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                          <span>LinkedIn</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : '-'}
                    </td>

                    <td className="py-2.5 px-4 text-slate-500 max-w-[240px] truncate" title={lead.notes}>
                      {lead.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Fit Score Breakdown */}
      {selectedLeadForFitScore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Sistem Scoring Transparan
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Fit Score: {selectedLeadForFitScore.companyName}
                </h3>
                <p className="text-xs text-slate-500">{selectedLeadForFitScore.targetPosition}</p>
              </div>
              <button
                onClick={() => setSelectedLeadForFitScore(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center rounded-2xl bg-indigo-50 p-4 text-center">
              <div>
                <span className="text-3xl font-black text-indigo-700">
                  {selectedLeadForFitScore.fitScore}
                </span>
                <span className="text-sm font-semibold text-slate-500"> / 100</span>
                <p className="text-xs font-medium text-indigo-900 mt-1">
                  Kecocokan Objektif antara Profil &amp; Kebutuhan Posisi
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>1. Skill Match (Sales, B2B, Storytelling, Content)</span>
                  <span className="text-indigo-600">Maks 40</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Kecocokan skill aktif: {selectedLeadForFitScore.relevantSkills.join(', ')}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>2. Job Accessibility &amp; Portfolio</span>
                  <span className="text-indigo-600">Maks 35</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Level posisi realistis &amp; portfolio tulisan/script dapat digunakan sebagai bukti nyata.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>3. Company Fit (Sektor &amp; Dinamika)</span>
                  <span className="text-indigo-600">Maks 25</span>
                </div>
                <p className="mt-1 text-slate-600">
                  Industri: {selectedLeadForFitScore.industry} (Terbuka terhadap direct pitch / outbound).
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLeadForFitScore(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Target Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Target Lead Baru</h3>
                <p className="text-xs text-slate-500">Masukkan info riset perusahaan untuk direct outbound</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Live Fit Score Preview Bar */}
              <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 p-3.5 border border-indigo-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-900">Kalkulasi Fit Score Otomatis:</span>
                  <p className="text-[10px] text-slate-600">
                    Dihitung realtime berdasarkan kecocokan skill, aksesibilitas posisi, dan tipe industri.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-700">{liveFitScore.totalScore}</span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="misal: PT Maju Bersama"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Industri</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  >
                    {TARGET_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posisi yang Ditarget *</label>
                  <input
                    type="text"
                    required
                    value={formData.targetPosition}
                    onChange={(e) => setFormData({ ...formData, targetPosition: e.target.value })}
                    placeholder="misal: Outbound B2B Sales / Content Lead"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kota / Lokasi</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="misal: Jakarta Selatan / Remote"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPersonName}
                    onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                    placeholder="misal: Sarah Wijaya"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan PIC</label>
                  <input
                    type="text"
                    value={formData.contactPersonRole}
                    onChange={(e) => setFormData({ ...formData, contactPersonRole: e.target.value })}
                    placeholder="misal: Head of Sales / Recruiter"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email HR/Recruiter</label>
                  <input
                    type="email"
                    value={formData.hrEmail}
                    onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                    placeholder="recruitment@domain.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Skills Checklist */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Paling Relevan</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {USER_SKILLS.map((skill) => {
                    const isChecked = (formData.relevantSkills || []).includes(skill);
                    return (
                      <label key={skill} className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = formData.relevantSkills || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, relevantSkills: [...current, skill] });
                            } else {
                              setFormData({ ...formData, relevantSkills: current.filter((s) => s !== skill) });
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{skill}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Perusahaan Cocok dengan Skill</label>
                <textarea
                  rows={2}
                  value={formData.fitReason}
                  onChange={(e) => setFormData({ ...formData, fitReason: e.target.value })}
                  placeholder="Ceritakan korelasi kebutuhan bisnis mereka dengan portfolio atau pengalaman Anda..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="A">Prioritas A (Tinggi)</option>
                    <option value="B">Prioritas B (Menengah)</option>
                    <option value="C">Prioritas C (Rendah)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Lead</label>
                  <select
                    value={formData.leadStatus}
                    onChange={(e) => setFormData({ ...formData, leadStatus: e.target.value as LeadStatus })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Researching">Researching</option>
                    <option value="Ready">Ready (Siap Kirim)</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Interview">Interview</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Lowongan</label>
                  <select
                    value={formData.vacancyStatus}
                    onChange={(e) => setFormData({ ...formData, vacancyStatus: e.target.value as VacancyStatus })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Active">Active (Ada info lowongan)</option>
                    <option value="Open Application">Open Application (Inisiatif pitch)</option>
                    <option value="Unknown">Unknown</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Simpan Target Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
