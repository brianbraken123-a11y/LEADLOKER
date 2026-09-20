import { Lead, Contact, JobApplication } from '../types';

/**
 * Creates a brand new Google Sheets document in the user's Google Drive
 * populated with DASHBOARD, LEADS, CONTACTS, and APPLICATIONS sheets.
 */
export async function createJobHuntingSpreadsheet(
  accessToken: string,
  data: { leads: Lead[]; contacts: Contact[]; applications: JobApplication[] }
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: `Job Hunting CRM Outbound - ${new Date().toISOString().split('T')[0]}`,
      },
      sheets: [
        { properties: { title: 'DASHBOARD', tabColor: { red: 0.1, green: 0.5, blue: 0.9 } } },
        { properties: { title: 'LEADS', tabColor: { red: 0.2, green: 0.7, blue: 0.3 } } },
        { properties: { title: 'CONTACTS', tabColor: { red: 0.9, green: 0.6, blue: 0.1 } } },
        { properties: { title: 'APPLICATIONS', tabColor: { red: 0.6, green: 0.3, blue: 0.9 } } },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat Google Sheets: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Prepare initial batch data for LEADS
  const leadsHeaders = [
    'Lead ID', 'Nama Perusahaan', 'Industri', 'Kota', 'Website', 'LinkedIn', 'Instagram',
    'Nama Contact Person', 'Jabatan Contact Person', 'Email HR/Recruitment', 'Sumber Email',
    'Posisi yang Ditarget', 'Link Lowongan', 'Status Lowongan', 'Alasan Cocok dengan Skill',
    'Skill Paling Relevan', 'Fit Score', 'Prioritas', 'Tanggal Ditemukan', 'Status Lead',
    'Tanggal Lamaran', 'Follow-up 1', 'Follow-up 2', 'Status Lamaran', 'Hasil', 'Catatan'
  ];

  const leadsRows = data.leads.map((l) => [
    l.id, l.companyName, l.industry, l.city, l.website, l.linkedin, l.instagram,
    l.contactPersonName, l.contactPersonRole, l.hrEmail, l.emailSource,
    l.targetPosition, l.jobLink, l.vacancyStatus, l.fitReason,
    l.relevantSkills.join(', '), l.fitScore, l.priority, l.dateFound, l.leadStatus,
    l.dateApplied || '', l.followUp1Date || '', l.followUp2Date || '',
    l.applicationStatus, l.result, l.notes
  ]);

  // Contacts
  const contactsHeaders = [
    'Company', 'Contact Name', 'Position', 'Email', 'LinkedIn', 'Source',
    'Verification Status', 'Last Verified', 'Notes'
  ];

  const contactsRows = data.contacts.map((c) => [
    c.company, c.contactName, c.position, c.email, c.linkedin, c.source,
    c.verificationStatus, c.lastVerified, c.notes
  ]);

  // Applications
  const applicationsHeaders = [
    'Application ID', 'Company', 'Position', 'Contact Email', 'Date Sent',
    'Email Version', 'CV Version', 'Portfolio Link', 'Days Since Application',
    'Follow-up 1 Date', 'Follow-up 2 Date', 'Follow-up Status', 'Current Status',
    'Response Date', 'Interview Date', 'Result', 'Notes'
  ];

  const applicationsRows = data.applications.map((a, idx) => {
    const rowNum = idx + 2;
    return [
      a.id, a.company, a.position, a.contactEmail, a.dateSent,
      a.emailVersion, a.cvVersion, a.portfolioLink,
      `=IF(ISBLANK(E${rowNum}), "", TODAY()-E${rowNum})`,
      a.followUp1Date, a.followUp2Date,
      `=IFS(ISBLANK(E${rowNum}), "Belum dikirim", OR(M${rowNum}="Interview", M${rowNum}="Accepted", M${rowNum}="Rejected"), "Selesai", AND(TODAY()>=J${rowNum}, ISBLANK(N${rowNum}), M${rowNum}="Sent"), "Follow-up diperlukan", AND(TODAY()<J${rowNum}, M${rowNum}="Sent"), "Belum waktunya follow-up", AND(M${rowNum}="Follow-up 1", TODAY()>=K${rowNum}, ISBLANK(N${rowNum})), "Follow-up diperlukan", AND(M${rowNum}="Follow-up 1", TODAY()<K${rowNum}), "Belum waktunya follow-up", M${rowNum}="Follow-up 2", "Follow-up sudah dilakukan", TRUE, "Selesai")`,
      a.currentStatus, a.responseDate || '', a.interviewDate || '', a.result, a.notes
    ];
  });

  // Dashboard structure
  const dashboardValues = [
    ['JOB HUNTING TRACKER / CRM PRIBADI', '', '', '', '', '', ''],
    ['Metrik Utama', 'Formula / Nilai', '', 'Kategori Konversi', 'Formula / Nilai', '', ''],
    ['Total Perusahaan Ditemukan', '=COUNTA(LEADS!A2:A)', '', 'Response Rate', '=IFERROR(COUNTIF(APPLICATIONS!N2:N, "<>")/COUNTIF(APPLICATIONS!M2:M, "<>Not Sent"), 0)', '', ''],
    ['Total Lead Aktif', '=COUNTIF(LEADS!T2:T, "<>Closed")', '', 'Interview Rate', '=IFERROR(COUNTIF(APPLICATIONS!P2:P, "Interview")/COUNTIF(APPLICATIONS!M2:M, "<>Not Sent"), 0)', '', ''],
    ['Total Perusahaan Prioritas A', '=COUNTIF(LEADS!R2:R, "A")', '', 'Offer Rate', '=IFERROR((COUNTIF(APPLICATIONS!P2:P, "Offer")+COUNTIF(APPLICATIONS!P2:P, "Accepted"))/COUNTIF(APPLICATIONS!M2:M, "<>Not Sent"), 0)', '', ''],
    ['Total Lamaran Terkirim', '=COUNTIF(APPLICATIONS!M2:M, "<>Not Sent")', '', '', '', '', ''],
    ['Total Follow-up', '=COUNTIF(APPLICATIONS!M2:M, "Follow-up 1")+COUNTIF(APPLICATIONS!M2:M, "Follow-up 2")', '', '', '', '', ''],
    ['Total Interview', '=COUNTIF(APPLICATIONS!P2:P, "Interview")', '', '', '', '', ''],
    ['Total Rejection', '=COUNTIF(APPLICATIONS!P2:P, "Rejected")', '', '', '', '', ''],
    ['Total No Response', '=COUNTIF(APPLICATIONS!P2:P, "No Response")', '', '', '', '', ''],
    ['Total Offer', '=COUNTIF(APPLICATIONS!P2:P, "Offer")+COUNTIF(APPLICATIONS!P2:P, "Accepted")', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['DAILY WORKFLOW / PEKERJAAN HARI INI', '', '', '', '', '', ''],
    ['Tugas', 'Kondisi', 'Jumlah', '', '', '', ''],
    ['Lead Baru Perlu Diriset', 'Status Lead = Researching', '=COUNTIF(LEADS!T2:T, "Researching")', '', '', '', ''],
    ['Perusahaan Siap Dikirim Lamaran', 'Status Lead = Ready', '=COUNTIF(LEADS!T2:T, "Ready")', '', '', '', ''],
    ['Follow-up Jatuh Tempo Hari Ini', 'Follow-up Status = Follow-up diperlukan', '=COUNTIF(APPLICATIONS!L2:L, "Follow-up diperlukan")', '', '', '', ''],
    ['Interview yang Akan Datang', 'Hasil = Interview', '=COUNTIF(APPLICATIONS!P2:P, "Interview")', '', '', '', ''],
    ['Lamaran Tanpa Respons > 7 Hari', 'Sent > 7 hari & Belum Respons', '=COUNTIFS(APPLICATIONS!M2:M, "Sent", APPLICATIONS!I2:I, ">7")', '', '', '', ''],
  ];

  // Batch update all 4 sheets
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        { range: 'LEADS!A1', values: [leadsHeaders, ...leadsRows] },
        { range: 'CONTACTS!A1', values: [contactsHeaders, ...contactsRows] },
        { range: 'APPLICATIONS!A1', values: [applicationsHeaders, ...applicationsRows] },
        { range: 'DASHBOARD!A1', values: dashboardValues },
      ],
    }),
  });

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Send an email directly using Gmail API
 */
