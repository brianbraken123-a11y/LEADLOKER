import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Lead, Contact, JobApplication } from './types';
import { INITIAL_LEADS, INITIAL_CONTACTS, INITIAL_APPLICATIONS } from './data/initialData';
import { initAuth, googleSignIn, logout } from './lib/firebase';
import { createJobHuntingSpreadsheet } from './lib/googleWorkspace';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { LeadsView } from './components/LeadsView';
import { ContactsView } from './components/ContactsView';
import { ApplicationsView } from './components/ApplicationsView';
import { BlueprintView } from './components/BlueprintView';
import { GoogleHarvesterView } from './components/GoogleHarvesterView';
import { EmailModal } from './components/EmailModal';
import { ScheduleModal } from './components/ScheduleModal';

export default function App() {
  // Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'contacts' | 'applications' | 'blueprint' | 'harvester'>('dashboard');
  const [leadFilterStatus, setLeadFilterStatus] = useState<string | undefined>(undefined);

  // Authentication & Google Token
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Sheet Link
  const [googleSheetUrl, setGoogleSheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('jobhunting_crm_sheet_url') || null;
  });
  const [isDeployingToSheet, setIsDeployingToSheet] = useState(false);

  // Data Collections with LocalStorage caching
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('jobhunting_crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('jobhunting_crm_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = localStorage.getItem('jobhunting_crm_apps');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('jobhunting_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('jobhunting_crm_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('jobhunting_crm_apps', JSON.stringify(applications));
  }, [applications]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser: User, token: string) => {
        setUser(currentUser);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert(err.message || 'Gagal login dengan akun Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  // Modals state
  const [emailModal, setEmailModal] = useState<{
    isOpen: boolean;
    to: string;
    companyName: string;
    contactName?: string;
    position: string;
  }>({
    isOpen: false,
    to: '',
    companyName: '',
    contactName: '',
    position: '',
  });

  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    companyName: string;
    position: string;
    contactEmail?: string;
  }>({
    isOpen: false,
    companyName: '',
    position: '',
    contactEmail: '',
  });

  // Action handlers
  const handleOpenEmailModal = (params: { to: string; companyName: string; contactName?: string; position: string }) => {
    setEmailModal({
      isOpen: true,
      to: params.to,
      companyName: params.companyName,
      contactName: params.contactName,
      position: params.position,
    });
  };

  const handleOpenScheduleModal = (params: { companyName: string; position: string; contactEmail?: string }) => {
    setScheduleModal({
      isOpen: true,
      companyName: params.companyName,
      position: params.position,
      contactEmail: params.contactEmail,
    });
  };

  // Leads CRUD
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
  };

  const handleBatchImportLeads = (newLeadsData: Omit<Lead, 'id'>[]) => {
    const existingNums = leads
      .map((l) => {
        const match = l.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    let maxId = existingNums.length > 0 ? Math.max(...existingNums) : 0;

    const newLeads: Lead[] = [];
    const newContacts: Contact[] = [];

    for (const item of newLeadsData) {
      maxId++;
      const leadId = `LD-${String(maxId).padStart(3, '0')}`;
      const newLead: Lead = {
        ...item,
        id: leadId,
      };
      newLeads.push(newLead);

      if (newLead.hrEmail) {
        const contactExists = contacts.some(
          (c) => c.email.toLowerCase() === newLead.hrEmail.toLowerCase()
        );
        if (!contactExists) {
          newContacts.push({
            id: `CNT-${Date.now()}-${maxId}`,
            company: newLead.companyName,
            contactName: newLead.contactPersonName || 'Tim Recruitment',
            position: newLead.contactPersonRole || 'Talent Acquisition',
            email: newLead.hrEmail,
            linkedin: newLead.linkedin || '',
            source: newLead.emailSource || 'Google Harvester',
            verificationStatus: 'Job Portal',
            lastVerified: new Date().toISOString().split('T')[0],
            notes: `Diimpor otomatis dari Google Harvester (Posisi: ${newLead.targetPosition})`,
          });
        }
      }
    }

    setLeads((prev) => [...newLeads, ...prev]);
    if (newContacts.length > 0) {
      setContacts((prev) => [...newContacts, ...prev]);
    }
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const handleDeleteLead = (id: string) => {
    if (confirm('Hapus target lead ini?')) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    }
  };

  // Contacts CRUD
  const handleAddContact = (newContact: Contact) => {
    setContacts((prev) => [newContact, ...prev]);
  };

  const handleDeleteContact = (id: string) => {
    if (confirm('Hapus kontak ini?')) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Applications CRUD
  const handleAddApplication = (newApp: JobApplication) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleUpdateApplication = (updated: JobApplication) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleteApplication = (id: string) => {
    if (confirm('Hapus lamaran ini?')) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Google Sheets Export
  const handleDeployToGoogleSheets = async () => {
    if (!accessToken) {
      alert('Harap Sign in with Google terlebih dahulu untuk menghubungkan Google Sheets.');
      handleLogin();
      return;
    }

    try {
      setIsDeployingToSheet(true);
      const res = await createJobHuntingSpreadsheet(accessToken, {
        leads,
        contacts,
        applications,
      });

      setGoogleSheetUrl(res.spreadsheetUrl);
      localStorage.setItem('jobhunting_crm_sheet_url', res.spreadsheetUrl);
      alert(`Berhasil membuat Google Sheets!\n\nAnda dapat membuka link di toolbar atau tab Blueprint.`);
    } catch (err: any) {
      console.error('Error creating sheet:', err);
      alert(err.message || 'Gagal membuat Google Sheets. Pastikan izin akses telah disetujui.');
    } finally {
      setIsDeployingToSheet(false);
    }
  };

  // Counts
  const dueTasksCount = applications.filter((a) => a.followUpStatus === 'Follow-up diperlukan').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setLeadFilterStatus(undefined);
        }}
        user={user}
        isLoggingIn={isLoggingIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
        leadsCount={leads.length}
        contactsCount={contacts.length}
        applicationsCount={applications.length}
        dueTasksCount={dueTasksCount}
        googleSheetUrl={googleSheetUrl}
        onExportToSheet={handleDeployToGoogleSheets}
        isExportingToSheet={isDeployingToSheet}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            leads={leads}
            applications={applications}
            onOpenEmailModal={handleOpenEmailModal}
            onOpenScheduleModal={handleOpenScheduleModal}
            onNavigateToLeads={(filter) => {
              setLeadFilterStatus(filter);
              setActiveTab('leads');
            }}
            onNavigateToApplications={() => setActiveTab('applications')}
            onNavigateToHarvester={() => setActiveTab('harvester')}
          />
        )}

        {activeTab === 'harvester' && (
          <GoogleHarvesterView
            onImportLeads={handleBatchImportLeads}
            onDirectEmail={(companyName, contactEmail, position, contactName) => {
              handleOpenEmailModal({
                to: contactEmail,
                companyName,
                position,
                contactName,
              });
            }}
            existingLeads={leads}
            onNavigateToLeads={() => setActiveTab('leads')}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsView
            leads={leads}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
            onOpenEmailModal={handleOpenEmailModal}
            initialFilterStatus={leadFilterStatus}
            onNavigateToHarvester={() => setActiveTab('harvester')}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsView
            contacts={contacts}
            onAddContact={handleAddContact}
            onDeleteContact={handleDeleteContact}
            onOpenEmailModal={handleOpenEmailModal}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationsView
            applications={applications}
            onAddApplication={handleAddApplication}
            onUpdateApplication={handleUpdateApplication}
            onDeleteApplication={handleDeleteApplication}
            onOpenEmailModal={handleOpenEmailModal}
            onOpenScheduleModal={handleOpenScheduleModal}
          />
        )}

        {activeTab === 'blueprint' && (
          <BlueprintView
            leads={leads}
            contacts={contacts}
            applications={applications}
            googleSheetUrl={googleSheetUrl}
            onDeployToSheet={handleDeployToGoogleSheets}
            isDeploying={isDeployingToSheet}
            isAuthenticated={!!user}
            onLogin={handleLogin}
          />
        )}
      </main>

      {/* Email Composer Modal (Gmail API with User Confirmation) */}
      <EmailModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal((prev) => ({ ...prev, isOpen: false }))}
        accessToken={accessToken}
        defaultTo={emailModal.to}
        companyName={emailModal.companyName}
        contactName={emailModal.contactName}
        position={emailModal.position}
        onSentSuccess={(sentData: { to: string; subject: string; dateSent: string }) => {
          // Check if application exists; if not, automatically record it
          const existingApp = applications.find(
            (a) => a.company.toLowerCase() === emailModal.companyName.toLowerCase()
          );

          if (existingApp) {
            handleUpdateApplication({
              ...existingApp,
              currentStatus: 'Sent',
              dateSent: new Date().toISOString().split('T')[0],
              emailVersion: sentData.subject,
            });
          } else {
            handleAddApplication({
              id: `APP-${String(applications.length + 1).padStart(3, '0')}`,
              company: emailModal.companyName,
              position: emailModal.position || 'Target Position',
              contactEmail: sentData.to,
              dateSent: new Date().toISOString().split('T')[0],
              emailVersion: 'Direct Outreach via Gmail',
              cvVersion: 'CV_Sales_B2B_2026.pdf',
              portfolioLink: 'https://myportfolio.id',
              daysSinceApplication: 0,
              followUp1Date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
              followUp2Date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
              followUpStatus: 'Belum waktunya follow-up',
              currentStatus: 'Sent',
              result: 'Pending',
              notes: `Email terkirim: ${sentData.subject}`,
            });
          }

          // Also update Lead status
          const targetLead = leads.find(
            (l) => l.companyName.toLowerCase() === emailModal.companyName.toLowerCase()
          );
          if (targetLead) {
            handleUpdateLead({
              ...targetLead,
              leadStatus: 'Contacted',
              applicationStatus: 'Sent',
              dateApplied: new Date().toISOString().split('T')[0],
              followUp1Date: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
              followUp2Date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
            });
          }
        }}
      />

      {/* Schedule Interview Modal (Google Calendar API with User Confirmation) */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal((prev) => ({ ...prev, isOpen: false }))}
        accessToken={accessToken}
        companyName={scheduleModal.companyName}
        position={scheduleModal.position}
        contactEmail={scheduleModal.contactEmail}
        onScheduledSuccess={(eventDetails) => {
          const existingApp = applications.find(
            (a) => a.company.toLowerCase() === scheduleModal.companyName.toLowerCase()
          );
          if (existingApp) {
            handleUpdateApplication({
              ...existingApp,
              currentStatus: 'Interview',
              result: 'Interview',
              interviewDate: eventDetails.date,
              notes: `${existingApp.notes ? existingApp.notes + ' | ' : ''}Jadwal Calendar: ${eventDetails.date}`,
            });
          }
        }}
      />
    </div>
  );
}
