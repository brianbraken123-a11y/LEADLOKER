import React, { useState, useMemo } from 'react';
import {
  Search,
  Globe,
  Mail,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  ExternalLink,
  Plus,
  Building2,
  MapPin,
  Briefcase,
  Layers,
  ArrowRight,
  Info,
  Send,
  SlidersHorizontal,
  CheckCircle,
  Copy
} from 'lucide-react';
import { Lead, Contact, Priority } from '../types';
import { calculateFitScore } from '../utils/fitScore';

interface GoogleHarvesterViewProps {
  onImportLeads: (leadsToImport: Omit<Lead, 'id'>[]) => void;
  onDirectEmail: (companyName: string, contactEmail: string, position: string, contactName?: string) => void;
  existingLeads: Lead[];
  onNavigateToLeads: () => void;
}

export interface HarvestedLeadItem {
  id: string;
  companyName: string;
  industry: string;
  city: string;
  website: string;
  contactPersonRole: string;
  hrEmail: string;
  emailSource: string;
  targetPosition: string;
  jobLink: string;
  vacancyStatus: 'Active' | 'Open Application';
  fitReason: string;
  relevantSkills: string[];
  notes: string;
  fitScore: number;
  priority: Priority;
  isSelected: boolean;
}

export const GoogleHarvesterView: React.FC<GoogleHarvesterViewProps> = ({
  onImportLeads,
  onDirectEmail,
  existingLeads,
  onNavigateToLeads,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('site:co.id/career "business development"');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [harvestedLeads, setHarvestedLeads] = useState<HarvestedLeadItem[]>([]);
  const [groundingSources, setGroundingSources] = useState<string[]>([]);
  const [apiSourceInfo, setApiSourceInfo] = useState<string | null>(null);
  const [filterEmailOnly, setFilterEmailOnly] = useState<boolean>(false);
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Grouped Presets requested by the user
  const presetCategories = [
    {
      category: '🌟 Sangat Berguna (Domain Korporat Indonesia .co.id)',
      description: 'Menyasar langsung subdirektori karir resmi perusahaan berbadan hukum di Indonesia',
      queries: [
        { label: 'site:co.id/career "business development"', query: 'site:co.id/career "business development"' },
        { label: 'site:co.id/career "marketing communication"', query: 'site:co.id/career "marketing communication"' },
        { label: 'site:co.id/career sales', query: 'site:co.id/career sales' },
        { label: 'site:co.id/career marketing', query: 'site:co.id/career marketing' },
      ],
    },
    {
      category: '📧 Direct Recruiter & Email Dorks',
      description: 'Menembus Google Snippet yang memuat email HR/recruitment langsung',
      queries: [
        { label: '"marketing communication" "Jakarta" "email"', query: '"marketing communication" "Jakarta" "email"' },
        { label: '"business development" "Indonesia" "recruitment@"', query: '"business development" "Indonesia" "recruitment@"' },
        { label: '"sales marketing" "Jakarta" "email"', query: '"sales marketing" "Jakarta" "email"' },
      ],
    },
    {
      category: '🚀 Inbound Lowongan & Ekosistem Startup',
      description: 'Menemukan postingan lowongan aktif di startup dan agensi berkembang',
      queries: [
        { label: '"business development" "career" startup Indonesia', query: '"business development" "career" startup Indonesia' },
        { label: '"marketing communication" "career" "Indonesia"', query: '"marketing communication" "career" "Indonesia"' },
        { label: '"content creator" "Indonesia" "career"', query: '"content creator" "Indonesia" "career"' },
      ],
    },
  ];

  // Tag helpers for custom query building
  const queryHelpers = [
    'site:co.id/career',
    'recruitment@',
    '"email"',
    '"Jakarta"',
    '"Indonesia"',
    'startup',
    '"marketing communication"',
    '"business development"',
    '"sales marketing"',
    'career',
  ];

  const handleAppendTag = (tag: string) => {
    if (!searchQuery.includes(tag)) {
      setSearchQuery((prev) => (prev ? `${prev.trim()} ${tag}` : tag));
    }
  };

  const handleExecuteSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setImportSuccessMsg(null);

    try {
      const response = await fetch('/api/search-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      const rawLeads = data.leads || [];

      // Process and augment each lead with Fit Score and selection state
      const processed: HarvestedLeadItem[] = rawLeads.map((item: any, idx: number) => {
        const fitScoreDetails = calculateFitScore({
          targetPosition: item.targetPosition || '',
          industry: item.industry || '',
          fitReason: item.fitReason || '',
          selectedSkills: item.relevantSkills || [],
          notes: item.notes || '',
        });

        const score = fitScoreDetails.totalScore;
        const priority: Priority = score >= 85 ? 'A' : score >= 70 ? 'B' : 'C';

        return {
          id: `HL-${Date.now()}-${idx}`,
          companyName: item.companyName || 'Perusahaan',
          industry: item.industry || 'B2B Company',
          city: item.city || 'Jakarta',
          website: item.website || '',
          contactPersonRole: item.contactPersonRole || 'Recruiter / Talent Acquisition',
          hrEmail: item.hrEmail || '',
          emailSource: item.emailSource || 'Google Search Result',
          targetPosition: item.targetPosition || 'Business Development / Sales',
          jobLink: item.jobLink || item.website || '',
          vacancyStatus: (item.vacancyStatus as any) || 'Active',
          fitReason: item.fitReason || 'Relevan dengan target outreach B2B dan Storytelling.',
          relevantSkills: item.relevantSkills || ['B2B Sales', 'Business Development'],
          notes: item.notes || '',
          fitScore: score,
          priority,
          isSelected: true, // Default to selected for quick batch import
        };
      });

      setHarvestedLeads(processed);
      setGroundingSources(data.groundingSources || []);
      setApiSourceInfo(data.source === 'google_search_grounding' ? 'Google Search Real-Time Grounding' : 'Curated Intelligence Crawler');
      setHasSearched(true);
    } catch (err: any) {
      console.error('Failed to search leads:', err);
      alert('Gagal mengambil data dari Google Search. Pastikan server aktif.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInGoogle = () => {
    if (!searchQuery.trim()) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleToggleSelect = (id: string) => {
    setHarvestedLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, isSelected: !lead.isSelected } : lead))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setHarvestedLeads((prev) => prev.map((lead) => ({ ...lead, isSelected: select })));
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Filtered leads view
  const filteredLeads = useMemo(() => {
    return harvestedLeads.filter((lead) => {
      if (filterEmailOnly && !lead.hrEmail) return false;
      if (industryFilter !== 'all' && lead.industry !== industryFilter) return false;
      return true;
    });
  }, [harvestedLeads, filterEmailOnly, industryFilter]);

  const selectedCount = useMemo(() => {
    return harvestedLeads.filter((l) => l.isSelected).length;
  }, [harvestedLeads]);

  // Unique industries in the current result set
  const availableIndustries = useMemo(() => {
    const set = new Set<string>();
    harvestedLeads.forEach((l) => {
      if (l.industry) set.add(l.industry);
    });
    return Array.from(set);
  }, [harvestedLeads]);

  const handleBatchImport = () => {
    const selected = harvestedLeads.filter((l) => l.isSelected);
    if (selected.length === 0) {
      alert('Pilih minimal satu lead untuk diimpor.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const leadsToImport: Omit<Lead, 'id'>[] = selected.map((item) => ({
      companyName: item.companyName,
      industry: item.industry,
      city: item.city,
      website: item.website,
      linkedin: '',
      instagram: '',
      contactPersonName: 'Tim Recruitment',
      contactPersonRole: item.contactPersonRole,
      hrEmail: item.hrEmail,
      emailSource: item.emailSource,
      targetPosition: item.targetPosition,
      jobLink: item.jobLink,
      vacancyStatus: item.vacancyStatus,
      fitReason: item.fitReason,
      relevantSkills: item.relevantSkills,
      fitScore: item.fitScore,
      priority: item.priority,
      dateFound: todayStr,
      leadStatus: item.hrEmail ? 'Ready' : 'Researching',
      applicationStatus: 'Not Sent',
      result: 'Pending',
      notes: `${item.notes ? item.notes + ' | ' : ''}Ditarik via Google Search query: "${searchQuery}"`,
    }));

    onImportLeads(leadsToImport);
    setImportSuccessMsg(`Berhasil mengimpor ${selected.length} lead ke database LEADS & CONTACTS!`);
    
    // Deselect imported leads
    setHarvestedLeads((prev) =>
      prev.map((l) => (l.isSelected ? { ...l, isSelected: false } : l))
    );
  };

  const handleExportCSV = () => {
    if (harvestedLeads.length === 0) return;

    const headers = [
      'Perusahaan',
      'Posisi Ditarget',
      'Industri',
      'Kota',
      'Email HR',
      'Sumber Email',
      'Website',
      'Link Lowongan',
      'Fit Score',
      'Prioritas',
      'Alasan Cocok',
      'Catatan',
    ];

    const rows = harvestedLeads.map((lead) => [
      `"${lead.companyName.replace(/"/g, '""')}"`,
      `"${lead.targetPosition.replace(/"/g, '""')}"`,
      `"${lead.industry.replace(/"/g, '""')}"`,
      `"${lead.city.replace(/"/g, '""')}"`,
      `"${lead.hrEmail.replace(/"/g, '""')}"`,
      `"${lead.emailSource.replace(/"/g, '""')}"`,
      `"${lead.website.replace(/"/g, '""')}"`,
      `"${lead.jobLink.replace(/"/g, '""')}"`,
      lead.fitScore,
      lead.priority,
      `"${lead.fitReason.replace(/"/g, '""')}"`,
      `"${lead.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `google_harvested_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Explanation */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-100/80 px-2.5 py-1 text-xs font-semibold text-indigo-800">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Google Search Intelligence &amp; Lead Harvester</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Tarik Data Lowongan &amp; Email Recruiter Langsung dari Google
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Gunakan teknik <strong>Google Dorking</strong> untuk mencari perusahaan yang sedang membuka lowongan
              dan mengekstrak email HR (<code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">recruitment@</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">site:co.id/career</code>) tanpa perlu browsing manual satu per satu.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNavigateToLeads}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Building2 className="h-4 w-4 text-indigo-600" />
              <span>Lihat Database LEADS ({existingLeads.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Search Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Google Search Query / Dork Command:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExecuteSearch();
                }}
                placeholder='Ketik query atau pilih preset di bawah, misal: site:co.id/career "business development"'
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 py-3 pl-11 pr-4 text-sm font-mono text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExecuteSearch()}
                disabled={isLoading || !searchQuery.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Menarik dari Google...</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    <span>Tarik Data Langsung</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenInGoogle}
                title="Buka query ini di tab Google Search resmi"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs whitespace-nowrap"
              >
                <ExternalLink className="h-4 w-4 text-slate-500" />
                <span className="hidden sm:inline">Buka di Google</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dork Builder Tag Helpers */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sintaks &amp; Kata Kunci Tambahan (+ Klik untuk menambahkan):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {queryHelpers.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAppendTag(tag)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100/70 px-2 py-1 text-xs font-mono text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <Plus className="h-3 w-3 text-slate-400" />
                <span>{tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Requested Presets Categorized */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Template Query Siap Pakai (Rekomendasi Terbaik):
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetCategories.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">{cat.category}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                </div>

                <div className="space-y-1.5 pt-1">
                  {cat.queries.map((item, qIdx) => (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item.query);
                        handleExecuteSearch(item.query);
                      }}
                      className="w-full text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/70 hover:text-indigo-800 transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <span className="truncate pr-2">{item.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {importSuccessMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between text-emerald-800 text-sm font-semibold shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{importSuccessMsg}</span>
          </div>
          <button
            onClick={onNavigateToLeads}
            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
          >
            Buka Tab LEADS &rarr;
          </button>
        </div>
      )}

      {/* Results Staging Section */}
      {harvestedLeads.length > 0 && (
        <div className="space-y-4">
          {/* Controls & Metrics Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-900">
                Hasil Tarikan Data: <span className="text-indigo-600">{harvestedLeads.length} Lead</span>
              </span>
              {apiSourceInfo && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                  Sumber: {apiSourceInfo}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Email Only */}
              <button
                type="button"
                onClick={() => setFilterEmailOnly(!filterEmailOnly)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  filterEmailOnly
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-transparent'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Hanya Ada Email HR</span>
              </button>

              {/* Industry Filter dropdown if multiple available */}
              {availableIndustries.length > 1 && (
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">Semua Industri ({harvestedLeads.length})</option>
                  {availableIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              )}

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="h-3.5 w-3.5 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>

              {/* Batch Import Action */}
              <button
                type="button"
                onClick={handleBatchImport}
                disabled={selectedCount === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Impor {selectedCount} Lead ke Database</span>
              </button>
            </div>
          </div>

          {/* Grounding Citations Banner if returned */}
          {groundingSources.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                Situs &amp; Domain yang Dirayapi Google:
              </span>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {groundingSources.slice(0, 6).map((src, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-700 truncate max-w-xs"
                    title={src}
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Table / List of Leads */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">
                      <button
                        type="button"
                        onClick={() => handleSelectAll(selectedCount !== harvestedLeads.length)}
                        className="text-slate-500 hover:text-indigo-600"
                        title="Pilih / Batal Pilih Semua"
                      >
                        {selectedCount === harvestedLeads.length ? (
                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-3">Perusahaan &amp; Industri</th>
                    <th className="py-3 px-3">Posisi Target</th>
                    <th className="py-3 px-3">Email HR / Sumber Kontak</th>
                    <th className="py-3 px-3 text-center">Fit Score &amp; Prioritas</th>
                    <th className="py-3 px-3">Alasan Relevan</th>
                    <th className="py-3 px-3 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const isAlreadyImported = existingLeads.some(
                      (l) => l.companyName.toLowerCase() === lead.companyName.toLowerCase()
                    );

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          lead.isSelected ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleSelect(lead.id)}
                            className="text-slate-400 hover:text-indigo-600"
                          >
                            {lead.isSelected ? (
                              <CheckSquare className="h-4 w-4 text-indigo-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{lead.companyName}</span>
                            {isAlreadyImported && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                                Sudah di CRM
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="inline-flex items-center gap-0.5">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              {lead.industry}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-0.5">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {lead.city}
                            </span>
                          </div>
                          {lead.website && (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-indigo-600 hover:underline flex items-center gap-0.5 mt-0.5 font-mono"
                            >
                              <span className="truncate max-w-[180px]">{lead.website.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                            </a>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-slate-800">{lead.targetPosition}</div>
                          {lead.jobLink && lead.jobLink !== lead.website && (
                            <a
                              href={lead.jobLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5 font-mono"
                            >
                              <span>Lihat Karir / Loker</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </td>

                        <td className="py-3.5 px-3">
                          {lead.hrEmail ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 text-[11px]">
                                  {lead.hrEmail}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyEmail(lead.hrEmail)}
                                  className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
                                  title="Salin Email"
                                >
                                  {copiedEmail === lead.hrEmail ? (
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-500 italic">
                                Sumber: {lead.emailSource}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Email belum tertera di snippet (Cek halaman karir)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                lead.fitScore >= 85
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : lead.fitScore >= 70
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {lead.fitScore}/100
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                lead.priority === 'A'
                                  ? 'bg-rose-100 text-rose-800'
                                  : lead.priority === 'B'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              Prioritas {lead.priority}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 max-w-xs">
                          <p className="text-[11px] text-slate-700 line-clamp-2">{lead.fitReason}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lead.relevantSkills.slice(0, 3).map((s, i) => (
                              <span
                                key={i}
                                className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] text-slate-600"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.hrEmail && (
                              <button
                                type="button"
                                onClick={() =>
                                  onDirectEmail(
                                    lead.companyName,
                                    lead.hrEmail,
                                    lead.targetPosition,
                                    lead.contactPersonRole
                                  )
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
                                title="Buka Gmail Composer untuk lamaran langsung"
                              >
                                <Send className="h-3 w-3" />
                                <span>Kirim Email</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                onImportLeads([
                                  {
                                    companyName: lead.companyName,
                                    industry: lead.industry,
                                    city: lead.city,
                                    website: lead.website,
                                    linkedin: '',
                                    instagram: '',
                                    contactPersonName: 'Tim Recruitment',
                                    contactPersonRole: lead.contactPersonRole,
                                    hrEmail: lead.hrEmail,
                                    emailSource: lead.emailSource,
                                    targetPosition: lead.targetPosition,
                                    jobLink: lead.jobLink,
                                    vacancyStatus: lead.vacancyStatus,
                                    fitReason: lead.fitReason,
                                    relevantSkills: lead.relevantSkills,
                                    fitScore: lead.fitScore,
                                    priority: lead.priority,
                                    dateFound: new Date().toISOString().split('T')[0],
                                    leadStatus: lead.hrEmail ? 'Ready' : 'Researching',
                                    applicationStatus: 'Not Sent',
                                    result: 'Pending',
                                    notes: `${lead.notes ? lead.notes + ' | ' : ''}Ditarik via Google Search query: "${searchQuery}"`,
                                  },
                                ]);
                                setImportSuccessMsg(`Lead ${lead.companyName} berhasil diimpor!`);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                              title="Tambahkan ke LEADS database"
                            >
                              <Plus className="h-3 w-3 text-slate-500" />
                              <span>Impor</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty / Guide State */}
      {!hasSearched && !isLoading && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Search className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">Siap Menarik Data dari Google</h3>
            <p className="text-xs text-slate-500">
              Pilih salah satu preset query di atas (seperti <code className="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono">site:co.id/career "business development"</code>) atau masukkan kata kunci Anda sendiri, lalu klik <strong>Tarik Data Langsung</strong>.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleExecuteSearch()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Globe className="h-4 w-4" />
              <span>Jalankan Pencarian Sekarang</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