export async function sendGmailEmail(
  accessToken: string,
  params: {
    to: string;
    subject: string;
    bodyText: string;
    bodyHtml?: string;
  }
): Promise<{ id: string; threadId: string }> {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  const messageParts = [
    `To: ${params.to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    params.bodyHtml || params.bodyText.replace(/\n/g, '<br/>'),
  ];
  const message = messageParts.join('\r\n');

  // Base64url encode
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(`Gagal mengirim email melalui Gmail: ${errorMsg}`);
  }

  return await res.json();
}

/**
 * Schedule an Interview event on Google Calendar
 */
export async function scheduleCalendarInterview(
  accessToken: string,
  params: {
    summary: string;
    company: string;
    position: string;
    startDateTime: string; // ISO 8601 string
    endDateTime: string; // ISO 8601 string
    contactEmail?: string;
    notes?: string;
  }
): Promise<{ id: string; htmlLink: string }> {
  const eventPayload: any = {
    summary: params.summary,
    description: `Interview untuk posisi ${params.position} di ${params.company}.\n\nCatatan:\n${params.notes || 'Persiapkan portfolio dan case study.'}`,
    start: {
      dateTime: params.startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jakarta',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 1440 }, // 1 day before
      ],
    },
  };

  if (params.contactEmail && params.contactEmail.includes('@')) {
    eventPayload.attendees = [{ email: params.contactEmail }];
  }

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(eventPayload),
  });

  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(`Gagal menjadwalkan ke Google Calendar: ${errorMsg}`);
  }

  return await res.json();
}
