/**
 * Eligibility Matcher - Core Matching Engine
 * 
 * PURPOSE: Match user eligibility profiles to government benefits/grants/programs
 * MODE: Controlled sandbox testing - NO automatic sending
 * APPROVAL: Founder review required before any user communication
 */

import { getDb } from '../db';

/**
 * Score a profile against a program's eligibility criteria
 * @param {Object} profile - User eligibility profile
 * @param {Object} program - Program eligibility requirements
 * @returns {number} Score 0-100
 */
function calculateEligibilityScore(profile, program) {
  let score = 0;
  let maxScore = 0;

  // Income matching (40 points)
  maxScore += 40;
  if (program.incomeLimit) {
    const userIncome = parseIncomeRange(profile.monthlyIncomeRange);
    const programLimit = program.incomeLimit;
    
    if (userIncome.max <= programLimit) {
      score += 40; // Fully eligible
    } else if (userIncome.min <= programLimit) {
      score += 20; // Partially eligible
    }
  } else {
    score += 40; // No income limit = everyone qualifies
  }

  // Geographic matching (20 points)
  maxScore += 20;
  if (program.geographic) {
    if (program.geographic === 'federal') {
      score += 20; // Federal programs available everywhere
    } else if (program.geographic === 'state' && profile.zipCode) {
      const userState = getStateFromZip(profile.zipCode);
      if (userState === program.state) {
        score += 20;
      }
    } else if (program.geographic === 'local' && profile.zipCode) {
      if (program.zipCodes && program.zipCodes.includes(profile.zipCode)) {
        score += 20;
      }
    }
  } else {
    score += 20; // No geographic restriction
  }

  // Household size matching (10 points)
  maxScore += 10;
  if (program.householdSizeMin && program.householdSizeMax) {
    if (profile.householdSize >= program.householdSizeMin && 
        profile.householdSize <= program.householdSizeMax) {
      score += 10;
    }
  } else {
    score += 10; // No household restriction
  }

  // Housing status matching (10 points)
  maxScore += 10;
  if (program.housingStatuses) {
    if (program.housingStatuses.includes(profile.housingStatus)) {
      score += 10;
    }
  } else {
    score += 10; // No housing restriction
  }

  // Employment status matching (10 points)
  maxScore += 10;
  if (program.employmentStatuses) {
    if (program.employmentStatuses.includes(profile.employmentStatus)) {
      score += 10;
    }
  } else {
    score += 10; // No employment restriction
  }

  // Special circumstances bonus (10 points)
  maxScore += 10;
  if (program.priorityGroups && profile.specialCircumstances) {
    const circumstances = JSON.parse(profile.specialCircumstances || '[]');
    const matchingCircumstances = circumstances.filter(c => 
      program.priorityGroups.includes(c)
    );
    if (matchingCircumstances.length > 0) {
      score += 10;
    }
  } else {
    score += 10; // No special requirements
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Parse monthly income range string to min/max numbers
 */
function parseIncomeRange(rangeString) {
  if (!rangeString) return { min: 0, max: 0 };
  
  const ranges = {
    '$0-$1000': { min: 0, max: 1000 },
    '$1000-$2000': { min: 1000, max: 2000 },
    '$2000-$3000': { min: 2000, max: 3000 },
    '$3000-$4000': { min: 3000, max: 4000 },
    '$4000-$5000': { min: 4000, max: 5000 },
    '$5000-$7500': { min: 5000, max: 7500 },
    '$7500-$10000': { min: 7500, max: 10000 },
    '$10000+': { min: 10000, max: 999999 },
  };
  
  return ranges[rangeString] || { min: 0, max: 0 };
}

/**
 * Get state code from ZIP code (simplified - would need full ZIP database)
 */
function getStateFromZip(zipCode) {
  if (!zipCode) return null;
  
  // Simplified mapping - in production, use a full ZIP code database
  const zip = parseInt(zipCode);
  if (zip >= 30000 && zip <= 31999) return 'GA'; // Georgia
  if (zip >= 90000 && zip <= 96699) return 'CA'; // California
  if (zip >= 10000 && zip <= 14999) return 'NY'; // New York
  // Add more states as needed
  
  return null;
}

/**
 * Get all available programs (placeholder - will connect to real data sources)
 */
async function getAllPrograms() {
  // TODO: Connect to Benefits.gov API, state databases, grants.gov
  // For now, return sample programs for testing
  
  return [
    {
      id: 'snap-federal',
      name: 'SNAP (Food Stamps)',
      category: 'Food Assistance',
      description: 'Monthly benefits to buy food',
      geographic: 'federal',
      incomeLimit: 2500, // Monthly for household of 3
      householdSizeMin: 1,
      householdSizeMax: 20,
      estimatedValue: '$200-$500/month',
      deadline: 'Rolling applications',
      documentsNeeded: ['Proof of income', 'ID', 'Proof of address'],
      applicationUrl: 'https://www.benefits.gov/benefit/361',
      priorityGroups: ['senior', 'disability', 'single-parent'],
    },
    {
      id: 'liheap-federal',
      name: 'LIHEAP (Utility Assistance)',
      category: 'Housing/Utilities',
      description: 'Help paying heating and cooling bills',
      geographic: 'federal',
      incomeLimit: 3000,
      housingStatuses: ['rent', 'own'],
      estimatedValue: '$300-$1000/year',
      deadline: 'Seasonal (Oct-Mar)',
      documentsNeeded: ['Utility bills', 'Proof of income', 'Lease or mortgage'],
      applicationUrl: 'https://www.benefits.gov/benefit/623',
    },
    {
      id: 'section8-federal',
      name: 'Section 8 Housing Voucher',
      category: 'Housing',
      description: 'Rental assistance for low-income families',
      geographic: 'federal',
      incomeLimit: 2000,
      housingStatuses: ['rent', 'homeless', 'at-risk'],
      estimatedValue: '$500-$1500/month',
      deadline: 'Waitlist varies by location',
      documentsNeeded: ['Income verification', 'ID', 'Rental history'],
      applicationUrl: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8',
      priorityGroups: ['veteran', 'disability', 'senior'],
    },
    {
      id: 'medicaid-federal',
      name: 'Medicaid',
      category: 'Healthcare',
      description: 'Free or low-cost health coverage',
      geographic: 'federal',
      incomeLimit: 2500,
      estimatedValue: 'Full health coverage',
      deadline: 'Rolling applications',
      documentsNeeded: ['Proof of income', 'ID', 'SSN'],
      applicationUrl: 'https://www.medicaid.gov/medicaid/index.html',
    },
    {
      id: 'tanf-federal',
      name: 'TANF (Cash Assistance)',
      category: 'Cash Assistance',
      description: 'Temporary cash assistance for families',
      geographic: 'federal',
      incomeLimit: 1500,
      householdSizeMin: 2,
      estimatedValue: '$200-$600/month',
      deadline: 'Rolling applications',
      documentsNeeded: ['Proof of income', 'Birth certificates', 'ID'],
      applicationUrl: 'https://www.benefits.gov/benefit/613',
      priorityGroups: ['single-parent', 'pregnant'],
    },
  ];
}

/**
 * Match a single profile to all programs
 */
export async function matchProfileToPrograms(profile) {
  const programs = await getAllPrograms();
  const matches = [];

  for (const program of programs) {
    const score = calculateEligibilityScore(profile, program);
    
    if (score >= 50) { // Only include programs with 50%+ match
      matches.push({
        program,
        score,
        eligibilityNotes: generateEligibilityNotes(profile, program, score),
      });
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Generate human-readable eligibility notes
 */
function generateEligibilityNotes(profile, program, score) {
  const notes = [];

  if (score === 100) {
    notes.push('✅ You appear to be fully eligible for this program.');
  } else if (score >= 80) {
    notes.push('✅ You likely qualify for this program.');
  } else if (score >= 60) {
    notes.push('⚠️ You may qualify - additional verification needed.');
  } else {
    notes.push('⚠️ Eligibility uncertain - contact program for details.');
  }

  // Income notes
  if (program.incomeLimit) {
    const userIncome = parseIncomeRange(profile.monthlyIncomeRange);
    if (userIncome.max <= program.incomeLimit) {
      notes.push(`✅ Your income (${profile.monthlyIncomeRange}) is within the limit ($${program.incomeLimit}/month).`);
    } else {
      notes.push(`⚠️ Your income may exceed the limit ($${program.incomeLimit}/month). Verify with program.`);
    }
  }

  // Special circumstances bonus
  if (program.priorityGroups && profile.specialCircumstances) {
    const circumstances = JSON.parse(profile.specialCircumstances || '[]');
    const matchingCircumstances = circumstances.filter(c => 
      program.priorityGroups.includes(c)
    );
    if (matchingCircumstances.length > 0) {
      notes.push(`⭐ Priority consideration: ${matchingCircumstances.join(', ')}`);
    }
  }

  return notes.join('\n');
}

/**
 * Run matching for all pending profiles
 * CONTROLLED MODE: Generates draft reports, does NOT send anything
 */
export async function runMatchingForAllProfiles() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Get all profiles with consent that haven't been matched yet
  const profilesResult = await db.execute(
    `SELECT * FROM eligibility_profiles 
     WHERE benefitsConsent = true 
     AND matchingStatus = 'pending'`
  );
  
  const profiles = Array.isArray(profilesResult) ? profilesResult : profilesResult.rows || [];

  const results = [];

  for (const profile of profiles) {
    try {
      const matches = await matchProfileToPrograms(profile);
      
      // Calculate overall matching score (average of top 3 matches)
      const topMatches = matches.slice(0, 3);
      const avgScore = topMatches.length > 0
        ? Math.round(topMatches.reduce((sum, m) => sum + m.score, 0) / topMatches.length)
        : 0;

      // Update profile with matches
      const matchedProgramsJson = JSON.stringify(matches).replace(/'/g, "''");
      await db.execute(
        `UPDATE eligibility_profiles 
         SET matchingStatus = 'draft',
             matchingScore = ${avgScore},
             matchedPrograms = '${matchedProgramsJson}',
             reportGeneratedAt = NOW()
         WHERE id = ${profile.id}`
      );

      results.push({
        profileId: profile.id,
        userEmail: profile.userEmail,
        matchCount: matches.length,
        avgScore,
        status: 'draft',
      });
    } catch (error) {
      console.error(`[Matching] Error processing profile ${profile.id}:`, error);
      results.push({
        profileId: profile.id,
        userEmail: profile.userEmail,
        error: error.message,
        status: 'error',
      });
    }
  }

  return results;
}
