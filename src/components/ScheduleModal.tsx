import React, { useState } from 'react';
import { Calendar, Clock, X, CheckCircle2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { scheduleCalendarInterview } from '../lib/googleWorkspace';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  companyName?: string;
  position?: string;
  contactEmail?: string;
  onScheduledSuccess?: (eventDetails: { date: string; summary: string }) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  companyName = '',
  position = '',
  contactEmail = '',
  onScheduledSuccess,
}) => {
  const [summary, setSummary] = useState(`Interview: ${position || 'Posisi'} @ ${companyName || 'Perusahaan'}`);
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [attendee, setAttendee] = useState(contactEmail);
  const [notes, setNotes] = useState(
    'Persiapkan deck portofolio (B2B Sales case study & script storytelling). Siapkan pertanyaan strategis mengenai target pertumbuhan kuartal ini.'
  );

  React.useEffect(() => {
    if (isOpen) {
      setSummary(`Interview: ${position || 'Posisi'} @ ${companyName || 'Perusahaan'}`);
      setAttendee(contactEmail);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, position, companyName, contactEmail]);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleScheduleClick = () => {
    if (!date || !startTime || !endTime) {
      setErrorMsg('Harap lengkapi tanggal, jam mulai, dan jam selesai.');
      return;
    }
    setErrorMsg(null);
    setIsConfirming(true);
  };

  const handleConfirmedSchedule = async () => {
    if (!accessToken) {
      setErrorMsg('Akun Google belum terhubung. Silakan hubungkan Google Calendar terlebih dahulu.');
      setIsConfirming(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);

      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      await scheduleCalendarInterview(accessToken, {
        summary,
        company: companyName,
        position,
        startDateTime,
        endDateTime,
        contactEmail: attendee,
        notes,
      });

      setSuccessMsg(`Jadwal interview berhasil ditambahkan ke Google Calendar Anda!`);
      if (onScheduledSuccess) {
        onScheduledSuccess({
          date: `${date} ${startTime}`,
          summary,
        });
      }

      setTimeout(() => {
        setIsConfirming(false);
        setIsLoading(false);
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menambahkan ke Google Calendar.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Jadwalkan di Google Calendar</h3>
                <p className="text-xs text-slate-500">Sinkronkan jadwal wawancara langsung ke kalender kerja Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Agenda</label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Recruiter / Tamu (Opsional)</label>
              <input
                type="email"
                value={attendee}
                onChange={(e) => setAttendee(e.target.value)}
                placeholder="recruitment@company.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Persiapan & Agenda</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {successMsg}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleScheduleClick}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700"
            >
              <Clock className="h-4 w-4" />
              <span>Simpan ke Kalender</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirming}
        title="Jadwalkan ke Google Calendar?"
        message={`Apakah Anda ingin menambahkan agenda wawancara ini ke Google Calendar Anda?\n\n• Judul: ${summary}\n• Waktu: ${date} (${startTime} - ${endTime})\n• Catatan pengingat akan otomatis dipasang 30 menit sebelumnya.`}
        confirmLabel="Ya, Jadwalkan Sekarang"
        isLoading={isLoading}
        onConfirm={handleConfirmedSchedule}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
};
