import React, { useState } from 'react';
import { JobApplication, ApplicationStatus, ResultStatus, FollowUpStatus } from '../types';
import {
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

interface ApplicationsViewProps {
  applications: JobApplication[];
  onAddApplication: (app: JobApplication) => void;
  onUpdateApplication: (app: JobApplication) => void;
  onDeleteApplication: (id: string) => void;
  onOpenEmailModal: (params: { to: string; companyName: string; position: string }) => void;
  onOpenScheduleModal: (params: { companyName: string; position: string; contactEmail?: string }) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
  onOpenEmailModal,
  onOpenScheduleModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<JobApplication>>({
    company: '',
    position: '',
    contactEmail: '',
    dateSent: new Date().toISOString().split('T')[0],
    emailVersion: 'Direct Pitch B2B v1',
    cvVersion: 'CV_Sales_B2B_2026.pdf',
    portfolioLink: 'https://myportfolio.id',
    followUp1Date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    followUp2Date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    currentStatus: 'Sent',
    result: 'Pending',
    notes: '',
  });

  const handleSaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.position) {
      alert('Nama Perusahaan dan Posisi wajib diisi.');
      return;
    }

    const dateSent = formData.dateSent || new Date().toISOString().split('T')[0];
    const daysSince = Math.max(
      0,
      Math.floor((new Date().getTime() - new Date(dateSent).getTime()) / (1000 * 3600 * 24))
    );

    const newApp: JobApplication = {
      id: `APP-${String(applications.length + 1).padStart(3, '0')}`,
      company: formData.company || '',
      position: formData.position || '',
      contactEmail: formData.contactEmail || '',
      dateSent,
      emailVersion: formData.emailVersion || 'Direct Pitch v1',
      cvVersion: formData.cvVersion || 'CV_2026.pdf',
      portfolioLink: formData.portfolioLink || '',
      daysSinceApplication: daysSince,
      followUp1Date: formData.followUp1Date || '',
      followUp2Date: formData.followUp2Date || '',
      followUpStatus: daysSince >= 4 ? 'Follow-up diperlukan' : 'Belum waktunya follow-up',
      currentStatus: (formData.currentStatus as ApplicationStatus) || 'Sent',
      result: (formData.result as ResultStatus) || 'Pending',
      notes: formData.notes || '',
    };

    onAddApplication(newApp);
    setIsAddModalOpen(false);
    setFormData({
      company: '',
      position: '',
      contactEmail: '',
      dateSent: new Date().toISOString().split('T')[0],
      emailVersion: 'Direct Pitch B2B v1',
      cvVersion: 'CV_Sales_B2B_2026.pdf',
      portfolioLink: 'https://myportfolio.id',
      followUp1Date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      followUp2Date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
      currentStatus: 'Sent',
      result: 'Pending',
      notes: '',
    });
  };

  const handleStatusChange = (app: JobApplication, newStatus: ApplicationStatus) => {
    const updated = { ...app, currentStatus: newStatus };
    if (newStatus === 'Interview') updated.result = 'Interview';
    if (newStatus === 'Rejected') updated.result = 'Rejected';
    if (newStatus === 'Accepted') updated.result = 'Accepted';
    if (newStatus === 'No Response') updated.result = 'No Response';
    if (newStatus === 'Follow-up 2') updated.followUpStatus = 'Follow-up sudah dilakukan';
    onUpdateApplication(updated);
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contactEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.currentStatus === statusFilter;
    const matchesResult = resultFilter === 'ALL' || app.result === resultFilter;

    return matchesSearch && matchesStatus && matchesResult;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sheet 3: Applications Tracker ({applications.length})
          </h1>
          <p className="text-xs text-slate-500">
            Pelacakan hari sejak kirim (Days Since Application), ritme follow-up bertahap, dan konversi interview.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Lamaran Terkirim</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari perusahaan atau posisi..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Status Lamaran</option>
              <option value="Sent">Sent (Terkirim)</option>
              <option value="Follow-up 1">Follow-up 1</option>
              <option value="Follow-up 2">Follow-up 2</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="No Response">No Response</option>
            </select>
          </div>

          <div>
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Hasil</option>
              <option value="Pending">Pending</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="No Response">No Response</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table with Prompt-specific Conditional Formatting Colors */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/95 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-3.5">ID</th>
                <th className="py-3 px-4 min-w-[170px]">Perusahaan</th>
                <th className="py-3 px-4 min-w-[170px]">Posisi</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Tgl Kirim</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Days Since</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Follow-up Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status Lamaran</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Hasil Akhir</th>
                <th className="py-3 px-3.5 min-w-[150px]">Versi Email / CV</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Portfolio Link</th>
                <th className="py-3 px-4 min-w-[180px]">Catatan / Jadwal</th>
                <th className="py-3 px-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                // Formatting rules per prompt:
                // - Follow-up sudah jatuh tempo -> merah
                // - Interview -> hijau
                // - Rejected -> abu-abu
                // - No Response -> kuning
                // - Accepted / Offer -> warna khusus (teal)
                const isDue = app.followUpStatus === 'Follow-up diperlukan';
                const isInterview = app.currentStatus === 'Interview' || app.result === 'Interview';
                const isRejected = app.currentStatus === 'Rejected' || app.result === 'Rejected';
                const isNoResponse = app.currentStatus === 'No Response' || app.result === 'No Response';
                const isOfferOrAccepted = app.result === 'Offer' || app.result === 'Accepted' || app.currentStatus === 'Accepted';

                let rowBgClass = 'hover:bg-slate-50/80';
                if (isDue) rowBgClass = 'bg-rose-50/40 hover:bg-rose-50/70';
                else if (isInterview) rowBgClass = 'bg-emerald-50/40 hover:bg-emerald-50/70';
                else if (isOfferOrAccepted) rowBgClass = 'bg-teal-50/40 hover:bg-teal-50/70';
                else if (isRejected) rowBgClass = 'bg-slate-50/50 hover:bg-slate-100/60 opacity-80';
                else if (isNoResponse) rowBgClass = 'bg-amber-50/30 hover:bg-amber-50/60';

                return (
                  <tr key={app.id} className={`transition-colors ${rowBgClass}`}>
                    <td className="py-3 px-3.5 font-mono text-slate-500 font-medium">
                      {app.id}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div>{app.company}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{app.contactEmail}</div>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {app.position}
                    </td>

                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {app.dateSent}
                    </td>

                    {/* Days Since Application */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black ${
                        app.daysSinceApplication > 7
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {app.daysSinceApplication} hari
                      </span>
                    </td>

                    {/* Follow-up Status */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {isDue ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold text-rose-800 border border-rose-300 animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          Follow-up diperlukan
                        </span>
                      ) : app.followUpStatus === 'Belum waktunya follow-up' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          <Clock className="h-3 w-3" /> Belum waktunya
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> {app.followUpStatus}
                        </span>
                      )}
                    </td>

                    {/* Current Status Dropdown */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <select
                        value={app.currentStatus}
                        onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                        className={`rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors ${
                          isInterview
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                            : isOfferOrAccepted
                            ? 'border-teal-300 bg-teal-100 text-teal-800'
                            : isRejected
                            ? 'border-slate-300 bg-slate-200 text-slate-700'
                            : isNoResponse
                            ? 'border-amber-300 bg-amber-100 text-amber-800'
                            : isDue
                            ? 'border-rose-300 bg-rose-100 text-rose-800'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <option value="Not Sent">Not Sent</option>
                        <option value="Sent">Sent</option>
                        <option value="Follow-up 1">Follow-up 1</option>
                        <option value="Follow-up 2">Follow-up 2</option>
                        <option value="Interview">Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Accepted">Accepted</option>
                        <option value="No Response">No Response</option>
                      </select>
                    </td>

                    {/* Result */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isInterview
                          ? 'bg-emerald-600 text-white'
                          : isOfferOrAccepted
                          ? 'bg-teal-600 text-white'
                          : isRejected
                          ? 'bg-slate-300 text-slate-700'
                          : isNoResponse
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {app.result}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="text-[11px] font-medium text-slate-800">{app.emailVersion}</div>
                      <div className="text-[10px] text-slate-400">{app.cvVersion}</div>
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {app.portfolioLink ? (
                        <a
                          href={app.portfolioLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          <span>Portofolio</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : '-'}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={app.notes}>
                      {app.interviewDate ? (
                        <span className="font-bold text-emerald-700 block">
                          📅 {app.interviewDate}
                        </span>
                      ) : null}
                      <span>{app.notes || '-'}</span>
                    </td>

                    {/* Quick Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Kirim Follow-up via Gmail"
                          onClick={() =>
                            onOpenEmailModal({
                              to: app.contactEmail,
                              companyName: app.company,
                              position: app.position,
                            })
                          }
                          className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          title="Jadwalkan Interview di Google Calendar"
                          onClick={() =>
                            onOpenScheduleModal({
                              companyName: app.company,
                              position: app.position,
                              contactEmail: app.contactEmail,
                            })
                          }
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          title="Hapus Record"
                          onClick={() => onDeleteApplication(app.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Catat Lamaran Terkirim</h3>
                <p className="text-xs text-slate-500">Mulai tracking hari dan ritme follow-up</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveApplication} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Perusahaan *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="misal: PT Paper.id"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Posisi *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="misal: B2B Sales Representative"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Penerima</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="recruitment@perusahaan.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Email Dikirim</label>
                  <input
                    type="date"
                    value={formData.dateSent}
                    onChange={(e) => setFormData({ ...formData, dateSent: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Follow-up 1</label>
                  <input
                    type="date"
                    value={formData.followUp1Date}
                    onChange={(e) => setFormData({ ...formData, followUp1Date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Follow-up 2</label>
                  <input
                    type="date"
                    value={formData.followUp2Date}
                    onChange={(e) => setFormData({ ...formData, followUp2Date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Versi Template Email</label>
                  <input
                    type="text"
                    value={formData.emailVersion}
                    onChange={(e) => setFormData({ ...formData, emailVersion: e.target.value })}
                    placeholder="misal: Direct Pitch B2B v1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Link Portofolio Dilampirkan</label>
                  <input
                    type="url"
                    value={formData.portfolioLink}
                    onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
                    placeholder="https://myportfolio.id"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Catatan mengenai respon atau lampiran portfolio khusus..."
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  Simpan Lamaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
