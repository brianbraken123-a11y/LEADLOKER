import { FitScoreDetails } from '../types';

export const USER_SKILLS = [
  'Sales',
  'B2B Sales',
  'Business Development',
  'Marketing Communication',
  'Content Marketing',
  'Storytelling',
  'Copywriting',
  'Public Speaking',
  'Customer Relationship',
  'Social Media Content',
];

export const TARGET_INDUSTRIES = [
  'Startup',
  'SME / UMKM Berkembang',
  'Digital Agency',
  'Consumer Brand / FMCG',
  'F&B',
  'Retail',
  'Technology / SaaS',
  'B2B Company',
  'Media / Creative Company',
];

export function calculateFitScore(params: {
  targetPosition: string;
  industry: string;
  fitReason: string;
  selectedSkills?: string[];
  notes?: string;
}): FitScoreDetails {
  const textToScan = `${params.targetPosition} ${params.industry} ${params.fitReason} ${params.notes || ''}`.toLowerCase();

  // 1. Skill Match (Max 40 points)
  let skillMatchScore = 0;
  const skillMatches: string[] = [];

  const skillKeywords: Record<string, { regex: RegExp; points: number }> = {
    'Sales & B2B': { regex: /sales|b2b|account exec|inside sales|commercial|closing/i, points: 12 },
    'Business Development': { regex: /business dev|bd|partnership|lead gen|outbound/i, points: 10 },
    'Marketing & Marcom': { regex: /marketing|marcom|campaign|brand|growth/i, points: 8 },
    'Storytelling & Content': { regex: /content|storytelling|copywrit|social media|creative/i, points: 10 },
    'Customer & Client Relationship': { regex: /customer|client|relationship|account management|public speaking/i, points: 8 },
  };

  // Check manual selected skills first if provided
  if (params.selectedSkills && params.selectedSkills.length > 0) {
    const directPoints = Math.min(40, params.selectedSkills.length * 6);
    skillMatchScore = Math.max(skillMatchScore, directPoints);
    skillMatches.push(...params.selectedSkills);
  }

  for (const [skillName, meta] of Object.entries(skillKeywords)) {
    if (meta.regex.test(textToScan)) {
      if (!skillMatches.includes(skillName)) {
        skillMatches.push(skillName);
        skillMatchScore += meta.points;
      }
    }
  }
  skillMatchScore = Math.min(40, Math.max(10, skillMatchScore));

  // 2. Job Accessibility (Max 35 points)
  let jobAccessibilityScore = 0;
  const accessibilityMatches: string[] = [];

  // Posisi level realistis (junior / mid / specialist / associate)
  if (/junior|associate|specialist|officer|staff|representative|executive|coordinator/i.test(textToScan)) {
    jobAccessibilityScore += 12;
    accessibilityMatches.push('Posisi entry/junior/mid-level realistis (+12)');
  } else if (!/director|vp|vice president|c-level|head/i.test(textToScan)) {
    jobAccessibilityScore += 8;
    accessibilityMatches.push('Level posisi dapat diakses (+8)');
  }

  // Portfolio dapat digunakan
  if (/portfolio|tulisan|script|video|konten|website|case study/i.test(textToScan)) {
    jobAccessibilityScore += 12;
    accessibilityMatches.push('Portfolio tulisan/konten/script dapat langsung dilampirkan (+12)');
  } else {
    jobAccessibilityScore += 8;
    accessibilityMatches.push('Portfolio umum relevan (+8)');
  }

  // Syarat pengalaman praktis tanpa syarat kaku
  if (/pengalaman|komunikasi|b2b|klien|customer/i.test(textToScan)) {
    jobAccessibilityScore += 11;
    accessibilityMatches.push('Menilai bukti pengalaman komunikasi & customer nyata (+11)');
  } else {
    jobAccessibilityScore += 8;
    accessibilityMatches.push('Aksesibilitas dasar (+8)');
  }
  jobAccessibilityScore = Math.min(35, jobAccessibilityScore);

  // 3. Company Fit (Max 25 points)
  let companyFitScore = 0;
  const companyFitMatches: string[] = [];

  if (/startup|agency|creative|saas|tech|digital/i.test(textToScan)) {
    companyFitScore += 15;
    companyFitMatches.push('Tipe perusahaan dinamis & terbuka outbound pitch (Startup/Agency/Tech) (+15)');
  } else if (/f&b|retail|consumer brand|fmcg|b2b/i.test(textToScan)) {
    companyFitScore += 13;
    companyFitMatches.push('Industri customer/B2B intensif (F&B/Retail/B2B) (+13)');
  } else {
    companyFitScore += 8;
    companyFitMatches.push('Sektor umum (+8)');
  }

  if (/sme|umkm|berkembang|growth|ekspansi|scaling|b2b/i.test(textToScan)) {
    companyFitScore += 10;
    companyFitMatches.push('Perusahaan dalam fase berkembang/scaling (+10)');
  } else {
    companyFitScore += 7;
    companyFitMatches.push('Kesesuaian skala (+7)');
  }
  companyFitScore = Math.min(25, companyFitScore);

  const totalScore = Math.min(100, Math.round(skillMatchScore + jobAccessibilityScore + companyFitScore));

  return {
    totalScore,
    skillMatchScore,
    jobAccessibilityScore,
    companyFitScore,
    skillMatches,
    accessibilityMatches,
    companyFitMatches,
  };
}
