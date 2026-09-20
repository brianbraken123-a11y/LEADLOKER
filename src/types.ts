export type VacancyStatus = 'Active' | 'Open Application' | 'Unknown' | 'Closed';
export type Priority = 'A' | 'B' | 'C';
export type LeadStatus = 'Researching' | 'Ready' | 'Contacted' | 'Follow-up' | 'Interview' | 'Rejected' | 'No Response' | 'Closed';
export type ApplicationStatus = 'Not Sent' | 'Sent' | 'Follow-up 1' | 'Follow-up 2' | 'Interview' | 'Rejected' | 'Accepted' | 'No Response';
export type ResultStatus = 'Pending' | 'Rejected' | 'Interview' | 'Offer' | 'Accepted' | 'No Response';
export type VerificationStatus = 'Verified Official Website' | 'Verified LinkedIn' | 'Job Portal' | 'Unverified';
export type FollowUpStatus = 'Belum dikirim' | 'Belum waktunya follow-up' | 'Follow-up diperlukan' | 'Follow-up sudah dilakukan' | 'Selesai';

export interface Lead {
  id: string; // Lead ID (e.g., LD-001)
  companyName: string;
  industry: string;
  city: string;
  website: string;
  linkedin: string;
  instagram: string;
  contactPersonName: string;
  contactPersonRole: string;
  hrEmail: string;
  emailSource: string;
  targetPosition: string;
  jobLink: string;
  vacancyStatus: VacancyStatus;
  fitReason: string;
  relevantSkills: string[];
  fitScore: number;
  priority: Priority;
  dateFound: string; // YYYY-MM-DD
  leadStatus: LeadStatus;
  dateApplied?: string; // YYYY-MM-DD
  followUp1Date?: string; // YYYY-MM-DD
  followUp2Date?: string; // YYYY-MM-DD
  applicationStatus: ApplicationStatus;
  result: ResultStatus;
  notes: string;
}

export interface Contact {
  id: string;
  company: string;
  contactName: string;
  position: string;
  email: string;
  linkedin: string;
  source: string;
  verificationStatus: VerificationStatus;
  lastVerified: string;
  notes: string;
}

export interface JobApplication {
  id: string; // APP-001
  leadId?: string;
  company: string;
  position: string;
  contactEmail: string;
  dateSent: string; // YYYY-MM-DD
  emailVersion: string;
  cvVersion: string;
  portfolioLink: string;
  daysSinceApplication: number;
  followUp1Date: string;
  followUp2Date: string;
  followUpStatus: FollowUpStatus;
  currentStatus: ApplicationStatus;
  responseDate?: string;
  interviewDate?: string;
  result: ResultStatus;
  notes: string;
}

export interface FitScoreDetails {
  totalScore: number;
  skillMatchScore: number;
  jobAccessibilityScore: number;
  companyFitScore: number;
  skillMatches: string[];
  accessibilityMatches: string[];
  companyFitMatches: string[];
}
