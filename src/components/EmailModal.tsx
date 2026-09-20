import React, { useState } from 'react';
import { Mail, Send, X, FileText, CheckCircle2 } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { sendGmailEmail } from '../lib/googleWorkspace';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  defaultTo?: string;
  companyName?: string;
  contactName?: string;
  position?: string;
  onSentSuccess?: (sentDetails: { to: string; subject: string; dateSent: string }) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  defaultTo = '',
  companyName = '',
  contactName = '',
  position = '',
  onSentSuccess,
}) => {
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(
    `Direct Application: ${position || 'B2B Sales & Storytelling'} - [Nama Anda] untuk ${companyName || 'Tim'}`
  );
  const [templateType, setTemplateType] = useState<'b2b' | 'marcom' | 'followup1' | 'followup2'>('b2b');
  const [bodyText, setBodyText] = useState(
    `Halo ${contactName || 'Tim Recruitment'},\n\nSemoga email ini menemui Anda dalam keadaan baik.\n\nSaya telah mengikuti perkembangan ${companyName || 'perusahaan Anda'} dan sangat terkesan dengan ekspansi yang sedang dilakukan. Dengan latar belakang saya di B2B Sales, Business Development, serta Client Relationship, saya ingin mengajukan diri secara langsung untuk posisi ${position || 'B2B Sales / Business Development'}.\n\nSaya memiliki pengalaman berkomunikasi langsung dengan customer dan klien B2B, menyusun penawaran solusi, serta portofolio website dan materi presentasi yang relevan.\n\nBerikut tautan portfolio & resume saya:\n• Portfolio: https://myportfolio.id\n• LinkedIn: https://linkedin.com/in/profil-saya\n\nBesar harapan saya untuk dapat berdiskusi singkat mengenai bagaimana saya dapat berkontribusi bagi target pertumbuhan tim Anda.\n\nTerima kasih atas waktu dan perhatiannya.\n\nSalam hangat,\n[Nama Anda]\n[Nomor WhatsApp]`
  );

  React.useEffect(() => {
    if (isOpen) {
      setTo(defaultTo);
      setSubject(`Direct Application: ${position || 'B2B Sales & Storytelling'} - [Nama Anda] untuk ${companyName || 'Tim'}`);
      setBodyText(
        `Halo ${contactName || 'Tim Recruitment'},\n\nSemoga email ini menemui Anda dalam keadaan baik.\n\nSaya telah mengikuti perkembangan ${companyName || 'perusahaan Anda'} dan sangat terkesan dengan ekspansi yang sedang dilakukan. Dengan latar belakang saya di B2B Sales, Business Development, serta Client Relationship, saya ingin mengajukan diri secara langsung untuk posisi ${position || 'B2B Sales / Business Development'}.\n\nSaya memiliki pengalaman berkomunikasi langsung dengan customer dan klien B2B, menyusun penawaran solusi, serta portofolio website dan materi presentasi yang relevan.\n\nBerikut tautan portfolio & resume saya:\n• Portfolio: https://myportfolio.id\n• LinkedIn: https://linkedin.com/in/profil-saya\n\nBesar harapan saya untuk dapat berdiskusi singkat mengenai bagaimana saya dapat berkontribusi bagi target pertumbuhan tim Anda.\n\nTerima kasih atas waktu dan perhatiannya.\n\nSalam hangat,\n[Nama Anda]\n[Nomor WhatsApp]`
      );
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultTo, companyName, contactName, position]);

  const [isConfirming, setIsConfirming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Update template
  const applyTemplate = (type: 'b2b' | 'marcom' | 'followup1' | 'followup2') => {
    setTemplateType(type);
    if (type === 'b2b') {
      setSubject(`Direct Application: ${position || 'B2B Sales & Growth'} - [Nama Anda] untuk ${companyName}`);
      setBodyText(
        `Halo ${contactName || 'Tim Recruitment'},\n\nSemoga email ini menemui Anda dalam keadaan baik.\n\nSaya telah mengikuti perkembangan ${companyName || 'perusahaan Anda'} dan sangat terkesan dengan momentum pertumbuhannya. Dengan keahlian di B2B Sales, Business Development, dan Customer Relationship, saya berminat mengajukan diri secara langsung untuk berkontribusi pada posisi ${position || 'B2B Sales / BD'}.\n\nSelama ini saya terbiasa melakukan outbound prospecting, negosiasi dengan klien, dan merancang solusi bisnis yang menjawab kebutuhan mitra. Portofolio case study serta resume lengkap saya dapat diakses di: https://myportfolio.id\n\nApakah ada waktu 10-15 menit minggu ini untuk diskusi singkat mengenai kebutuhan tim Anda?\n\nSalam hangat,\n[Nama Anda]\n[Nomor WhatsApp]`
      );
    } else if (type === 'marcom') {
      setSubject(`Aplikasi Posisi ${position || 'Content Marketing & Storytelling'} - [Nama Anda]`);
      setBodyText(
        `Halo ${contactName || 'Tim Recruitment'},\n\nSaya sangat menyukai cara ${companyName || 'brand Anda'} mengemas komunikasi ke audiens. Dengan pengalaman saya di Storytelling, Copywriting, Marketing Communication, dan Social Media Content, saya ingin mengajukan direct application untuk posisi ${position || 'Content Marketing / Storytelling Specialist'}.\n\nSaya telah menyusun berbagai script video, konten artikel thought-leadership, serta kampanye komunikasi yang terbukti mendorong engagement dan konversi.\n\nAnda dapat meninjau contoh karya dan portofolio tulisan saya di: https://myportfolio.id/writing\n\nTerima kasih banyak atas kesediaan Anda membaca surat lamaran ini.\n\nSalam kreatif,\n[Nama Anda]\n[Nomor WhatsApp]`
      );
    } else if (type === 'followup1') {
      setSubject(`Follow-up: Lamaran ${position || 'Posisi'} di ${companyName} - [Nama Anda]`);
      setBodyText(
        `Halo ${contactName || 'Tim'},\n\nSaya ingin menindaklanjuti email lamaran yang saya kirimkan beberapa hari lalu terkait posisi ${position || 'yang saya minati'} di ${companyName}.\n\nSaya tetap sangat antusias untuk berdiskusi mengenai bagaimana kemampuan saya di Sales & Storytelling dapat mendukung sasaran tim Anda saat ini. Portofolio saya masih dapat diakses di: https://myportfolio.id\n\nJika ada informasi tambahan yang dibutuhkan, saya dengan senang hati akan menyediakannya.\n\nTerima kasih banyak!\n\nSalam hangat,\n[Nama Anda]`
      );
    } else if (type === 'followup2') {
      setSubject(`Follow-up 2: Lamaran ${position} - [Nama Anda]`);
      setBodyText(
        `Halo ${contactName || 'Tim'},\n\nMenyambung korespondensi sebelumnya, saya memahami jadwal Anda yang tentu sangat padat. Saya hanya ingin memastikan bahwa email lamaran saya sebelumnya telah sampai dengan aman.\n\nJika saat ini posisi tersebut belum dibuka kembali, saya akan sangat senang jika kita dapat tetap terhubung di LinkedIn untuk peluang kolaborasi di masa depan.\n\nTerima kasih atas waktu dan dedikasi tim ${companyName}.\n\nSalam sukses,\n[Nama Anda]`
      );
    }
  };

  const handleSendClick = () => {
    if (!to || !to.includes('@')) {
      setErrorMsg('Harap masukkan alamat email tujuan yang valid.');
      return;
    }
    setErrorMsg(null);
    setIsConfirming(true);
  };

  const handleConfirmedSend = async () => {
    if (!accessToken) {
      setErrorMsg('Akun Google belum terhubung. Silakan Sign In dengan Google terlebih dahulu.');
      setIsConfirming(false);
      return;
    }

    try {
      setIsSending(true);
      setErrorMsg(null);
      await sendGmailEmail(accessToken, {
        to,
        subject,
        bodyText,
      });

      setSuccessMsg(`Email berhasil terkirim ke ${to} melalui akun Gmail Anda!`);
      if (onSentSuccess) {
        onSentSuccess({
          to,
          subject,
          dateSent: new Date().toISOString().split('T')[0],
        });
      }

      setTimeout(() => {
        setIsConfirming(false);
        setIsSending(false);
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim email.');
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Outbound Email via Gmail</h3>
                <p className="text-xs text-slate-500">Kirim lamaran atau follow-up langsung dari akun Gmail Anda</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Pilih Template Pesan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('b2b')}
                  className={`rounded-lg px-3 py-2 text-xs font-medium border text-left transition-all ${
                    templateType === 'b2b'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">B2B Sales Pitch</span>
                  <span className="text-[10px] text-slate-500">Kemitraan & Closing</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('marcom')}
                  className={`rounded-lg px-3 py-2 text-xs font-medium border text-left transition-all ${
                    templateType === 'marcom'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Marcom & Story</span>
                  <span className="text-[10px] text-slate-500">Konten & Copywriting</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('followup1')}
                  className={`rounded-lg px-3 py-2 text-xs font-medium border text-left transition-all ${
                    templateType === 'followup1'
                      ? 'border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Follow-up 1</span>
                  <span className="text-[10px] text-slate-500">H+4 Pengingat Halus</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('followup2')}
                  className={`rounded-lg px-3 py-2 text-xs font-medium border text-left transition-all ${
                    templateType === 'followup2'
                      ? 'border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-semibold">Follow-up 2</span>
                  <span className="text-[10px] text-slate-500">H+8 Cek Terakhir</span>
                </button>
              </div>
            </div>

            {/* Email To */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kirim Ke (Email HR / Contact Person)
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="misal: recruitment@perusahaan.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Email
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Pesan
              </label>
              <textarea
                rows={10}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3.5 text-sm font-mono leading-relaxed text-slate-900 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
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
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>Memerlukan otorisasi akun Google Gmail</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSendClick}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <Send className="h-4 w-4" />
                <span>Kirim Email</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Required Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirming}
        title="Kirim Email Outbound via Gmail?"
        message={`Apakah Anda yakin ingin mengirim email ini langsung melalui akun Gmail Anda ke alamat:\n\n• Penerima: ${to}\n• Subjek: "${subject}"\n\nTindakan ini akan mengirim email resmi ke kontak tersebut.`}
        confirmLabel="Ya, Kirim Sekarang"
        isLoading={isSending}
        onConfirm={handleConfirmedSend}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
};
