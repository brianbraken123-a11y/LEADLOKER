import React, { useState } from 'react';
import { Contact, VerificationStatus } from '../types';
import { Plus, Search, CheckCircle2, ShieldCheck, AlertCircle, ExternalLink, Mail, Trash2, X } from 'lucide-react';

interface ContactsViewProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onOpenEmailModal: (params: { to: string; companyName: string; contactName?: string; position: string }) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onOpenEmailModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Contact>>({
    company: '',
    contactName: '',
    position: '',
    email: '',
    linkedin: '',
    source: 'Official Website',
    verificationStatus: 'Verified Official Website',
    lastVerified: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.email) {
      alert('Nama Perusahaan dan Email wajib diisi.');
      return;
    }

    const newContact: Contact = {
      id: `CT-${String(contacts.length + 1).padStart(3, '0')}`,
      company: formData.company || '',
      contactName: formData.contactName || '',
      position: formData.position || '',
      email: formData.email || '',
      linkedin: formData.linkedin || '',
      source: formData.source || 'Website',
      verificationStatus: (formData.verificationStatus as VerificationStatus) || 'Verified Official Website',
      lastVerified: formData.lastVerified || new Date().toISOString().split('T')[0],
      notes: formData.notes || '',
    };

    onAddContact(newContact);
    setIsAddModalOpen(false);
    setFormData({
      company: '',
      contactName: '',
      position: '',
      email: '',
      linkedin: '',
      source: 'Official Website',
      verificationStatus: 'Verified Official Website',
      lastVerified: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerification =
      verificationFilter === 'ALL' || c.verificationStatus === verificationFilter;

    return matchesSearch && matchesVerification;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sheet 2: Contacts Verification Database ({contacts.length})
          </h1>
          <p className="text-xs text-slate-500">
            Pastikan setiap email telah divalidasi sumbernya (Website Resmi, LinkedIn, dll.) sebelum melakukan cold outbound.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Kontak Terverifikasi</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kontak, posisi, perusahaan, atau email..."
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Status Verifikasi</option>
              <option value="Verified Official Website">Verified Official Website</option>
              <option value="Verified LinkedIn">Verified LinkedIn</option>
              <option value="Job Portal">Job Portal</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100/95 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">Perusahaan</th>
                <th className="py-3 px-4">Nama Kontak</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Email Terverifikasi</th>
                <th className="py-3 px-3.5">Status Verifikasi</th>
                <th className="py-3 px-3.5">Sumber &amp; Tgl</th>
                <th className="py-3 px-4 min-w-[200px]">Catatan Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {contact.company}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {contact.contactName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {contact.position}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-indigo-600">
                    {contact.email}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {contact.verificationStatus === 'Verified Official Website' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> Website Resmi
                      </span>
                    ) : contact.verificationStatus === 'Verified LinkedIn' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        <CheckCircle2 className="h-3 w-3" /> Verified LinkedIn
                      </span>
                    ) : contact.verificationStatus === 'Job Portal' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-700">
                        Job Portal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                        <AlertCircle className="h-3 w-3" /> Unverified
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <div className="text-slate-800 font-medium">{contact.source}</div>
                    <div className="text-[10px] text-slate-400">{contact.lastVerified}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {contact.notes || '-'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Kirim Email Outbound via Gmail"
                        onClick={() =>
                          onOpenEmailModal({
                            to: contact.email,
                            companyName: contact.company,
                            contactName: contact.contactName,
                            position: contact.position,
                          })
                        }
                        className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka LinkedIn"
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        title="Hapus Kontak"
                        onClick={() => onDeleteContact(contact.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tambah Kontak Baru</h3>
                <p className="text-xs text-slate-500">Simpan kontak PIC setelah verifikasi</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="misal: PT Mekari"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kontak</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="misal: Kevin Sanjaya"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan / Role</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="misal: Head of BD"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Kontak *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="kevin@mekari.com"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Verifikasi</label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as VerificationStatus })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="Verified Official Website">Verified Official Website</option>
                  <option value="Verified LinkedIn">Verified LinkedIn</option>
                  <option value="Job Portal">Job Portal</option>
                  <option value="Unverified">Unverified</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Bukti Verifikasi</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dikonfirmasi dari halaman About Us atau posting lowongan di LinkedIn..."
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
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
